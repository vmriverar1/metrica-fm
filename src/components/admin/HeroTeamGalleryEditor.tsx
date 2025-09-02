'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Upload, X, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeroTeamGalleryEditorProps {
  value?: string[][];
  onChange: (value: string[][]) => void;
  disabled?: boolean;
}

const defaultImages = [
  // Columna 1
  [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop&crop=face',
  ],
  // Columna 2
  [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=700&fit=crop&crop=face',
  ],
  // Columna 3
  [
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=700&fit=crop&crop=face',
  ],
];

export default function HeroTeamGalleryEditor({ 
  value = defaultImages, 
  onChange, 
  disabled = false 
}: HeroTeamGalleryEditorProps) {
  const [editingCell, setEditingCell] = useState<{ col: number; row: number } | null>(null);
  const [tempUrl, setTempUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImage = (colIndex: number, rowIndex: number, newUrl: string) => {
    const newValue = [...value];
    newValue[colIndex] = [...newValue[colIndex]];
    newValue[colIndex][rowIndex] = newUrl;
    onChange(newValue);
  };

  const handleEditStart = (col: number, row: number) => {
    setEditingCell({ col, row });
    setTempUrl(value[col][row]);
  };

  const handleEditSave = () => {
    if (editingCell && tempUrl.trim()) {
      updateImage(editingCell.col, editingCell.row, tempUrl.trim());
    }
    setEditingCell(null);
    setTempUrl('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setTempUrl('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingCell) return;

    // En un entorno real, aquí subirías el archivo a tu servidor
    // Por ahora, usamos un objeto URL temporal
    const objectUrl = URL.createObjectURL(file);
    updateImage(editingCell.col, editingCell.row, objectUrl);
    setEditingCell(null);
    setTempUrl('');
    
    // Limpiar el input file
    event.target.value = '';
  };

  const resetToDefaults = () => {
    onChange(defaultImages);
  };

  const ImageCell = ({ colIndex, rowIndex, imageUrl }: { 
    colIndex: number; 
    rowIndex: number; 
    imageUrl: string; 
  }) => {
    const isEditing = editingCell?.col === colIndex && editingCell?.row === rowIndex;
    
    return (
      <div className="relative group">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary/50 transition-colors">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Equipo ${colIndex + 1}-${rowIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/img/placeholder-team.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
          
          {/* Overlay con botones */}
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleEditStart(colIndex, rowIndex)}
                className="text-xs"
              >
                <ImageIcon size={14} className="mr-1" />
                Cambiar
              </Button>
            </div>
          )}
        </div>
        
        {/* Indicador de posición */}
        <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
          {colIndex + 1}-{rowIndex + 1}
        </Badge>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Galería del Hero - Equipo (9 imágenes)</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Grid 3x3 de imágenes del equipo que aparecen en el hero. Click en una imagen para editarla.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={disabled}
          >
            <RotateCcw size={16} className="mr-2" />
            Restaurar por defecto
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Grid 3x3 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {value.map((column, colIndex) => (
            <div key={colIndex} className="space-y-3">
              <div className="text-center">
                <Badge variant="outline">Columna {colIndex + 1}</Badge>
              </div>
              {column.map((imageUrl, rowIndex) => (
                <ImageCell
                  key={`${colIndex}-${rowIndex}`}
                  colIndex={colIndex}
                  rowIndex={rowIndex}
                  imageUrl={imageUrl}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Editor de imagen activo */}
        {editingCell && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Editando imagen {editingCell.col + 1}-{editingCell.row + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL de la imagen</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEditSave} size="sm">
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleEditCancel} size="sm">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Usar imágenes en proporción 3:4 (ej: 600x800px)</li>
            <li>• Preferir fotos profesionales del equipo</li>
            <li>• Optimizar tamaño de archivo para web (máx. 500KB)</li>
            <li>• Las posiciones se numeran como Columna-Fila (1-1, 1-2, 1-3, etc.)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}