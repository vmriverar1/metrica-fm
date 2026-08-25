'use client';

import React from 'react';
import { CompromisoPageEditor } from '@/components/admin/pages/CompromisoPageEditor';

const CompromisoAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <CompromisoPageEditor 
        slug="compromiso"
        onSave={async (data) => {
          // TODO: Implementar llamada a API
          //   body: JSON.stringify(data)
        }}
        onPreview={(data) => {
          // TODO: Abrir preview en nueva ventana
          // window.open(`/compromiso?preview=true`, '_blank');
        }}
      />
    </div>
  );
};

export default CompromisoAdminPage;