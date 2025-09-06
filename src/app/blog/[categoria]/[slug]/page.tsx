import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogProvider } from '@/contexts/BlogContext';
import UniversalHero from '@/components/ui/universal-hero';
import ArticleContent from '@/components/blog/ArticleContent';
import AuthorBio from '@/components/blog/AuthorBio';
import CommentSection from '@/components/blog/CommentSection';
import ArticleSEO from '@/components/seo/ArticleSEO';
import { ArticleLoadingState } from '@/components/loading/OptimizedLoading';
// import FavoritesShare from '@/components/portfolio/FavoritesShare';
import SectionTransition from '@/components/portfolio/SectionTransition';
import { BlogContentData } from '@/types/blog-page';

interface ArticlePageProps {
  params: {
    categoria: string;
    slug: string;
  };
}

import { readPublicJSON } from '@/lib/json-reader';

// Function to fetch blog content data
async function getBlogContentData(): Promise<BlogContentData | null> {
  try {
    return readPublicJSON<BlogContentData>('/json/dynamic-content/newsletter/content.json');
  } catch (error) {
    console.error('Error fetching blog content data:', error);
    return null;
  }
}

// Function to get article by slug
async function getArticleBySlug(slug: string, contentData: BlogContentData | null) {
  if (!contentData) return null;
  
  const article = contentData.articles.find(article => article.slug === slug);
  if (!article) return null;
  
  // Find the author
  const author = contentData.authors.find(author => author.id === article.author_id);
  
  return {
    ...article,
    author: author || {
      id: 'unknown',
      name: 'Autor Desconocido',
      role: 'Colaborador',
      bio: '',
      avatar: '',
      linkedin: '',
      email: '',
      featured: false,
      articles_count: 0,
      specializations: []
    }
  };
}

export async function generateStaticParams() {
  const contentData = await getBlogContentData();
  
  if (!contentData) {
    return [];
  }
  
  return contentData.articles.map((article) => ({
    categoria: article.category,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const contentData = await getBlogContentData();
  const article = await getArticleBySlug(params.slug, contentData);
  
  if (!article) {
    return {
      title: 'Artículo no encontrado | Blog Métrica FM'
    };
  }

  return {
    title: `${article.title} | Blog Métrica FM`,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_date,
      authors: [article.author.name],
      images: [
        {
          url: article.featured_image,
          width: 1200,
          height: 630,
          alt: article.featured_image_alt || article.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.social_image || article.featured_image]
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const contentData = await getBlogContentData();
  const article = await getArticleBySlug(params.slug, contentData);

  if (!article) {
    notFound();
  }

  return (
    <BlogProvider>
      {/* ArticleSEO will need to be updated to handle new article structure */}
      {/* <ArticleSEO article={article} /> */}
      
      <main className="min-h-screen bg-background">
        <UniversalHero 
          title={article.title}
          subtitle={article.excerpt}
          backgroundImage={article.featured_image}
        />
        
        <SectionTransition variant="fade" />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Article metadata */}
            <div className="mb-8 pb-8 border-b border-border">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>Publicado: {new Date(article.published_date).toLocaleDateString('es-PE')}</span>
                <span>•</span>
                <span>Lectura: {article.reading_time} min</span>
                <span>•</span>
                <span>Autor: {article.author.name}</span>
              </div>
              {article.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <ArticleContent content={article.content} />
            
            <div className="mt-16 pt-8 border-t border-border">
              <AuthorBio author={article.author} />
            </div>
            
            <div className="mt-16 pt-8 border-t border-border">
              <CommentSection 
                articleId={article.id}
                allowGuests={true}
                moderationEnabled={true}
              />
            </div>
            
            {/* Share functionality will be implemented later
            <div className="mt-12">
              <FavoritesShare 
                type="article" 
                item={article}
                title="Compartir artículo"
              />
            </div>
            */}
          </div>
        </div>
      </main>
    </BlogProvider>
  );
}