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

// Revalidar cada 60 segundos para mantener datos actualizados
export const revalidate = 60;

interface ArticlePageProps {
  params: {
    categoria: string;
    slug: string;
  };
}

// Function to get article by slug from Firestore
async function getArticleBySlug(slug: string) {
  try {
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const articulo = await articulos.getBySlug(slug);
    if (!articulo) return null;

    const articuloConRelaciones = await articulos.getConRelaciones(articulo.id);
    if (!articuloConRelaciones) return null;

    // Convertir al formato compatible
    const { convertSingleToCompatibleFormat } = await import('@/lib/blog-utils');
    return convertSingleToCompatibleFormat(articuloConRelaciones);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    // Obtener datos de Firestore
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const result = await articulos.getAll();
    const articles = result.data;

    if (!articles || articles.length === 0) {
      console.warn('No articles found in Firestore');
      return [];
    }

    // Necesitamos obtener la información de categoría por separado
    const categoriasService = new services.CategoriasService();
    const categoriasResult = await categoriasService.getAll();
    const categorias = categoriasResult?.data || [];

    console.log('Categories loaded:', categorias.length);

    const params = [];
    for (const article of articles) {
      if (article && article.slug && article.category_id && Array.isArray(categorias)) {
        const categoria = categorias.find(cat => cat && cat.id === article.category_id);
        if (categoria?.slug) {
          params.push({
            categoria: categoria.slug,
            slug: article.slug,
          });
        }
      }
    }

    console.log(`Generated ${params.length} static params for blog articles from Firestore`);
    return params;
  } catch (error) {
    console.error('Error generating static params for blog articles:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

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
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage]
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <BlogProvider>
      <main className="min-h-screen bg-background">
        <UniversalHero
          title={article.title}
          subtitle={article.excerpt}
          backgroundImage={article.featuredImage}
          hideText={article.hide_hero_text}
        />

        <SectionTransition variant="fade" />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Article metadata */}
            <div className="mb-8 pb-8 border-b border-border">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>Publicado: {article.publishedAt.toLocaleDateString('es-PE')}</span>
                <span>•</span>
                <span>Lectura: {article.readingTime} min</span>
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
          </div>
        </div>
      </main>
    </BlogProvider>
  );
}