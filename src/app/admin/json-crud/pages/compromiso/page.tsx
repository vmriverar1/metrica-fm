'use client';

import React from 'react';
import { CompromisoPageEditor } from '@/components/admin/pages/CompromisoPageEditor';

const CompromisoAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <CompromisoPageEditor 
        slug="compromiso"
        onSave={async (data) => {
          console.log('Saving compromiso data:', data);
          // TODO: Implementar llamada a API
          // const response = await fetch('/api/admin/pages/compromiso', {
          //   method: 'PUT',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });
          // if (!response.ok) throw new Error('Error al guardar');
        }}
        onPreview={(data) => {
          console.log('Previewing compromiso data:', data);
          // TODO: Abrir preview en nueva ventana
          // window.open(`/compromiso?preview=true`, '_blank');
        }}
      />
    </div>
  );
};

export default CompromisoAdminPage;