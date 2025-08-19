#!/bin/bash

# Directus Setup Script for Métrica DIP
# This script helps setup and manage the Directus development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Start Directus services
start_directus() {
    print_status "Starting Directus services..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from template..."
        cp .env.directus .env.local
        print_warning "Please update .env.local with your configuration"
    fi
    
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if Directus is responding
    for i in {1..30}; do
        if curl -s http://localhost:8055/server/health &> /dev/null; then
            print_success "Directus is ready at http://localhost:8055"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Directus failed to start after 30 attempts"
            docker-compose logs directus
            exit 1
        fi
        
        print_status "Waiting for Directus to be ready... ($i/30)"
        sleep 2
    done
}

# Stop Directus services
stop_directus() {
    print_status "Stopping Directus services..."
    docker-compose down
    print_success "Directus services stopped"
}

# Reset Directus (WARNING: This will delete all data)
reset_directus() {
    print_warning "This will DELETE ALL DATA in Directus. Are you sure? (y/N)"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            print_status "Resetting Directus..."
            docker-compose down -v
            docker-compose up -d
            print_success "Directus has been reset"
            ;;
        *)
            print_status "Reset cancelled"
            ;;
    esac
}

# Show Directus logs
show_logs() {
    docker-compose logs -f directus
}

# Show Directus status
show_status() {
    print_status "Directus Services Status:"
    docker-compose ps
    
    print_status "Checking Directus health..."
    if curl -s http://localhost:8055/server/health &> /dev/null; then
        print_success "Directus is healthy at http://localhost:8055"
    else
        print_error "Directus is not responding"
    fi
    
    print_status "Checking PostgreSQL..."
    if docker-compose exec -T postgres pg_isready -U directus &> /dev/null; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL is not ready"
    fi
}

# Create admin user
create_admin() {
    print_status "Creating admin user..."
    docker-compose exec directus npx directus users create --email admin@metrica-dip.com --password MetricaDIP2024! --role administrator
    print_success "Admin user created: admin@metrica-dip.com / MetricaDIP2024!"
}

# Generate static token
generate_token() {
    print_status "Generating static token..."
    # This would need to be implemented with the Directus API
    print_warning "Please generate a static token manually in the Directus admin panel"
    print_status "Go to http://localhost:8055/admin/settings/roles/[role-id]/static-token"
}

# Help
show_help() {
    echo "Directus Setup Script for Métrica DIP"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start Directus services"
    echo "  stop      Stop Directus services"
    echo "  restart   Restart Directus services"
    echo "  reset     Reset Directus (WARNING: Deletes all data)"
    echo "  logs      Show Directus logs"
    echo "  status    Show services status"
    echo "  admin     Create admin user"
    echo "  token     Generate static token info"
    echo "  help      Show this help message"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "start")
        check_docker
        start_directus
        ;;
    "stop")
        stop_directus
        ;;
    "restart")
        stop_directus
        sleep 2
        check_docker
        start_directus
        ;;
    "reset")
        check_docker
        reset_directus
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "admin")
        create_admin
        ;;
    "token")
        generate_token
        ;;
    "help"|*)
        show_help
        ;;
esac