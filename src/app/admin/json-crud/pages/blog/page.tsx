'use client';

import React from 'react';
import { BlogConfigEditor } from '@/components/admin/pages/BlogConfigEditor';

const BlogAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <BlogConfigEditor 
        slug="blog"
        onSave={async (data) => {
          // TODO: Implementar llamada a API
          //   body: JSON.stringify(data)
        }}
        onPreview={(data) => {
          // TODO: Abrir preview en nueva ventana
          // window.open(`/blog?preview=true`, '_blank');
        }}
      />
    </div>
  );
};

export default BlogAdminPage;