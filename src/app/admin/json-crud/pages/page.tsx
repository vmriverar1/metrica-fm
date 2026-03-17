'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PagesList, PagePreview, PageEditor, generateMockPages } from './components';
import { PageData } from '@/types/pages-management';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

const PagesManagement = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Cargar páginas al montar el componente
  useEffect(() => {
    const loadPages = () => {
      setLoading(true);

      // Simular carga de datos
      setTimeout(() => {
        const mockPages = generateMockPages();
        setPages(mockPages);
        setLoading(false);
      }, 1000);
    };

    loadPages();
  }, []);

  // Mapeo de nombres de páginas de la tabla a documentos de Firestore
  const getFirestoreDocumentName = (pageName: string): string => {
    const mapping: Record<string, string> = {
      'about-historia': 'historia', // La tabla dice 'about-historia' pero en Firestore es 'historia'
      // Agregar más mapeos si es necesario
    };
    return mapping[pageName] || pageName;
  };

  // Manejar edición de página
  const handleEditPage = async (page: PageData) => {
    setLoading(true);

    try {
      // Obtener el nombre correcto del documento en Firestore
      const firestoreDocName = getFirestoreDocumentName(page.name);

      const result = await FirestoreCore.getDocumentById('pages', firestoreDocName);

      if (result.success && result.data) {
        // Mapeo especial para campos anidados según el tipo de página (memoizado)
        let mappedData = result.data;

        // Para home: transformar statistics para compatibilidad con statistics-grid
        if (page.name === 'home' && result.data.stats?.statistics) {

          // Transformar del formato Firestore al formato EnhancedStatisticsManager para home
          const transformedStats = result.data.stats.statistics.map((stat: any, index: number) => {
            // Si ya está transformado, mantenerlo
            if (stat && stat.id) {
              return stat;
            }

            // Si tiene el formato básico de estadística, transformarlo
            return {
              id: `stat-${index}`,
              icon: stat.icon || 'Award',
              value: stat.value || 0,
              suffix: stat.suffix || '',
              prefix: stat.prefix || '',
              label: stat.label || 'Sin etiqueta'
            };
          });

          mappedData = {
            ...result.data,
            stats: {
              ...result.data.stats,
              statistics: transformedStats
            }
          };
        } else {
          // Para otras páginas (como historia), cargar datos sin transformación
          // La transformación se hace en DynamicForm cuando se renderiza el statistics-builder
          mappedData = result.data;
        }

        // Combinar datos de la tabla con datos reales de Firestore
        const enrichedPage = {
          ...page,
          ...mappedData,
          // Mantener algunos metadatos de la tabla que son esenciales para la UI
          id: page.id,
          name: page.name,
          status: page.status,
          lastModified: page.lastModified,
          size: page.size,
          type: page.type
          // Remover metadata si es undefined para evitar problemas con Firestore
        };

        setSelectedPage(enrichedPage);
        setIsEditing(true);
        setActiveTab('edit');
      } else {
        // Fallback: usar datos básicos si no hay datos en Firestore
        const basicPage = {
          ...page,
          // Datos mínimos para crear un nuevo documento
          page: {
            title: page.title,
            description: page.description
          }
          // Remover metadata para evitar problemas con undefined
        };

        setSelectedPage(basicPage);
        setIsEditing(true);
        setActiveTab('edit');
      }
    } catch (error) {
      console.error('❌ [FIRESTORE] Error loading page data:', error);
      alert(`Error al cargar los datos de la página ${page.name}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar vista previa de página
  const handleViewPage = (page: PageData) => {
    setSelectedPage(page);
    setActiveTab('view');
  };

  // Función para limpiar valores undefined (Firestore no los acepta)
  const cleanUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedValues).filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }

    return obj;
  };

  // Manejar guardado de página
  const handleSavePage = async (data: any) => {
    if (!selectedPage) return;

    try {
      // Obtener el nombre correcto del documento en Firestore para guardar
      const firestoreDocName = getFirestoreDocumentName(selectedPage.name);

      // Mapeo especial al guardar para campos anidados
      let dataToSave = { ...data };

      // Para home: transformar de vuelta stats.statistics si es necesario
      if (selectedPage.name === 'home' && data.stats?.statistics) {

        // Las estadísticas de home vienen ya en el formato correcto del statistics-grid
        // Solo asegurar que tengan la estructura esperada
        const homeStats = data.stats.statistics.map((stat: any, index: number) => ({
          id: stat.id || `stat-${index}`,
          icon: stat.icon || 'Award',
          value: stat.value || 0,
          suffix: stat.suffix || '',
          prefix: stat.prefix || '',
          label: stat.label || 'Sin etiqueta'
        }));

        dataToSave = {
          ...dataToSave,
          stats: {
            ...dataToSave.stats,
            statistics: homeStats
          }
        };

      }

      // Para otras páginas (como historia), los datos ya vienen en formato correcto desde DynamicForm

      // Limpiar valores undefined antes de guardar
      const cleanedData = cleanUndefinedValues(dataToSave);

      // Guardar datos reales en Firestore usando createDocumentWithId con merge: true
      // Esto hace un "upsert": crea el documento si no existe, actualiza si existe
      const result = await FirestoreCore.createDocumentWithId('pages', firestoreDocName, cleanedData, true);

      if (result.success) {
        // Actualizar la tabla local con la nueva fecha de modificación
        const updatedPages = pages.map(page =>
          page.id === selectedPage.id
            ? { ...page, lastModified: new Date().toISOString().split('T')[0] }
            : page
        );

        setPages(updatedPages);
        alert('Página guardada exitosamente en Firestore');

        // Mantener al usuario en la misma página de edición
        // setActiveTab('list');      // ← REMOVIDO: No regresar a la lista
        // setSelectedPage(null);     // ← REMOVIDO: Mantener página seleccionada
        // setIsEditing(false);       // ← REMOVIDO: Mantener en modo edición
      } else {
        console.error('❌ [FIRESTORE] Error saving to Firestore:', result.error);
        alert(`Error al guardar la página: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ [FIRESTORE] Error during save operation:', error);
      alert('Error al guardar la página');
    }
  };

  // Manejar cancelación de edición
  const handleCancelEdit = () => {
    setActiveTab('list');
    setSelectedPage(null);
    setIsEditing(false);
  };

  // Manejar actualización de lista
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const mockPages = generateMockPages();
      setPages(mockPages);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Páginas</TabsTrigger>
          <TabsTrigger value="view">Vista Previa</TabsTrigger>
          <TabsTrigger value="edit">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <PagesList
            pages={pages}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEditPage={handleEditPage}
            onViewPage={handleViewPage}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="view">
          <PagePreview selectedPage={selectedPage} />
        </TabsContent>

        <TabsContent value="edit">
          <PageEditor
            selectedPage={selectedPage}
            isEditing={isEditing}
            onSave={handleSavePage}
            onCancel={handleCancelEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PagesManagement;