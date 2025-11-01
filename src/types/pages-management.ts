export interface PageData {
  id: string;
  name: string;
  title: string;
  description: string;
  path: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  size: string;
  type: 'static' | 'dynamic';
  metadata?: {
    author?: string;
    tags?: string[];
    category?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

export interface PagesManagementProps {
  onPageSelect?: (page: PageData) => void;
  onPageSave?: (page: PageData) => void;
}