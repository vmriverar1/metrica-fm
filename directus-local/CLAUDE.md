# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for Métrica DIP (Dirección Integral de Proyectos), a company focused on infrastructure project management in Peru. The project uses TypeScript, Tailwind CSS, shadcn/ui components, and Firebase for hosting and AI capabilities via Genkit.

## Common Development Commands

```bash
# Development server (runs on port 9002)
npm run dev

# Build the project
npm run build

# Start production server
npm run start

# Lint the code
npm run lint

# Type checking
npm run typecheck

# Genkit AI development server
npm run genkit:dev

# Genkit AI with watch mode
npm run genkit:watch
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom animations and shadcn/ui component library
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model
- **Deployment**: Firebase App Hosting

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/landing/` - Landing page specific components (Hero, Stats, Services, Portfolio, etc.)
- `/src/components/ui/` - Reusable UI components from shadcn/ui
- `/src/ai/` - Genkit AI configuration and development files
- `/src/lib/` - Utility functions (currently just the `cn` utility for className merging)
- `/src/hooks/` - Custom React hooks

### Key Configuration Notes
- TypeScript is configured to ignore build errors (`ignoreBuildErrors: true` in next.config.ts)
- ESLint is configured to ignore during builds (`ignoreDuringBuilds: true`)
- The project uses path aliases: `@/*` maps to `./src/*`
- Tailwind uses CSS variables for theming with a dark mode class strategy
- Custom animations include: glow, shine, glitch effects, and fade-in-up

### Design System

Based on the blueprint.md, the design follows:

* **Primary Colors**: Deep blue (#003F6F) and vibrant orange (#E84E0F)
* **Secondary Colors**: Light gray (#D0D0D0), medium gray (#9D9D9C), dark gray (#646363), and deep black (#1D1D1B)
* **Typography**:

  * *Marsek Demi* for the Métrica logo
  * *Alliance No.2* for all other uses:

    * Light for metadata and contact info
    * Medium for body text and UI elements
    * ExtraBold for titles and section headers
  * Fallback: Poppins font family
* **Animations**: GSAP-style animations implemented via Tailwind keyframes

### Important Considerations

- No test files exist in the source code (all test files found were in node_modules)
- The project has build/lint errors ignored, suggesting active development
- Firebase App Hosting is configured with a single instance maximum
- The landing page is component-based with each section as a separate component

## Directus Local Configuration

### Setup and Configuration
The project includes a local Directus CMS instance for content management:

**Location**: `/directus-local/` directory
**URL**: http://localhost:8055
**Credentials**: admin@metrica-dip.com / MetricaDIP2024!

### Starting Directus Locally
```bash
# Navigate to directus-local directory
cd directus-local/

# Start Directus (already configured with SQLite)
npm start

# Or from project root:
npm run directus:start
```

### Known Issues and Solutions

#### Issue: "You don't have permission to access field 'name' in collection"
**Root Cause**: 
1. Collection created with incomplete field structure (missing `name` and `slug` fields)
2. Administrator role lacking proper `admin_access: true` configuration
3. Directus 11+ requires policy-based permissions system

**Solution Applied**:
1. **Recreated collection** with complete field structure:
   ```javascript
   fields: [
     { field: 'id', type: 'integer', primary_key: true },
     { field: 'name', type: 'string', required: true },
     { field: 'slug', type: 'string', unique: true }
   ]
   ```

2. **Fixed Administrator role**:
   ```javascript
   PATCH /roles/administrator
   {
     admin_access: true,
     app_access: true
   }
   ```

3. **Database Configuration**: SQLite doesn't allow adding NOT NULL columns to existing tables without default values. Required dropping and recreating collection.

### Hybrid System Behavior
The application uses a hybrid approach:
- **Admin panel**: Full Directus functionality at http://localhost:8055
- **Public API**: Falls back to local TypeScript data when public access isn't configured
- **Development**: Works seamlessly with local data while Directus setup is in progress

### Current Status
- ✅ Directus running on port 8055
- ✅ Admin panel fully functional
- ✅ Collections created with proper field structure
- ✅ Test data populated (7 categories)
- ✅ API accessible with admin token
- ⚠️ Public API access requires additional policy configuration

## Implementation Tracking

**IMPORTANT**: When you complete any new feature, fix, or implementation:
1. DO NOT create new markdown files to document your changes
2. Instead, append a summary to the `implementaciones.md` file
3. Keep entries concise (2-3 lines maximum per implementation)
4. Include: date, brief description, and files modified

Example format for implementaciones.md:
```
- [2025-01-27] Added dark mode toggle to header - Modified: header.tsx, globals.css
- [2025-01-27] Fixed responsive issues in portfolio section - Modified: portfolio.tsx
```