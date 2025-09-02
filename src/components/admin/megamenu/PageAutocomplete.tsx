'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ExternalLink, 
  Home, 
  ChevronDown,
  Check,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PageSuggestion {
  path: string;
  title: string;
  description?: string;
  type: 'internal' | 'external';
  exists?: boolean;
  category?: string;
}

interface PageAutocompleteProps {
  value: string;
  onChange: (value: string, isInternal?: boolean, pageMapping?: string) => void;
  onInternalChange?: (isInternal: boolean) => void;
  placeholder?: string;
  className?: string;
  isInternal?: boolean;
  showToggle?: boolean;
}

const PageAutocomplete: React.FC<PageAutocompleteProps> = ({
  value,
  onChange,
  onInternalChange,
  placeholder = "Buscar o escribir URL...",
  className,
  isInternal = true,
  showToggle = true
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PageSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Páginas internas predefinidas
  const internalPages: PageSuggestion[] = [
    { path: '/', title: 'Inicio', description: 'Página principal del sitio', type: 'internal', exists: true, category: 'Principal' },
    { path: '/nosotros', title: 'Nosotros', description: 'Información sobre la empresa', type: 'internal', exists: true, category: 'Empresa' },
    { path: '/servicios', title: 'Servicios', description: 'Nuestros servicios principales', type: 'internal', exists: true, category: 'Servicios' },
    { path: '/servicios/supervision', title: 'Supervisión de Obras', description: 'Servicios de supervisión', type: 'internal', exists: true, category: 'Servicios' },
    { path: '/servicios/consultoria', title: 'Consultoría', description: 'Servicios de consultoría', type: 'internal', exists: true, category: 'Servicios' },
    { path: '/servicios/gestion', title: 'Gestión de Proyectos', description: 'Gestión integral de proyectos', type: 'internal', exists: true, category: 'Servicios' },
    { path: '/portafolio', title: 'Portafolio', description: 'Nuestros proyectos', type: 'internal', exists: true, category: 'Proyectos' },
    { path: '/portafolio/destacados', title: 'Proyectos Destacados', description: 'Proyectos más importantes', type: 'internal', exists: true, category: 'Proyectos' },
    { path: '/portafolio/casos-exito', title: 'Casos de Éxito', description: 'Historias de éxito', type: 'internal', exists: true, category: 'Proyectos' },
    { path: '/contacto', title: 'Contacto', description: 'Información de contacto', type: 'internal', exists: true, category: 'Principal' },
    { path: '/blog', title: 'Blog', description: 'Artículos y noticias', type: 'internal', exists: true, category: 'Contenido' },
    { path: '/carreras', title: 'Carreras', description: 'Oportunidades laborales', type: 'internal', exists: true, category: 'Empresa' }
  ];

  // URLs externas comunes
  const externalSuggestions: PageSuggestion[] = [
    { path: 'https://linkedin.com/company/metrica-dip', title: 'LinkedIn', description: 'Perfil de empresa', type: 'external', category: 'Redes Sociales' },
    { path: 'https://facebook.com/metricadip', title: 'Facebook', description: 'Página de Facebook', type: 'external', category: 'Redes Sociales' },
    { path: 'https://instagram.com/metricadip', title: 'Instagram', description: 'Perfil de Instagram', type: 'external', category: 'Redes Sociales' },
    { path: 'https://youtube.com/metricadip', title: 'YouTube', description: 'Canal de YouTube', type: 'external', category: 'Redes Sociales' },
    { path: 'mailto:info@metricadip.com', title: 'Email Directo', description: 'Contacto por email', type: 'external', category: 'Contacto' },
    { path: 'tel:+51999999999', title: 'Teléfono', description: 'Llamada directa', type: 'external', category: 'Contacto' }
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filterSuggestions = (query: string) => {
    if (!query) {
      return isInternal ? internalPages : externalSuggestions;
    }

    const searchTerm = query.toLowerCase();
    const pages = isInternal ? internalPages : externalSuggestions;

    return pages.filter(page =>
      page.path.toLowerCase().includes(searchTerm) ||
      page.title.toLowerCase().includes(searchTerm) ||
      (page.description?.toLowerCase().includes(searchTerm)) ||
      (page.category?.toLowerCase().includes(searchTerm))
    );
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setSuggestions(filterSuggestions(newValue));
    
    if (newValue !== value) {
      onChange(newValue, isInternal, generatePageMapping(newValue));
    }
  };

  const handleSelect = (selectedPath: string) => {
    setInputValue(selectedPath);
    setOpen(false);
    
    const selectedPage = [...internalPages, ...externalSuggestions].find(p => p.path === selectedPath);
    const pageIsInternal = selectedPage?.type === 'internal';
    
    if (onInternalChange && pageIsInternal !== isInternal) {
      onInternalChange(pageIsInternal);
    }
    
    onChange(selectedPath, pageIsInternal, generatePageMapping(selectedPath));
  };

  const generatePageMapping = (path: string): string => {
    // Generar mapping automático basado en la ruta
    if (!path || path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
      return '';
    }
    
    return path
      .replace(/^\/+/, '') // Remover barras iniciales
      .replace(/\/+$/, '') // Remover barras finales
      .replace(/\//g, '/') // Mantener estructura de rutas
      .toLowerCase();
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    
    // URLs internas (rutas)
    if (url.startsWith('/')) return true;
    
    // URLs externas
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getUrlType = (url: string): 'internal' | 'external' | 'invalid' => {
    if (!url) return 'invalid';
    
    if (url.startsWith('/')) return 'internal';
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return 'external';
    
    return 'invalid';
  };

  const groupedSuggestions = suggestions.reduce((groups, page) => {
    const category = page.category || 'Otros';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(page);
    return groups;
  }, {} as Record<string, PageSuggestion[]>);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-left font-normal"
              >
                <div className="flex items-center gap-2 flex-1 truncate">
                  {inputValue ? (
                    <>
                      {getUrlType(inputValue) === 'internal' ? (
                        <Home className="h-4 w-4 text-green-600" />
                      ) : getUrlType(inputValue) === 'external' ? (
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      ) : (
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="truncate">{inputValue}</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-muted-foreground">{placeholder}</span>
                    </>
                  )}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Buscar páginas..."
                  value={inputValue}
                  onValueChange={handleInputChange}
                />
                <CommandList>
                  <CommandEmpty>No se encontraron páginas</CommandEmpty>
                  
                  {Object.entries(groupedSuggestions).map(([category, pages]) => (
                    <CommandGroup key={category} heading={category}>
                      {pages.map((page) => (
                        <CommandItem
                          key={page.path}
                          value={page.path}
                          onSelect={() => handleSelect(page.path)}
                          className="flex items-center gap-3 p-3"
                        >
                          <div className="flex items-center gap-2">
                            {page.type === 'internal' ? (
                              <Home className="h-4 w-4 text-green-600" />
                            ) : (
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{page.title}</span>
                                {!page.exists && (
                                  <Badge variant="outline" className="text-xs">
                                    Nueva
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {page.path}
                              </div>
                              {page.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {page.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {value === page.path && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                  
                  {/* Opción para URL personalizada */}
                  {inputValue && !suggestions.find(s => s.path === inputValue) && validateUrl(inputValue) && (
                    <CommandGroup heading="URL Personalizada">
                      <CommandItem
                        value={inputValue}
                        onSelect={() => handleSelect(inputValue)}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {getUrlType(inputValue) === 'internal' ? (
                            <Home className="h-4 w-4 text-green-600" />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          )}
                          
                          <div>
                            <div className="font-medium">Usar URL personalizada</div>
                            <div className="text-sm text-muted-foreground">{inputValue}</div>
                          </div>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Toggle interno/externo */}
        {showToggle && onInternalChange && (
          <Button
            variant="outline"
            onClick={() => onInternalChange(!isInternal)}
            className="px-3"
            title={isInternal ? 'Cambiar a enlace externo' : 'Cambiar a enlace interno'}
          >
            {isInternal ? (
              <Home className="h-4 w-4 text-green-600" />
            ) : (
              <Globe className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        )}
      </div>
      
      {/* Estado de validación */}
      {inputValue && (
        <div className="flex items-center gap-2 text-xs">
          {validateUrl(inputValue) ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">URL válida</span>
              <Badge variant="outline" className="text-xs">
                {getUrlType(inputValue) === 'internal' ? 'Interno' : 'Externo'}
              </Badge>
            </>
          ) : (
            <>
              <div className="h-3 w-3 rounded-full bg-red-600"></div>
              <span className="text-red-600">URL inválida</span>
            </>
          )}
        </div>
      )}
      
      {/* Mapeo de página generado */}
      {inputValue && getUrlType(inputValue) === 'internal' && generatePageMapping(inputValue) && (
        <div className="text-xs text-muted-foreground">
          Mapeo: <code className="bg-gray-100 px-1 rounded">{generatePageMapping(inputValue)}</code>
        </div>
      )}
    </div>
  );
};

export default PageAutocomplete;