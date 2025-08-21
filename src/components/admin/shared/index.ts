// Barrel export for shared components (alta reutilización - 3+ páginas)

// ✅ Implemented components
export { CategoryManager } from './CategoryManager'
export { FAQManager } from './FAQManager'
export { ContactInfoManager } from './ContactInfoManager'
export { SEOAdvancedEditor } from './SEOAdvancedEditor'
export { PaginationConfig } from './PaginationConfig'
export { ContentSectionsManager } from './ContentSectionsManager'
export { TestimonialsManager } from './TestimonialsManager'

// 🚧 Pending components
// export { SocialMetricsEditor } from './SocialMetricsEditor'

export const SHARED_COMPONENTS_INFO = {
  description: 'Componentes de alta reutilización usados en 3 o más páginas',
  count: 7, // ✅ CategoryManager, FAQManager, ContactInfoManager, SEOAdvancedEditor, PaginationConfig, ContentSectionsManager, TestimonialsManager
  implemented: 7,
  pending: 1, // SocialMetricsEditor
  pages_coverage: ['contact', 'blog', 'services', 'compromiso', 'portfolio', 'careers', 'cultura']
}