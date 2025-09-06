# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

No uses estos comandos

```bash
# Development server (runs on port 9002)
npm run dev

# Build the project
npm run build
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

* **Primary Colors**: Deep blue (#003f6f) and light blue (#007bc4)
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

## Content Management

The application uses a JSON-based content system:
- Static content is stored in `/public/json/pages/` for pages
- Dynamic content is stored in `/public/json/dynamic-content/` for reusable components
- Each component or page loads its content from the corresponding JSON file

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