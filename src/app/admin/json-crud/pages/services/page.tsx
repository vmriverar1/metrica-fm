'use client';

import React from 'react';
import { ServicesPageEditor } from '@/components/admin/pages/ServicesPageEditor';

const ServicesAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <ServicesPageEditor 
        slug="services"
        onSave={async (data) => {
          console.log('Saving services data:', data);
          // TODO: Implementar llamada a API
          // const response = await fetch('/api/admin/pages/services', {
          //   method: 'PUT',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });
          // if (!response.ok) throw new Error('Error al guardar');
        }}
        onPreview={(data) => {
          console.log('Previewing services data:', data);
          // TODO: Abrir preview en nueva ventana
          // window.open(`/services?preview=true`, '_blank');
        }}
      />
    </div>
  );
};

export default ServicesAdminPage;