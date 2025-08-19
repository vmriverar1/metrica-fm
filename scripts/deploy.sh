#!/bin/bash

# FASE 6: Script de Deployment para Producción
# 
# Script completo para deployment en diferentes plataformas:
# - Firebase Hosting
# - Vercel
# - cPanel
# - Docker
#
# Usage: ./scripts/deploy.sh [platform] [environment]
# Example: ./scripts/deploy.sh firebase production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/.next"
OUT_DIR="$PROJECT_ROOT/out"
DOCKER_IMAGE_NAME="metrica-app"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Default values
PLATFORM=${1:-firebase}
ENVIRONMENT=${2:-production}
SKIP_TESTS=${SKIP_TESTS:-false}
SKIP_BUILD=${SKIP_BUILD:-false}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is required but not installed"
        exit 1
    fi
    
    # Platform-specific checks
    case $PLATFORM in
        firebase)
            if ! command -v firebase &> /dev/null; then
                log_error "Firebase CLI is required. Install with: npm install -g firebase-tools"
                exit 1
            fi
            ;;
        vercel)
            if ! command -v vercel &> /dev/null; then
                log_error "Vercel CLI is required. Install with: npm install -g vercel"
                exit 1
            fi
            ;;
        docker)
            if ! command -v docker &> /dev/null; then
                log_error "Docker is required but not installed"
                exit 1
            fi
            ;;
    esac
    
    log_success "All requirements satisfied"
}

setup_environment() {
    log_info "Setting up environment for $ENVIRONMENT..."
    
    # Set NODE_ENV
    export NODE_ENV=$ENVIRONMENT
    export NEXT_PUBLIC_ENV=$ENVIRONMENT
    
    # Load environment-specific variables
    if [ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
        set -a
        source "$PROJECT_ROOT/.env.$ENVIRONMENT"
        set +a
        log_success "Environment variables loaded from .env.$ENVIRONMENT"
    elif [ -f "$PROJECT_ROOT/.env.local" ]; then
        set -a
        source "$PROJECT_ROOT/.env.local"
        set +a
        log_warning "Using .env.local (no environment-specific file found)"
    else
        log_warning "No environment file found, using defaults"
    fi
    
    # Validate required environment variables for production
    if [ "$ENVIRONMENT" = "production" ]; then
        required_vars=("NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_DIRECTUS_URL" "JWT_SECRET")
        
        for var in "${required_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Required environment variable $var is not set"
                exit 1
            fi
        done
        
        log_success "Production environment variables validated"
    fi
}

run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Skipping tests (SKIP_TESTS=true)"
        return
    fi
    
    log_info "Running tests..."
    
    # Type checking
    if npm run typecheck > /dev/null 2>&1; then
        log_success "TypeScript compilation passed"
    else
        log_error "TypeScript compilation failed"
        exit 1
    fi
    
    # Linting
    if npm run lint > /dev/null 2>&1; then
        log_success "Linting passed"
    else
        log_warning "Linting issues found (continuing deployment)"
    fi
    
    # Unit tests (if available)
    if grep -q '"test"' "$PROJECT_ROOT/package.json"; then
        if npm test > /dev/null 2>&1; then
            log_success "Unit tests passed"
        else
            log_error "Unit tests failed"
            exit 1
        fi
    else
        log_warning "No unit tests configured"
    fi
}

create_backup() {
    log_info "Creating deployment backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/deployment_backup_$TIMESTAMP.tar.gz"
    
    # Create backup (exclude node_modules and build artifacts)
    tar -czf "$BACKUP_FILE" \
        --exclude="node_modules" \
        --exclude=".next" \
        --exclude="out" \
        --exclude=".git" \
        --exclude="backups" \
        -C "$PROJECT_ROOT" .
    
    log_success "Backup created: $BACKUP_FILE"
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t deployment_backup_*.tar.gz | tail -n +6 | xargs -r rm --
}

