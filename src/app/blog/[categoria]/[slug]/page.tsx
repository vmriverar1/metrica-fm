import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { BlogProvider } from '@/contexts/BlogContext';
import { getBlogPost, sampleBlogPosts } from '@/types/blog';
import UniversalHero from '@/components/ui/universal-hero';
import ArticleContent from '@/components/blog/ArticleContent';
import AuthorBio from '@/components/blog/AuthorBio';
import ReadingProgress from '@/components/blog/ReadingProgress';
import CommentSection from '@/components/blog/CommentSection';
import ArticleSEO from '@/components/seo/ArticleSEO';
import { ArticleLoadingState } from '@/components/loading/OptimizedLoading';
// import FavoritesShare from '@/components/portfolio/FavoritesShare';
import SectionTransition from '@/components/portfolio/SectionTransition';

interface ArticlePageProps {
  params: {
    categoria: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  return sampleBlogPosts.map((post) => ({
    categoria: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado | Blog Métrica DIP'
    };
  }

  return {
    title: `${post.title} | Blog Métrica DIP`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage]
    }
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogProvider>
      <ArticleSEO article={post} />
      <ReadingProgress article={post} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <UniversalHero 
          title={post.title}
          subtitle={post.excerpt}
          backgroundImage={post.featuredImage}
        />
        
        <SectionTransition variant="fade" />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <ArticleContent content={post.content} />
            
            <div className="mt-16 pt-8 border-t border-border">
              <AuthorBio author={post.author} />
            </div>
            
            <div className="mt-16 pt-8 border-t border-border">
              <CommentSection 
                articleId={post.id}
                allowGuests={true}
                moderationEnabled={true}
              />
            </div>
            
            {/* Share functionality will be implemented later
            <div className="mt-12">
              <FavoritesShare 
                type="article" 
                item={post}
                title="Compartir artículo"
              />
            </div>
            */}
          </div>
        </div>
      </main>
      
      <Footer />
    </BlogProvider>
  );
}