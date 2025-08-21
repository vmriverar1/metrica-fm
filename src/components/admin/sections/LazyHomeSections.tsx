'use client';

import { lazy } from 'react';
import { LazySection } from '../LazySection';

// Lazy imports de los componentes especializados
const RotatingWordsEditor = lazy(() => import('../home/RotatingWordsEditor'));
const StatisticsGrid = lazy(() => import('../home/StatisticsGrid'));
const ServiceBuilder = lazy(() => import('../home/ServiceBuilder'));
const PortfolioManager = lazy(() => import('../home/PortfolioManager'));
const PillarsEditor = lazy(() => import('../home/PillarsEditor'));
const PoliciesManager = lazy(() => import('../home/PoliciesManager'));

// Interfaces para las props de cada sección
interface LazySectionProps {
  data: any;
  onChange: (data: any) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

// Hero Section - Alta prioridad (primera impresión)
export const LazyHeroSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="hero"
    title="🎬 Hero Section"
    description="Título principal, palabras rotativas y configuración de fondo"
    priority="high"
    fieldCount={8}
    estimatedHeight="md"
    onVisibilityChange={onVisibilityChange}
    defaultExpanded={true}
  >
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Principal
          </label>
          <input
            type="text"
            value={data?.hero?.title?.main || ''}
            onChange={(e) => onChange({
              ...data,
              hero: {
                ...data?.hero,
                title: {
                  ...data?.hero?.title,
                  main: e.target.value
                }
              }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Texto principal del hero"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo
          </label>
          <input
            type="text"
            value={data?.hero?.title?.secondary || ''}
            onChange={(e) => onChange({
              ...data,
              hero: {
                ...data?.hero,
                title: {
                  ...data?.hero?.title,
                  secondary: e.target.value
                }
              }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Subtítulo del hero"
          />
        </div>
      </div>

      {/* Palabras Rotativas */}
      <div>
        <RotatingWordsEditor
          words={data?.hero?.rotating_words || []}
          onChange={(words) => onChange({
            ...data,
            hero: {
              ...data?.hero,
              rotating_words: words
            }
          })}
          maxWords={8}
          placeholder="Agregar palabra clave..."
        />
      </div>

      {/* Configuración de Fondo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video de Fondo (URL)
          </label>
          <input
            type="url"
            value={data?.hero?.background?.video_url || ''}
            onChange={(e) => onChange({
              ...data,
              hero: {
                ...data?.hero,
                background: {
                  ...data?.hero?.background,
                  video_url: e.target.value
                }
              }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opacidad del Overlay (0-1)
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={data?.hero?.background?.overlay_opacity || 0.5}
            onChange={(e) => onChange({
              ...data,
              hero: {
                ...data?.hero,
                background: {
                  ...data?.hero?.background,
                  overlay_opacity: parseFloat(e.target.value)
                }
              }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
    </div>
  </LazySection>
);

// Statistics Section - Alta prioridad (credibilidad)
export const LazyStatisticsSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="statistics"
    title="📊 Estadísticas"
    description="Grid de 4 estadísticas principales con iconos y animaciones"
    priority="high"
    fieldCount={16}
    estimatedHeight="lg"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
  >
    <StatisticsGrid
      statistics={data?.stats?.statistics || []}
      onChange={(statistics) => onChange({
        ...data,
        stats: {
          ...data?.stats,
          statistics
        }
      })}
      iconPicker={true}
      numberAnimation={true}
    />
  </LazySection>
);

// Services Section - Prioridad media (conversión)
export const LazyServicesSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="services"
    title="🔧 Servicios"
    description="Servicio principal (DIP) + 4 servicios secundarios"
    priority="medium"
    fieldCount={20}
    estimatedHeight="lg"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
  >
    <ServiceBuilder
      mainService={data?.services?.main_service || {}}
      secondaryServices={data?.services?.secondary_services || []}
      onChange={(mainService, secondaryServices) => onChange({
        ...data,
        services: {
          main_service: mainService,
          secondary_services: secondaryServices
        }
      })}
      imageUpload={true}
      iconLibrary={true}
    />
  </LazySection>
);

// Portfolio Section - Prioridad media (showcase)
export const LazyPortfolioSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="portfolio"
    title="🏗️ Portfolio"
    description="4 proyectos destacados con categorías y filtros"
    priority="medium"
    fieldCount={32}
    estimatedHeight="lg"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
  >
    <PortfolioManager
      projects={data?.portfolio?.featured_projects || []}
      onChange={(projects) => onChange({
        ...data,
        portfolio: {
          ...data?.portfolio,
          featured_projects: projects
        }
      })}
      categories={['Sanitaria', 'Educativa', 'Vial', 'Saneamiento']}
      imageUpload={true}
    />
  </LazySection>
);

// Pillars Section - Prioridad baja (institucional)
export const LazyPillarsSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="pillars"
    title="🏛️ Pilares DIP"
    description="6 pilares fundamentales de la metodología DIP"
    priority="low"
    fieldCount={48}
    estimatedHeight="lg"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
    defaultExpanded={false}
  >
    <PillarsEditor
      pillars={data?.about?.pillars || []}
      onChange={(pillars) => onChange({
        ...data,
        about: {
          ...data?.about,
          pillars
        }
      })}
      maxPillars={8}
      iconLibrary={true}
      imageUpload={true}
    />
  </LazySection>
);

// Policies Section - Prioridad baja (legal/corporativo)
export const LazyPoliciesSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="policies"
    title="📋 Políticas Corporativas"
    description="8 políticas de la empresa con templates y prioridades"
    priority="low"
    fieldCount={64}
    estimatedHeight="lg"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
    defaultExpanded={false}
  >
    <PoliciesManager
      policies={data?.corporate?.policies || []}
      onChange={(policies) => onChange({
        ...data,
        corporate: {
          ...data?.corporate,
          policies
        }
      })}
      maxPolicies={12}
      templates={[
        {
          id: 'quality',
          name: 'Política de Calidad',
          icon: 'Award',
          priority: 'high',
          template: {
            title: 'Compromiso con la Calidad',
            description: 'Nos comprometemos a entregar proyectos que superen las expectativas de nuestros clientes.',
            content: 'Implementamos sistemas de gestión de calidad ISO 9001...'
          }
        },
        {
          id: 'safety',
          name: 'Política de Seguridad',
          icon: 'Shield',
          priority: 'high',
          template: {
            title: 'Seguridad Primero',
            description: 'La seguridad de nuestro equipo y proyectos es nuestra máxima prioridad.',
            content: 'Cumplimos con todas las normativas de seguridad ocupacional...'
          }
        }
      ]}
    />
  </LazySection>
);

// Newsletter Section - Prioridad baja (engagement)
export const LazyNewsletterSection: React.FC<LazySectionProps> = ({
  data,
  onChange,
  onVisibilityChange
}) => (
  <LazySection
    sectionKey="newsletter"
    title="📧 Newsletter"
    description="Configuración de suscripción y contenido del newsletter"
    priority="low"
    fieldCount={6}
    estimatedHeight="sm"
    onVisibilityChange={onVisibilityChange}
    isCollapsible={true}
    defaultExpanded={false}
  >
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del Newsletter
        </label>
        <input
          type="text"
          value={data?.newsletter?.title || ''}
          onChange={(e) => onChange({
            ...data,
            newsletter: {
              ...data?.newsletter,
              title: e.target.value
            }
          })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Mantente informado"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={data?.newsletter?.description || ''}
          onChange={(e) => onChange({
            ...data,
            newsletter: {
              ...data?.newsletter,
              description: e.target.value
            }
          })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
          placeholder="Suscríbete para recibir noticias y actualizaciones"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="newsletter-active"
          checked={data?.newsletter?.active || false}
          onChange={(e) => onChange({
            ...data,
            newsletter: {
              ...data?.newsletter,
              active: e.target.checked
            }
          })}
          className="mr-2"
        />
        <label htmlFor="newsletter-active" className="text-sm text-gray-700">
          Newsletter activo
        </label>
      </div>
    </div>
  </LazySection>
);

// Export de todas las secciones lazy
export const HOME_LAZY_SECTIONS = [
  'hero',
  'statistics', 
  'services',
  'portfolio',
  'pillars',
  'policies',
  'newsletter'
];

export {
  LazyHeroSection,
  LazyStatisticsSection,
  LazyServicesSection,
  LazyPortfolioSection,
  LazyPillarsSection,
  LazyPoliciesSection,
  LazyNewsletterSection
};