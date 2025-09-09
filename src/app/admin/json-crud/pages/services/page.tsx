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
          try {
            const response = await fetch('/api/admin/pages/services', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: data })
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error al guardar');
            }
            const result = await response.json();
            console.log('Services data saved successfully:', result);
            return result;
          } catch (error) {
            console.error('Error saving services data:', error);
            throw error;
          }
        }}
        onPreview={(data) => {
          console.log('Previewing services data:', data);
          // Open preview in new window
          window.open('/services', '_blank');
        }}
      />
    </div>
  );
};

export default ServicesAdminPage;