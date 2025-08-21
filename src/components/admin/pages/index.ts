// Barrel export for page editors (editores principales)

// ✅ Implemented page editors - Phase 1
export { ContactPageEditor } from './ContactPageEditor'
export { BlogConfigEditor } from './BlogConfigEditor'
export { ServicesPageEditor } from './ServicesPageEditor'
export { CompromisoPageEditor } from './CompromisoPageEditor'

// ✅ Implemented page editors - Phase 2
export { PortfolioPageEditor } from './PortfolioPageEditor'
export { CareersPageEditor } from './CareersPageEditor'
export { default as CulturaPageEditor } from './CulturaPageEditor'

export const PAGE_EDITORS_INFO = {
  description: 'Editores principales para cada página JSON - FASE 2 COMPLETADA',
  total_pages: 7,
  implemented: 7, // ✅ ALL PAGE EDITORS COMPLETED
  pending: 0,
  phase1_completed: 4, // ContactPageEditor, BlogConfigEditor, ServicesPageEditor, CompromisoPageEditor
  phase2_completed: 3, // PortfolioPageEditor, CareersPageEditor, CulturaPageEditor
  pages: [
    { name: 'contact', priority: 'high', complexity: 'medium', status: '✅ Phase 1' },
    { name: 'blog', priority: 'high', complexity: 'medium', status: '✅ Phase 1' },
    { name: 'services', priority: 'high', complexity: 'medium', status: '✅ Phase 1' },
    { name: 'compromiso', priority: 'high', complexity: 'medium', status: '✅ Phase 1' },
    { name: 'portfolio', priority: 'medium', complexity: 'high', status: '✅ Phase 2' },
    { name: 'careers', priority: 'medium', complexity: 'high', status: '✅ Phase 2' },
    { name: 'cultura', priority: 'low', complexity: 'high', status: '✅ Phase 2' }
  ]
}