build_application() {
    if [ "$SKIP_BUILD" = "true" ]; then
        log_warning "Skipping build (SKIP_BUILD=true)"
        return
    fi
    
    log_info "Building application for $PLATFORM..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Platform-specific build
    case $PLATFORM in
        firebase)
            log_info "Building for Firebase Hosting (static export)..."
            npm run build
            npm run export
            ;;
        vercel)
            log_info "Building for Vercel (Next.js)..."
            npm run build
            ;;
        cpanel)
            log_info "Building for cPanel (static export)..."
            npm run build
            npm run export
            ;;
        docker)
            log_info "Building Docker image..."
            build_docker_image
            return
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    log_success "Build completed"
}

build_docker_image() {
    log_info "Building Docker image: $DOCKER_IMAGE_NAME"
    
    # Build image
    docker build -t "$DOCKER_IMAGE_NAME:latest" -t "$DOCKER_IMAGE_NAME:$ENVIRONMENT" .
    
    # Test image
    log_info "Testing Docker image..."
    CONTAINER_ID=$(docker run -d -p 3001:3000 "$DOCKER_IMAGE_NAME:latest")
    
    # Wait for container to start
    sleep 10
    
    # Health check
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Docker image health check passed"
    else
        log_warning "Docker image health check failed"
    fi
    
    # Stop test container
    docker stop "$CONTAINER_ID" > /dev/null
    docker rm "$CONTAINER_ID" > /dev/null
    
    log_success "Docker image built and tested"
}

deploy_firebase() {
    log_info "Deploying to Firebase Hosting..."
    
    # Check if user is logged in
    if ! firebase projects:list > /dev/null 2>&1; then
        log_error "Not logged into Firebase. Run: firebase login"
        exit 1
    fi
    
    # Deploy
    firebase deploy --only hosting
    
    log_success "Deployed to Firebase Hosting"
    
    # Get deploy URL
    PROJECT_ID=$(firebase use | grep "active" | awk '{print $4}')
    if [ -n "$PROJECT_ID" ]; then
        echo
        log_success "🚀 Application deployed successfully!"
        log_info "URL: https://$PROJECT_ID.web.app"
        log_info "Custom domain (if configured): https://metrica-dip.com"
    fi
}

deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    # Deploy
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --confirm
    else
        vercel --confirm
    fi
    
    log_success "Deployed to Vercel"
}

deploy_cpanel() {
    log_info "Preparing deployment package for cPanel..."
    
    # Create deployment package
    DEPLOY_PACKAGE="$PROJECT_ROOT/metrica-deploy.zip"
    
    cd "$OUT_DIR"
    zip -r "$DEPLOY_PACKAGE" . -x "*.DS_Store" "*.git*"
    
    log_success "Deployment package created: $DEPLOY_PACKAGE"
    echo
    log_info "📦 Manual deployment steps for cPanel:"
    log_info "1. Upload $DEPLOY_PACKAGE to your cPanel File Manager"
    log_info "2. Extract the zip file to your public_html directory"
    log_info "3. Ensure .htaccess file is properly configured"
    log_info "4. Update DNS settings if using a custom domain"
}

deploy_docker() {
    log_info "Deploying Docker image..."
    
    # Tag for registry (if configured)
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker tag "$DOCKER_IMAGE_NAME:latest" "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest"
        docker tag "$DOCKER_IMAGE_NAME:latest" "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$ENVIRONMENT"
        
        # Push to registry
        docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest"
        docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$ENVIRONMENT"
        
        log_success "Docker image pushed to registry"
    else
        log_warning "No DOCKER_REGISTRY configured, image available locally only"
    fi
    
    # Create docker-compose.yml for easy deployment
    cat > "$PROJECT_ROOT/docker-compose.prod.yml" << EOF
version: '3.8'

services:
  app:
    image: $DOCKER_IMAGE_NAME:$ENVIRONMENT
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=$ENVIRONMENT
      - NEXT_PUBLIC_ENV=$ENVIRONMENT
      - NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_DIRECTUS_URL=\${NEXT_PUBLIC_DIRECTUS_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF
    
    log_success "Docker Compose configuration created"
    echo
    log_info "🐳 Docker deployment ready!"
    log_info "Run: docker-compose -f docker-compose.prod.yml up -d"
}

post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    case $PLATFORM in
        firebase)
            PROJECT_ID=$(firebase use | grep "active" | awk '{print $4}')
            URL="https://$PROJECT_ID.web.app"
            ;;
        vercel)
            # Get URL from Vercel CLI (simplified)
            URL="https://metrica-dip.vercel.app"
            ;;
        docker)
            URL="http://localhost:3000"
            ;;
        cpanel)
            log_info "Manual verification required for cPanel deployment"
            return
            ;;
    esac
    
    if [ -n "$URL" ]; then
        log_info "Testing deployed application at $URL"
        
        # Wait a bit for deployment to propagate
        sleep 30
        
        # Basic health check
        if curl -f "$URL" > /dev/null 2>&1; then
            log_success "✅ Application is responding"
        else
            log_warning "⚠️ Application may not be fully ready yet"
        fi
        
        # Test API endpoint (if available)
        if curl -f "$URL/api/health" > /dev/null 2>&1; then
            log_success "✅ API endpoints are responding"
        else
            log_warning "⚠️ API endpoints may not be available"
        fi
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove build artifacts if requested
    if [ "$CLEANUP_BUILD" = "true" ]; then
        rm -rf "$BUILD_DIR"
        rm -rf "$OUT_DIR"
        log_success "Build artifacts cleaned up"
    fi
    
    # Docker cleanup
    if [ "$PLATFORM" = "docker" ] && [ "$CLEANUP_DOCKER" = "true" ]; then
        docker image prune -f
        log_success "Docker images cleaned up"
    fi
}

