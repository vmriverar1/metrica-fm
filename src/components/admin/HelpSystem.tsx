'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Book, 
  Video, 
  MessageCircle, 
  ExternalLink,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  externalLinks?: { title: string; url: string }[];
}

interface HelpTooltipProps {
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  placement = 'top',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${placementClasses[placement]}`}>
          <div className="bg-gray-800 text-white text-sm rounded-lg p-3 max-w-xs shadow-lg">
            {title && (
              <div className="font-medium mb-1">{title}</div>
            )}
            <div className="text-gray-200">{content}</div>
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[placement]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpArticles: HelpArticle[] = [
    {
      id: 'dashboard-overview',
      title: 'Resumen del Dashboard',
      category: 'Inicio',
      tags: ['dashboard', 'estadísticas', 'overview'],
      content: `El dashboard principal muestra una vista general de todo el contenido del sistema:

**Estadísticas principales:**
- Total de páginas, proyectos, empleos y artículos
- Métricas de rendimiento y actividad
- Alertas y notificaciones importantes

**Acciones rápidas:**
- Crear nuevo contenido desde los botones de acción
- Acceder a elementos recientes
- Ver actividad del sistema

**Navegación:**
- Use el menú lateral para acceder a diferentes secciones
- La búsqueda global está disponible en la parte superior
- Los filtros ayudan a encontrar contenido específico`,
      externalLinks: [
        { title: 'Video tutorial del dashboard', url: 'https://ejemplo.com/tutorial-dashboard' }
      ]
    },
    {
      id: 'portfolio-management',
      title: 'Gestión de Portfolio',
      category: 'Portfolio',
      tags: ['proyectos', 'portfolio', 'gestión'],
      content: `Administre los proyectos del portfolio de la empresa:

**Crear proyectos:**
1. Haga clic en "Nuevo Proyecto"
2. Complete la información básica (título, descripción)
3. Agregue imágenes y detalles técnicos
4. Configure la información del cliente y tecnologías

**Gestionar contenido:**
- Use filtros para encontrar proyectos específicos
- Edite proyectos existentes haciendo clic en "Editar"
- Archive proyectos completados
- Organice por categorías y estados

**Mejores prácticas:**
- Use imágenes de alta calidad
- Mantenga las descripciones concisas pero informativas
- Actualice regularmente el estado de los proyectos`
    },
    {
      id: 'careers-jobs',
      title: 'Gestión de Empleos',
      category: 'Carreras',
      tags: ['empleos', 'reclutamiento', 'departamentos'],
      content: `Administre las oportunidades laborales de la empresa:

**Crear empleos:**
1. Seleccione el departamento correspondiente
2. Complete la descripción del puesto
3. Defina requisitos y beneficios
4. Configure ubicación y modalidad de trabajo

**Gestión de candidatos:**
- Revise aplicaciones recibidas
- Programe entrevistas
- Actualice el estado de las aplicaciones
- Mantenga comunicación con candidatos

**Departamentos:**
- Configure departamentos con sus respectivos equipos
- Asigne presupuestos y métricas
- Gestione liderazgo y estructura organizacional`
    },
    {
      id: 'newsletter-content',
      title: 'Gestión de Newsletter',
      category: 'Newsletter',
      tags: ['artículos', 'autores', 'categorías', 'publicación'],
      content: `Administre el contenido del newsletter corporativo:

**Crear artículos:**
1. Seleccione autor y categoría
2. Escriba el contenido usando Markdown
3. Configure metadatos SEO
4. Previsualice antes de publicar

**Gestión de autores:**
- Registre autores con sus especialidades
- Configure perfiles y enlaces sociales
- Asigne roles y permisos

**Categorías:**
- Organice contenido por temas
- Configure colores y iconos
- Optimice para SEO

**Flujo de publicación:**
- Borradores → Revisión → Publicación
- Programe publicaciones futuras
- Gestione contenido destacado`
    },
    {
      id: 'search-filters',
      title: 'Búsqueda y Filtros',
      category: 'Navegación',
      tags: ['búsqueda', 'filtros', 'navegación'],
      content: `Use las herramientas de búsqueda para encontrar contenido eficientemente:

**Búsqueda global:**
- Busque en todo el contenido desde la barra superior
- Use términos específicos para mejores resultados
- Los resultados se organizan por relevancia

**Filtros avanzados:**
- Filtre por estado (activo, inactivo, borrador)
- Filtre por fecha de creación o modificación
- Use filtros de categoría y tipo

**Consejos de búsqueda:**
- Use comillas para búsquedas exactas
- Combine múltiples términos para refinar
- Use filtros para reducir resultados`
    }
  ];

  const categories = [...new Set(helpArticles.map(article => article.category))];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Centro de Ayuda
            </DialogTitle>
            {(selectedCategory || selectedArticle) && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Volver
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ayuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            {!selectedCategory && !selectedArticle && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 mb-3">Categorías</h3>
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <span>{category}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Articles list */}
            {(selectedCategory || searchTerm) && !selectedArticle && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 mb-3">
                  {selectedCategory ? `Artículos de ${selectedCategory}` : 'Resultados de búsqueda'}
                </h3>
                {filteredArticles.map(article => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div className="font-medium text-sm">{article.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {article.tags.join(', ')}
                    </div>
                  </button>
                ))}
                {filteredArticles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron artículos
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 pl-4 overflow-y-auto">
            {!selectedCategory && !selectedArticle && !searchTerm && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">¿Cómo podemos ayudarte?</h2>
                  <p className="text-gray-600 mb-6">
                    Explore las guías y tutoriales para sacar el máximo provecho del sistema de administración.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer"
                       onClick={() => setSelectedCategory('Inicio')}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-medium">Primeros pasos</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Aprenda a navegar y usar las funciones básicas del sistema
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-green-300 cursor-pointer"
                       onClick={() => setSelectedCategory('Portfolio')}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Video className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-medium">Gestión de contenido</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Administre proyectos, empleos y artículos efectivamente
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-purple-300 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-medium">Soporte técnico</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      ¿Necesita ayuda adicional? Contacte a nuestro equipo de soporte
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-cyan-300 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <ExternalLink className="h-5 w-5 text-cyan-600" />
                      </div>
                      <h3 className="font-medium">Recursos externos</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Enlaces a documentación adicional y tutoriales
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedArticle && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{selectedArticle.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedArticle.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
                          {paragraph.slice(2, -2)}
                        </h4>
                      );
                    }
                    if (paragraph.trim() === '') return null;
                    return (
                      <p key={index} className="text-gray-600 mb-3">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {selectedArticle.externalLinks && selectedArticle.externalLinks.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Enlaces útiles</h4>
                    <div className="space-y-2">
                      {selectedArticle.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Floating help button
export const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Abrir centro de ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
      
      <HelpSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};