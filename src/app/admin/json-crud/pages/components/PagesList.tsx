'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Edit, Eye } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import { PageData } from '@/types/pages-management';
import { getStatusColor, getTypeIcon } from './utils';

interface PagesListProps {
  pages: PageData[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEditPage: (page: PageData) => void;
  onViewPage: (page: PageData) => void;
  onRefresh: () => void;
}

const PagesList: React.FC<PagesListProps> = ({
  pages,
  loading,
  searchTerm,
  onSearchChange,
  onEditPage,
  onViewPage,
  onRefresh
}) => {
  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (nameValue: any, page: PageData) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(page.type)}</span>
          <div>
            <p className="font-medium">{page.name}</p>
            <p className="text-sm text-gray-500">{page.path}</p>
          </div>
        </div>
      )
    }
  ];

  const tableActions = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: onViewPage,
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: onEditPage,
      color: 'text-green-600 hover:text-green-800'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestión de Páginas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredPages}
            columns={tableColumns}
            actions={tableActions}
            loading={loading}
            searchable={true}
            searchPlaceholder="Buscar páginas..."
            onSearch={(term) => onSearchChange(term)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PagesList;