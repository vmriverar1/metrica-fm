'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { PageData } from '@/types/pages-management';
import { getPreviewUrl } from './utils';

interface PagePreviewProps {
  selectedPage: PageData | null;
}

const PagePreview: React.FC<PagePreviewProps> = ({ selectedPage }) => {
  if (!selectedPage) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona una página para ver la vista previa</p>
        </CardContent>
      </Card>
    );
  }

  const previewUrl = getPreviewUrl(selectedPage);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Vista Previa: {selectedPage.title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en nueva pestaña
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-[600px]"
            title={`Vista previa de ${selectedPage.title}`}
            style={{ border: 'none' }}
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>URL:</strong> {previewUrl}</p>
          <p><strong>Última modificación:</strong> {selectedPage.lastModified}</p>
          <p><strong>Estado:</strong> {selectedPage.status}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PagePreview;