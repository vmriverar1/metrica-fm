'use client';

import { useState, useEffect } from 'react';
import { useAutores } from '@/hooks/useNewsletterAdmin';
import { useRouter } from 'next/navigation';
import type { Autor } from '@/types/newsletter';
import DataTable from '@/components/admin/DataTable';
import DynamicForm from '@/components/admin/DynamicForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Mail, Calendar, Award } from 'lucide-react';

// Usar tipo de Firestore
type Author = Autor & {
  specialties: string[];
  article_count: number;
  status: 'active' | 'inactive';
  metadata: {
    last_published: string;
    total_views: number;
    featured_articles: number;
  };
};

const AuthorsManagement = () => {
  // Usar hook de Firestore
  const {
    autores,
    loading,
    error: firestoreError,
    create,
    update,
    remove
  } = useAutores();

  // Mapear datos de Firestore al formato esperado por el componente
  const authors: Author[] = autores.map(autor => ({
    ...autor,
    specialties: autor.specializations || [],
    article_count: autor.articles_count || 0,
    status: autor.featured ? 'active' : 'inactive',
    joined_date: autor.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    social_links: {
      linkedin: autor.social?.linkedin,
      twitter: autor.social?.twitter,
      github: autor.social?.github,
      website: autor.social?.website
    },
    metadata: {
      last_published: '',
      total_views: 0,
      featured_articles: 0
    }
  }));

  const [error, setError] = useState<string | null>(firestoreError);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sincronizar error de Firestore con error local
  useEffect(() => {
    setError(firestoreError);
  }, [firestoreError]);

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || author.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedAuthors = filteredAuthors.slice((currentPage - 1) * 10, currentPage * 10);

  const columns = [
    {
      key: 'avatar',
      label: '',
      render: (author: Author) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (author: Author) => (
        <div>
          <div className="font-medium">{author.name}</div>
          <div className="text-sm text-gray-500">{author.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      render: (author: Author) => (
        <Badge variant="outline">{author.role}</Badge>
      )
    },
    {
      key: 'specialties',
      label: 'Especialidades',
      render: (author: Author) => (
        <div className="flex flex-wrap gap-1">
          {author.specialties.slice(0, 2).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {author.specialties.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{author.specialties.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'article_count',
      label: 'Artículos',
      render: (author: Author) => (
        <div className="text-center">
          <div className="font-medium">{author.article_count}</div>
          <div className="text-xs text-gray-500">{author.metadata.featured_articles} destacados</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (author: Author) => (
        <Badge variant={author.status === 'active' ? 'default' : 'secondary'}>
          {author.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'joined_date',
      label: 'Fecha de Ingreso',
      render: (author: Author) => new Date(author.joined_date).toLocaleDateString('es-PE')
    }
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: (author: Author) => {
        setSelectedAuthor(author);
        setIsModalOpen(true);
      },
      variant: 'default' as const
    },
    {
      label: 'Ver Artículos',
      onClick: (author: Author) => {
        window.open(`/admin/json-crud/newsletter/articles?author=${author.id}`, '_blank');
      },
      variant: 'outline' as const
    },
    {
      label: author => author.status === 'active' ? 'Desactivar' : 'Activar',
      onClick: async (author: Author) => {
        try {
          const newStatus = author.status === 'active' ? 'inactive' : 'active';
          const response = await update(author.id, {
            featured: newStatus === 'active'
          });
          if (!response.exito) {
            setError(response.mensaje || 'Error al actualizar');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al actualizar');
        }
      },
      variant: 'outline' as const
    },
    {
      label: 'Eliminar',
      onClick: async (author: Author) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este autor?')) return;
        try {
          const response = await remove(author.id);
          if (!response.exito) {
            setError(response.mensaje || 'Error al eliminar');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
      },
      variant: 'destructive' as const,
      confirmMessage: '¿Estás seguro de que quieres eliminar este autor? Esta acción no se puede deshacer.'
    }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ];

  const formFields = [
    {
      key: 'name',
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true,
      validation: { min: 2, max: 100 }
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'text' as const,
      required: true,
      placeholder: 'ej. Especialista en Infraestructura'
    },
    {
      key: 'bio',
      label: 'Biografía',
      type: 'textarea' as const,
      required: true,
      validation: { max: 500 }
    },
    {
      key: 'avatar',
      label: 'Avatar',
      type: 'image' as const,
      placeholder: 'Seleccionar imagen de avatar',
      description: 'Imagen del avatar del autor. Puedes subir un archivo o usar una URL externa.'
    },
    {
      key: 'specialties',
      label: 'Especialidades',
      type: 'tags' as const,
      required: true,
      placeholder: 'Escriba especialidades y presione Enter'
    },
    {
      key: 'social_links.linkedin',
      label: 'LinkedIn',
      type: 'url' as const,
      group: 'Enlaces Sociales',
      placeholder: 'https://linkedin.com/in/usuario'
    },
    {
      key: 'social_links.twitter',
      label: 'Twitter',
      type: 'url' as const,
      group: 'Enlaces Sociales',
      placeholder: 'https://twitter.com/usuario'
    },
    {
      key: 'social_links.github',
      label: 'GitHub',
      type: 'url' as const,
      group: 'Enlaces Sociales',
      placeholder: 'https://github.com/usuario'
    },
    {
      key: 'social_links.website',
      label: 'Sitio Web Personal',
      type: 'url' as const,
      group: 'Enlaces Sociales',
      placeholder: 'https://mipagina.com'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' }
      ]
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      const authorData = {
        name: values.name,
        email: values.email,
        bio: values.bio,
        avatar: values.avatar || '',
        role: values.role,
        social: {
          linkedin: values['social_links.linkedin'] || '',
          twitter: values['social_links.twitter'] || '',
          github: values['social_links.github'] || '',
          website: values['social_links.website'] || ''
        },
        specializations: values.specialties || [],
        featured: values.status === 'active'
      };

      let response;
      if (selectedAuthor) {
        response = await update(selectedAuthor.id, authorData);
      } else {
        response = await create(authorData);
      }

      if (response.exito) {
        setIsModalOpen(false);
        setSelectedAuthor(null);
        setError(null);
      } else {
        setError(response.mensaje || 'Error al guardar autor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const getFormValues = (author: Author | null) => {
    if (!author) return {};
    return {
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatar: author.avatar,
      role: author.role,
      specialties: author.specialties,
      'social_links.linkedin': author.social_links.linkedin || '',
      'social_links.twitter': author.social_links.twitter || '',
      'social_links.github': author.social_links.github || '',
      'social_links.website': author.social_links.website || '',
      status: author.status
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Autores</h1>
            <p className="text-gray-600">Administra los autores del newsletter</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedAuthor(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Autor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Autores</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{authors.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Autores Activos</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {authors.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Total Artículos</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {authors.reduce((sum, author) => sum + author.article_count, 0)}
          </div>
        </div>
        <div className="bg-cyan-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-800">Este Mes</span>
          </div>
          <div className="text-2xl font-bold text-cyan-900">
            {authors.filter(a => 
              new Date(a.metadata.last_published) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length}
          </div>
        </div>
      </div>

      <DataTable
        data={paginatedAuthors}
        columns={columns}
        actions={actions}
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        pagination={{
          current: currentPage,
          total: Math.ceil(filteredAuthors.length / 10),
          pageSize: 10
        }}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAuthor ? 'Editar Autor' : 'Nuevo Autor'}
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            fields={formFields}
            initialValues={getFormValues(selectedAuthor)}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedAuthor(null);
            }}
            submitLabel={selectedAuthor ? 'Actualizar Autor' : 'Crear Autor'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorsManagement;