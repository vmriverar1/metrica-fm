/**
 * Newsletter/Blog Components Index
 * Exports all newsletter-specific components for the admin interface
 */

// Core newsletter components
export { default as ArticleEditor } from './ArticleEditor'
export { default as AuthorManagement } from './AuthorManagement'
export { default as ContentCalendar } from './ContentCalendar'
export { default as NewsletterTemplateManager } from './NewsletterTemplateManager'
export { default as EmailCampaignManager } from './EmailCampaignManager'
export { default as SubscriberAnalytics } from './SubscriberAnalytics'

// Re-export shared components for convenience
export {
  DynamicContentManager,
  SearchSystemManager,
  CategoryHierarchyManager,
  MediaGalleryManager,
  AnalyticsDashboard
} from '../dynamic-shared'

// Re-export API services
export {
  dynamicContentAPI,
  searchSystemAPI,
  analyticsAPI
} from '../dynamic-shared'