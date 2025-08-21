'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BlogPageRendererProps {
  data: any;
  isPreview?: boolean;
}

const BlogPageRenderer: React.FC<BlogPageRendererProps> = ({ data, isPreview = false }) => {
  const { page = {}, hero = {}, filters = {}, posts = [] } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Info (solo visible en preview) */}
      {isPreview && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <strong>SEO:</strong> {page.title} | {page.description}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {hero.title || 'Blog Métrica DIP'}
          </h1>
          {hero.subtitle && (
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                    <span className="text-gray-600">📝 Post {index + 1}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{post.title || `Post ${index + 1}`}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt || 'Contenido del post...'}</p>
                    {post.category && (
                      <Badge variant="secondary">{post.category}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No hay posts para mostrar</h3>
              <p className="text-gray-500">El contenido del blog se mostrará aquí en preview.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPageRenderer;