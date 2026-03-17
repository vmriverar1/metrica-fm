'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import DynamicForm from '@/components/admin/DynamicForm';
import { PageData } from '@/types/pages-management';

// Importar esquemas de páginas
import { historiaSchema } from '../historia/schema';
import { culturaSchema } from '../cultura/schema';
import { isoSchema } from '../iso/schema';
import { homeSchema } from '../home/schema';
import { contactSchema } from '../contact/schema';
import { blogSchema } from '../blog/schema';
import { servicesSchema } from '../services/schema';
import { compromisoSchema } from '../compromiso/schema';
import { portfolioSchema } from '../portfolio/schema';
import { careersSchema } from '../careers/schema';
import { clientesSchema } from '../clientes/schema';

interface PageEditorProps {
  selectedPage: PageData | null;
  isEditing: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({
  selectedPage,
  isEditing,
  onSave,
  onCancel
}) => {
  // Esquemas de formulario por tipo de página
  const getFormSchema = (pageName: string) => {

    switch (pageName) {
      case 'historia':
        return historiaSchema;
      case 'about-historia':
        return historiaSchema;

      case 'cultura':
        return culturaSchema;

      case 'iso':
        return isoSchema;

      case 'home':
        return homeSchema;

      case 'contact':
        return contactSchema;

      case 'blog':
        return blogSchema;

      case 'services':
        return servicesSchema;

      case 'compromiso':
        return compromisoSchema;

      case 'portfolio':
        return portfolioSchema;

      case 'careers':
        return careersSchema;

      case 'clientes':
        return clientesSchema;

      default:
        return {
          title: 'Editar Página',
          groups: [],
          fields: [
            {
              key: 'title',
              label: 'Título',
              type: 'text' as const,
              required: true,
              placeholder: 'Título de la página'
            },
            {
              key: 'description',
              label: 'Descripción',
              type: 'textarea' as const,
              required: true,
              placeholder: 'Descripción de la página'
            }
          ]
        };
    }
  };

  if (!selectedPage || !isEditing) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona una página para editar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editar Página: {selectedPage.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Debug específico para historia */}

        {/* Formulario para todas las páginas */}
        <DynamicForm
          fields={getFormSchema(selectedPage.name).fields as any}
          groups={getFormSchema(selectedPage.name).groups || []}
          title={getFormSchema(selectedPage.name).title}
          initialValues={selectedPage}
          onSubmit={onSave}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default PageEditor;