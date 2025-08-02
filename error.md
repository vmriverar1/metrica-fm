./src/app/portfolio/page.tsx
Error:   x You are attempting to export "metadata" from a component marked with "use client", which is disallowed. Either remove the export, or the "use client" directive. Read more: https://nextjs.org/docs/app/api-reference/directives/use-client
  |

    ,-[/root/proyectos/freelos/metrica/src/app/portfolio/page.tsx:16:1]
 13 | import PerformanceMonitor from '@/components/portfolio/PerformanceMonitor';
 14 | import { PortfolioProvider } from '@/contexts/PortfolioContext';
 15 | 
 16 | export const metadata: Metadata = {
    :              ^^^^^^^^
 17 |   title: 'Portafolio de Proyectos | Métrica DIP - Dirección Integral de Proyectos',
 18 |   description: 'Explora nuestro portafolio de proyectos de infraestructura, arquitectura y construcción en Perú. Más de 200 proyectos exitosos en oficinas, retail, industria, salud, educación y vivienda.',
 19 |   keywords: 'portafolio proyectos, construcción Perú, arquitectura, infraestructura, dirección proyectos, oficinas, retail, industria, salud, educación, vivienda',
    `----

Import trace for requested module:
./src/app/portfolio/page.tsx


> Build failed because of webpack errors