show_deployment_summary() {
    echo
    echo "🎉 Deployment Summary"
    echo "===================="
    echo "Platform: $PLATFORM"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date)"
    echo "Git Commit: $(git rev-parse --short HEAD)"
    echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
    
    case $PLATFORM in
        firebase)
            PROJECT_ID=$(firebase use | grep "active" | awk '{print $4}')
            echo "URL: https://$PROJECT_ID.web.app"
            ;;
        vercel)
            echo "URL: Check Vercel dashboard for deployment URL"
            ;;
        docker)
            echo "Image: $DOCKER_IMAGE_NAME:$ENVIRONMENT"
            echo "Run: docker-compose -f docker-compose.prod.yml up -d"
            ;;
        cpanel)
            echo "Package: metrica-deploy.zip (ready for manual upload)"
            ;;
    esac
    
    echo
}

# Main execution
main() {
    echo "🚀 Métrica DIP Deployment Script"
    echo "================================"
    echo "Platform: $PLATFORM"
    echo "Environment: $ENVIRONMENT"
    echo
    
    # Pre-deployment checks
    check_requirements
    setup_environment
    
    # Create backup
    create_backup
    
    # Run tests
    run_tests
    
    # Build application
    build_application
    
    # Deploy to platform
    case $PLATFORM in
        firebase)
            deploy_firebase
            ;;
        vercel)
            deploy_vercel
            ;;
        cpanel)
            deploy_cpanel
            ;;
        docker)
            deploy_docker
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    # Post-deployment checks
    post_deployment_checks
    
    # Cleanup
    cleanup
    
    # Show summary
    show_deployment_summary
    
    log_success "🎉 Deployment completed successfully!"
}

# Show help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Métrica DIP Deployment Script"
    echo
    echo "Usage: $0 [platform] [environment] [options]"
    echo
    echo "Platforms:"
    echo "  firebase    Deploy to Firebase Hosting (default)"
    echo "  vercel      Deploy to Vercel"
    echo "  cpanel      Create package for cPanel deployment"
    echo "  docker      Build and deploy Docker image"
    echo
    echo "Environments:"
    echo "  production  Production environment (default)"
    echo "  staging     Staging environment"
    echo "  development Development environment"
    echo
    echo "Environment Variables:"
    echo "  SKIP_TESTS=true     Skip running tests"
    echo "  SKIP_BUILD=true     Skip building application"
    echo "  CLEANUP_BUILD=true  Clean build artifacts after deployment"
    echo "  CLEANUP_DOCKER=true Clean Docker images after deployment"
    echo
    echo "Examples:"
    echo "  $0                          # Deploy to Firebase (production)"
    echo "  $0 vercel staging           # Deploy to Vercel (staging)"
    echo "  $0 docker production        # Build Docker image (production)"
    echo "  SKIP_TESTS=true $0 cpanel   # Deploy to cPanel (skip tests)"
    echo
    exit 0
fi

# Execute main function
main "$@"