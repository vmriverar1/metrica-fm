'use client';

import React from 'react';
import { BlogConfigEditor } from '@/components/admin/pages/BlogConfigEditor';

const BlogAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <BlogConfigEditor 
        slug="blog"
        onSave={async (data) => {
          console.log('Saving blog data:', data);
          // TODO: Implementar llamada a API
          // const response = await fetch('/api/admin/pages/blog', {
          //   method: 'PUT',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });
          // if (!response.ok) throw new Error('Error al guardar');
        }}
        onPreview={(data) => {
          console.log('Previewing blog data:', data);
          // TODO: Abrir preview en nueva ventana
          // window.open(`/blog?preview=true`, '_blank');
        }}
      />
    </div>
  );
};

export default BlogAdminPage;