'use client';

import { Loader2, Search, FileText, Users, Building2, Tag, Briefcase } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface PageLoadingProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  title = 'Cargando...', 
  description,
  icon 
}) => {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            )}
            <div>
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              {description && (
                <div className="h-4 bg-gray-100 rounded w-64 mt-2"></div>
              )}
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-lg border">
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FormLoading: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-20"></div>
      </div>
    </div>
  );
};

export const StatsLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};

interface SearchLoadingProps {
  message?: string;
}

export const SearchLoading: React.FC<SearchLoadingProps> = ({ 
  message = 'Buscando...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <Search className="h-8 w-8 animate-pulse mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Specific empty states for different sections
export const EmptyPortfolio: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<Briefcase className="h-12 w-12" />}
    title="No hay proyectos"
    description="Aún no se han creado proyectos en el portfolio. Crea el primer proyecto para comenzar."
    action={onCreateClick ? { label: 'Crear Proyecto', onClick: onCreateClick } : undefined}
  />
);

export const EmptyJobs: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<Users className="h-12 w-12" />}
    title="No hay empleos disponibles"
    description="No se encontraron empleos activos. Crea una nueva oferta laboral para comenzar."
    action={onCreateClick ? { label: 'Crear Empleo', onClick: onCreateClick } : undefined}
  />
);

export const EmptyArticles: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<FileText className="h-12 w-12" />}
    title="No hay artículos"
    description="Aún no se han publicado artículos en el newsletter. Escribe el primer artículo."
    action={onCreateClick ? { label: 'Crear Artículo', onClick: onCreateClick } : undefined}
  />
);

export const EmptyAuthors: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<Users className="h-12 w-12" />}
    title="No hay autores"
    description="No se han registrado autores para el newsletter. Agrega el primer autor."
    action={onCreateClick ? { label: 'Agregar Autor', onClick: onCreateClick } : undefined}
  />
);

export const EmptyCategories: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<Tag className="h-12 w-12" />}
    title="No hay categorías"
    description="No se han creado categorías para organizar el contenido. Crea la primera categoría."
    action={onCreateClick ? { label: 'Crear Categoría', onClick: onCreateClick } : undefined}
  />
);

export const EmptyDepartments: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => (
  <EmptyState
    icon={<Building2 className="h-12 w-12" />}
    title="No hay departamentos"
    description="No se han configurado departamentos en la empresa. Crea el primer departamento."
    action={onCreateClick ? { label: 'Crear Departamento', onClick: onCreateClick } : undefined}
  />
);

export const EmptySearch: React.FC = () => (
  <EmptyState
    icon={<Search className="h-12 w-12" />}
    title="No se encontraron resultados"
    description="Intenta con otros términos de búsqueda o revisa los filtros aplicados."
  />
);