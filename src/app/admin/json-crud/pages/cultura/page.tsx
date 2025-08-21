'use client';

import React, { useState, useEffect } from 'react';
import { CulturaPageEditor } from '@/components/admin/pages';
import type { CulturaConfiguration } from '@/components/admin/pages/CulturaPageEditor';

export default function CulturaAdminPage() {
  const [culturaData, setCulturaData] = useState<Partial<CulturaConfiguration>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCulturaData();
  }, []);

  const loadCulturaData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/pages/cultura');
      if (response.ok) {
        const data = await response.json();
        setCulturaData(data);
      } else if (response.status === 404) {
        // No data exists yet, use defaults
        setCulturaData({});
      } else {
        throw new Error('Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error loading cultura data:', error);
      setError('Error al cargar la configuración de cultura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CulturaConfiguration) => {
    try {
      const response = await fetch('/api/admin/pages/cultura', {
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
      setCulturaData(data);
      
      // Mostrar notificación de éxito (puedes implementar un toast aquí)
      console.log('Cultura guardado exitosamente');
      
    } catch (error) {
      console.error('Error saving cultura:', error);
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  };

  const handlePreview = (data: CulturaConfiguration) => {
    // Abrir preview en nueva ventana
    window.open('/cultura?preview=true', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de cultura...</p>
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
            onClick={loadCulturaData}
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
      <CulturaPageEditor
        slug="cultura"
        initialData={culturaData}
        onSave={handleSave}
        onPreview={handlePreview}
        readOnly={false}
      />
    </div>
  );
}