'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  CheckCircle,
  AlertCircle,
  Grid3X3,
  Layers
} from 'lucide-react';
import { 
  validateIcon, 
  getIconSuggestions, 
  getCategories, 
  getIconComponent, 
  formatIconName,
  RECOMMENDED_STAT_ICONS 
} from '@/lib/icon-validator';

interface AdvancedIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function AdvancedIconPicker({
  value,
  onChange,
  label = "Ícono",
  placeholder = "Buscar ícono...",
  required = false,
  className = ''
}: AdvancedIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'categories' | 'recommended'>('search');

  // Validación del icono actual
  const validation = useMemo(() => validateIcon(value), [value]);

  // Sugerencias basadas en búsqueda
  const searchSuggestions = useMemo(() => 
    getIconSuggestions(searchQuery).slice(0, 12), 
    [searchQuery]
  );

  // Categorías de iconos
  const categories = useMemo(() => getCategories(), []);

  // Componente del icono actual
  const CurrentIcon = value ? getIconComponent(value) : null;

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderIconGrid = (icons: string[], showCategory = false) => (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {icons.map(iconName => {
        const IconComponent = getIconComponent(iconName);
        const isSelected = iconName === value;
        const isRecommended = RECOMMENDED_STAT_ICONS.includes(iconName);

        return (
          <button
            key={iconName}
            onClick={() => handleIconSelect(iconName)}
            className={`
              relative p-3 rounded-lg border transition-all duration-200 group
              hover:shadow-md hover:scale-105
              ${isSelected 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-background hover:bg-muted border-border'
              }
            `}
            title={`${formatIconName(iconName)}${isRecommended ? ' (Recomendado)' : ''}`}
          >
            {IconComponent && (
              <IconComponent className="h-5 w-5 mx-auto" />
            )}
            {isRecommended && (
              <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-current" />
            )}
            <span className="sr-only">{iconName}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <Label className="flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </Label>
      )}

      {/* Input Principal */}
      <div className="relative">
        <div className="flex items-center border rounded-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-r">
            {CurrentIcon ? (
              <CurrentIcon className="h-5 w-5 text-primary" />
            ) : (
              <Grid3X3 className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 focus:ring-0 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="border-l px-3"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mensaje de validación */}
      <div className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
        {validation.message}
      </div>

      {/* Sugerencias rápidas */}
      {!validation.isValid && validation.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-sm text-muted-foreground">Sugerencias:</span>
          {validation.suggestions.slice(0, 3).map(suggestion => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleIconSelect(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Selector expandido */}
      {isOpen && (
        <Card className="mt-2 border shadow-lg">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Categorías
                </TabsTrigger>
                <TabsTrigger value="recommended" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Recomendados
                </TabsTrigger>
              </TabsList>

              {/* Tab de Búsqueda */}
              <TabsContent value="search" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar iconos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchSuggestions.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {renderIconGrid(searchSuggestions.map(s => s.name))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No se encontraron iconos' : 'Escribe para buscar iconos'}
                  </div>
                )}
              </TabsContent>

              {/* Tab de Categorías */}
              <TabsContent value="categories" className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-4">
                  {categories.map(category => (
                    <div key={category.key}>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.label}
                        </Badge>
                        <span className="text-muted-foreground">({category.icons.length})</span>
                      </h4>
                      {renderIconGrid(category.icons)}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab de Recomendados */}
              <TabsContent value="recommended" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Iconos más utilizados para estadísticas
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {renderIconGrid(RECOMMENDED_STAT_ICONS)}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}