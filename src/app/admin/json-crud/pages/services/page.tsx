'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import DynamicForm from '@/components/admin/DynamicForm';
import { servicesSchema } from './schema';
import Link from 'next/link';

const ServicesAdminPage = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pages/services');
      const result = await response.json();

      if (result.success) {
        setData(result.data || {});
      } else {
        console.error('Error loading services data:', result.error);
      }
    } catch (error) {
      console.error('Error loading services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/pages/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setData(formData);
        // Mostrar mensaje de éxito
        alert('Página de servicios guardada exitosamente');
      } else {
        alert('Error al guardar: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving services data:', error);
      alert('Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/services', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando editor de servicios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/json-crud/pages" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Volver a Páginas
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Página de Servicios</h1>
            <p className="text-gray-600">Gestiona el contenido de la página de servicios</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </button>
        </div>
      </div>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Configuración de Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicForm
            schema={servicesSchema}
            data={data}
            onSave={handleSave}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesAdminPage;