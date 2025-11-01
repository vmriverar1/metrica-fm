'use client';

import React, { useState, useCallback } from 'react';
import { 
  Palette, 
  Eyedropper,
  Copy, 
  Check, 
  RefreshCw,
  Wand2,
  Shuffle,
  Download,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  gradients: string[];
  created_at: string;
  is_default?: boolean;
}

interface GradientStop {
  color: string;
  position: number;
}

interface CustomGradient {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  direction: number; // degrees for linear
  stops: GradientStop[];
  css: string;
}

interface ColorCustomizerProps {
  selectedPalette?: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onGradientSelect: (gradient: string) => void;
  className?: string;
}

const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  selectedPalette,
  onPaletteChange,
  onGradientSelect,
  className
}) => {
  const [palettes, setPalettes] = useState<ColorPalette[]>([
    {
      id: 'default',
      name: 'Métrica FM Original',
      colors: {
        primary: '#003F6F',
        secondary: '#00A8E8',
        accent: '#F59E0B',
        background: '#FFFFFF',
        foreground: '#1F2937'
      },
      gradients: [
        'linear-gradient(135deg, #003F6F 0%, #00A8E8 100%)',
        'linear-gradient(45deg, #003F6F 0%, #F59E0B 100%)',
        'radial-gradient(circle, #003F6F 0%, #00A8E8 100%)'
      ],
      created_at: '2025-09-01T00:00:00Z',
      is_default: true
    },
    {
      id: 'modern',
      name: 'Moderno Azul',
      colors: {
        primary: '#1E40AF',
        secondary: '#06B6D4',
        accent: '#8B5CF6',
        background: '#F8FAFC',
        foreground: '#0F172A'
      },
      gradients: [
        'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)',
        'linear-gradient(45deg, #1E40AF 0%, #8B5CF6 100%)',
        'radial-gradient(circle, #06B6D4 0%, #8B5CF6 100%)'
      ],
      created_at: '2025-09-01T00:00:00Z'
    },
    {
      id: 'warm',
      name: 'Cálidos Naranja',
      colors: {
        primary: '#DC2626',
        secondary: '#F97316',
        accent: '#FCD34D',
        background: '#FEF7ED',
        foreground: '#7C2D12'
      },
      gradients: [
        'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
        'linear-gradient(45deg, #F97316 0%, #FCD34D 100%)',
        'radial-gradient(circle, #DC2626 0%, #FCD34D 100%)'
      ],
      created_at: '2025-09-01T00:00:00Z'
    }
  ]);

  const [customGradients, setCustomGradients] = useState<CustomGradient[]>([
    {
      id: '1',
      name: 'Promocional Azul',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#003F6F', position: 0 },
        { color: '#00A8E8', position: 100 }
      ],
      css: 'linear-gradient(135deg, #003F6F 0%, #00A8E8 100%)'
    }
  ]);

  const [activeTab, setActiveTab] = useState('palettes');
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);
  const [gradientBuilder, setGradientBuilder] = useState<CustomGradient>({
    id: '',
    name: 'Nuevo Gradiente',
    type: 'linear',
    direction: 135,
    stops: [
      { color: '#003F6F', position: 0 },
      { color: '#00A8E8', position: 100 }
    ],
    css: ''
  });
  const [copiedText, setCopiedText] = useState<string>('');

  // Generar CSS del gradiente
  const generateGradientCSS = useCallback((gradient: CustomGradient): string => {
    const stops = gradient.stops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.direction}deg, ${stops})`;
      case 'radial':
        return `radial-gradient(circle, ${stops})`;
      case 'conic':
        return `conic-gradient(from ${gradient.direction}deg, ${stops})`;
      default:
        return `linear-gradient(135deg, ${stops})`;
    }
  }, []);

  // Actualizar CSS cuando cambie el gradiente
  React.useEffect(() => {
    const css = generateGradientCSS(gradientBuilder);
    setGradientBuilder(prev => ({ ...prev, css }));
  }, [gradientBuilder.type, gradientBuilder.direction, gradientBuilder.stops, generateGradientCSS]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
      
      toast({
        title: "Copiado",
        description: "Código copiado al portapapeles"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      });
    }
  };

  const generateRandomPalette = () => {
    const hues = [200, 220, 240, 260, 280, 300]; // Tonos azules/fríos
    const baseHue = hues[Math.floor(Math.random() * hues.length)];
    
    const newPalette: ColorPalette = {
      id: `random_${Date.now()}`,
      name: `Paleta Aleatoria ${new Date().toLocaleTimeString()}`,
      colors: {
        primary: `hsl(${baseHue}, 70%, 45%)`,
        secondary: `hsl(${(baseHue + 120) % 360}, 80%, 55%)`,
        accent: `hsl(${(baseHue + 60) % 360}, 90%, 60%)`,
        background: `hsl(${baseHue}, 20%, 98%)`,
        foreground: `hsl(${baseHue}, 30%, 15%)`
      },
      gradients: [
        `linear-gradient(135deg, hsl(${baseHue}, 70%, 45%) 0%, hsl(${(baseHue + 120) % 360}, 80%, 55%) 100%)`,
        `radial-gradient(circle, hsl(${baseHue}, 70%, 45%) 0%, hsl(${(baseHue + 60) % 360}, 90%, 60%) 100%)`
      ],
      created_at: new Date().toISOString()
    };

    setPalettes(prev => [...prev, newPalette]);
    setEditingPalette(newPalette);
    
    toast({
      title: "Paleta generada",
      description: "Se ha creado una nueva paleta de colores aleatoria"
    });
  };

  const savePalette = () => {
    if (!editingPalette) return;

    const existingIndex = palettes.findIndex(p => p.id === editingPalette.id);
    
    if (existingIndex >= 0) {
      const updatedPalettes = [...palettes];
      updatedPalettes[existingIndex] = editingPalette;
      setPalettes(updatedPalettes);
    } else {
      setPalettes(prev => [...prev, editingPalette]);
    }

    onPaletteChange(editingPalette);
    setEditingPalette(null);
    
    toast({
      title: "Paleta guardada",
      description: `${editingPalette.name} se ha guardado correctamente`
    });
  };

  const addGradientStop = () => {
    const newPosition = 50; // Posición intermedia
    setGradientBuilder(prev => ({
      ...prev,
      stops: [...prev.stops, { color: '#888888', position: newPosition }]
        .sort((a, b) => a.position - b.position)
    }));
  };

  const removeGradientStop = (index: number) => {
    if (gradientBuilder.stops.length <= 2) {
      toast({
        title: "Error",
        description: "Un gradiente debe tener al menos 2 colores",
        variant: "destructive"
      });
      return;
    }

    setGradientBuilder(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const updateGradientStop = (index: number, field: 'color' | 'position', value: string | number) => {
    setGradientBuilder(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const saveCustomGradient = () => {
    if (!gradientBuilder.name.trim()) {
      toast({
        title: "Error",
        description: "El gradiente debe tener un nombre",
        variant: "destructive"
      });
      return;
    }

    const newGradient = {
      ...gradientBuilder,
      id: `gradient_${Date.now()}`,
      css: generateGradientCSS(gradientBuilder)
    };

    setCustomGradients(prev => [...prev, newGradient]);
    
    // Reset builder
    setGradientBuilder({
      id: '',
      name: 'Nuevo Gradiente',
      type: 'linear',
      direction: 135,
      stops: [
        { color: '#003F6F', position: 0 },
        { color: '#00A8E8', position: 100 }
      ],
      css: ''
    });

    toast({
      title: "Gradiente guardado",
      description: `${newGradient.name} se ha guardado en la librería`
    });
  };

  const presetGradients = [
    { name: 'Océano', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Sunset', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Forest', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Fire', css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Night', css: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)' },
    { name: 'Aurora', css: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalizador de Colores y Gradientes
          </CardTitle>
          <CardDescription>
            Crea y gestiona paletas de colores y gradientes personalizados para el megamenú
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="palettes">Paletas</TabsTrigger>
              <TabsTrigger value="gradients">Gradientes</TabsTrigger>
              <TabsTrigger value="builder">Constructor</TabsTrigger>
            </TabsList>

            {/* Tab Paletas */}
            <TabsContent value="palettes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Paletas de Colores</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateRandomPalette}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generar Aleatoria
                  </Button>
                  <Button onClick={() => setEditingPalette({
                    id: `custom_${Date.now()}`,
                    name: 'Nueva Paleta',
                    colors: {
                      primary: '#003F6F',
                      secondary: '#00A8E8',
                      accent: '#F59E0B',
                      background: '#FFFFFF',
                      foreground: '#1F2937'
                    },
                    gradients: [],
                    created_at: new Date().toISOString()
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Paleta
                  </Button>
                </div>
              </div>

              {/* Editor de paleta */}
              {editingPalette && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Editando: {editingPalette.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nombre de la paleta</Label>
                      <Input
                        value={editingPalette.name}
                        onChange={(e) => setEditingPalette(prev => 
                          prev ? { ...prev, name: e.target.value } : null
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(editingPalette.colors).map(([key, value]) => (
                        <div key={key}>
                          <Label className="capitalize">{key}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={value}
                              onChange={(e) => setEditingPalette(prev => 
                                prev ? {
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value }
                                } : null
                              )}
                              className="w-16 h-10 p-1 rounded cursor-pointer"
                            />
                            <Input
                              value={value}
                              onChange={(e) => setEditingPalette(prev => 
                                prev ? {
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value }
                                } : null
                              )}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={savePalette}>
                        <Check className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingPalette(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grid de paletas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {palettes.map((palette) => (
                  <Card 
                    key={palette.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPalette?.id === palette.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{palette.name}</h4>
                          {palette.is_default && (
                            <Badge variant="default" className="text-xs">Por defecto</Badge>
                          )}
                        </div>
                        
                        {/* Muestra de colores */}
                        <div className="flex gap-1 h-8 rounded overflow-hidden">
                          {Object.values(palette.colors).map((color, index) => (
                            <div
                              key={index}
                              className="flex-1"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>

                        {/* Gradientes de muestra */}
                        {palette.gradients.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Gradientes incluidos:</p>
                            <div className="grid grid-cols-2 gap-1">
                              {palette.gradients.slice(0, 4).map((gradient, index) => (
                                <div
                                  key={index}
                                  className="h-6 rounded cursor-pointer hover:scale-105 transition-transform"
                                  style={{ background: gradient }}
                                  onClick={() => onGradientSelect(gradient)}
                                  title="Click para usar este gradiente"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => onPaletteChange(palette)}
                            className="flex-1"
                          >
                            Usar Paleta
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingPalette(palette)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab Gradientes */}
            <TabsContent value="gradients" className="space-y-6">
              {/* Gradientes preestablecidos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Gradientes Preestablecidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {presetGradients.map((gradient, index) => (
                    <div
                      key={index}
                      className="h-16 rounded-lg cursor-pointer hover:scale-105 transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                      style={{ background: gradient.css }}
                      onClick={() => onGradientSelect(gradient.css)}
                      title={`${gradient.name} - Click para usar`}
                    >
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-xs font-medium text-center">
                          {gradient.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradientes personalizados */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Gradientes Personalizados</h3>
                {customGradients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay gradientes personalizados</p>
                    <p className="text-sm">Usa el Constructor para crear tus propios gradientes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customGradients.map((gradient) => (
                      <Card key={gradient.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{gradient.name}</h4>
                              <Badge variant="outline" className="text-xs capitalize">
                                {gradient.type}
                              </Badge>
                            </div>
                            
                            <div
                              className="h-16 rounded-lg"
                              style={{ background: gradient.css }}
                            />
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <code className="bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                                {gradient.css}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(gradient.css)}
                                className="h-6 w-6 p-0"
                              >
                                {copiedText === gradient.css ? 
                                  <Check className="h-3 w-3 text-green-600" /> : 
                                  <Copy className="h-3 w-3" />
                                }
                              </Button>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => onGradientSelect(gradient.css)}
                                className="flex-1"
                              >
                                Usar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setCustomGradients(prev => prev.filter(g => g.id !== gradient.id));
                                  toast({
                                    title: "Gradiente eliminado",
                                    description: `${gradient.name} se ha eliminado`
                                  });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Constructor */}
            <TabsContent value="builder" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel de construcción */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Constructor de Gradientes</h3>
                  
                  <div>
                    <Label>Nombre del gradiente</Label>
                    <Input
                      value={gradientBuilder.name}
                      onChange={(e) => setGradientBuilder(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mi gradiente personalizado"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={gradientBuilder.type}
                        onChange={(e) => setGradientBuilder(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'linear' | 'radial' | 'conic' 
                        }))}
                      >
                        <option value="linear">Lineal</option>
                        <option value="radial">Radial</option>
                        <option value="conic">Cónico</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label>Dirección (grados)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="360"
                        value={gradientBuilder.direction}
                        onChange={(e) => setGradientBuilder(prev => ({ 
                          ...prev, 
                          direction: parseInt(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>

                  {/* Paradas de color */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Colores ({gradientBuilder.stops.length})</Label>
                      <Button size="sm" onClick={addGradientStop}>
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Color
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {gradientBuilder.stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <Input
                            type="color"
                            value={stop.color}
                            onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                            className="w-12 h-8 p-1 rounded cursor-pointer"
                          />
                          <Input
                            value={stop.color}
                            onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={stop.position}
                            onChange={(e) => updateGradientStop(index, 'position', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                          {gradientBuilder.stops.length > 2 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeGradientStop(index)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveCustomGradient} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      Guardar Gradiente
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onGradientSelect(gradientBuilder.css)}
                    >
                      Usar Ahora
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vista Previa</h3>
                  
                  <div 
                    className="h-32 rounded-lg border-2 border-dashed border-gray-300"
                    style={{ background: gradientBuilder.css }}
                  />
                  
                  <div className="space-y-2">
                    <Label>Código CSS</Label>
                    <div className="relative">
                      <code className="block bg-gray-100 p-3 rounded text-sm font-mono break-all">
                        background: {gradientBuilder.css};
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`background: ${gradientBuilder.css};`)}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        {copiedText === `background: ${gradientBuilder.css};` ? 
                          <Check className="h-3 w-3 text-green-600" /> : 
                          <Copy className="h-3 w-3" />
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Preview en diferentes contextos */}
                  <div>
                    <Label>Contextos de uso</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div 
                        className="h-12 rounded flex items-center justify-center text-white text-sm font-medium"
                        style={{ background: gradientBuilder.css }}
                      >
                        Botón
                      </div>
                      <div 
                        className="h-12 rounded border-2 flex items-center justify-center text-gray-700 text-sm"
                        style={{ borderImage: `${gradientBuilder.css} 1` }}
                      >
                        Borde
                      </div>
                      <div 
                        className="h-12 rounded flex items-center justify-center text-gray-700 text-sm relative overflow-hidden"
                      >
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{ background: gradientBuilder.css }}
                        />
                        <span className="relative">Fondo sutil</span>
                      </div>
                      <div 
                        className="h-12 rounded flex items-center justify-center text-white text-sm font-medium"
                        style={{ 
                          background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), ${gradientBuilder.css}`
                        }}
                      >
                        Con overlay
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorCustomizer;