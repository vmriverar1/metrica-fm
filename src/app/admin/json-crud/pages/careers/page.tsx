'use client';

import React, { useState, useEffect } from 'react';
import { CareersPageEditor } from '@/components/admin/pages';
import type { CareersConfiguration } from '@/components/admin/pages/CareersPageEditor';

export default function CareersAdminPage() {
  const [careersData, setCareersData] = useState<Partial<CareersConfiguration>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCareersData();
  }, []);

  const loadCareersData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/pages/careers');
      if (response.ok) {
        const data = await response.json();
        setCareersData(data);
      } else if (response.status === 404) {
        // No data exists yet, use defaults
        setCareersData({});
      } else {
        throw new Error('Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error loading careers data:', error);
      setError('Error al cargar la configuración de carreras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CareersConfiguration) => {
    try {
      const response = await fetch('/api/admin/pages/careers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la configuración');
      }

      // Actualizar los datos locales
      setCareersData(data);
      
      // Mostrar notificación de éxito (puedes implementar un toast aquí)
      console.log('Carreras guardado exitosamente');
      
    } catch (error) {
      console.error('Error saving careers:', error);
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  };

  const handlePreview = (data: CareersConfiguration) => {
    // Abrir preview en nueva ventana
    window.open('/careers?preview=true', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de carreras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            type="button"
            onClick={loadCareersData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CareersPageEditor
        slug="careers"
        initialData={careersData}
        onSave={handleSave}
        onPreview={handlePreview}
        readOnly={false}
      />
    </div>
  );
}