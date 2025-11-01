'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GradientSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  defaultColors?: {
    from: string;
    to: string;
  };
}

export default function GradientSelector({
  value = '',
  onChange,
  disabled = false,
  defaultColors = { from: '#003F6F', to: '#001A33' }
}: GradientSelectorProps) {
  const [fromColor, setFromColor] = useState(defaultColors.from);
  const [toColor, setToColor] = useState(defaultColors.to);

  // Parse existing value on component mount
  useEffect(() => {
    if (value && value.includes('from-[') && value.includes('to-[')) {
      const fromMatch = value.match(/from-\[(#[0-9A-Fa-f]{6})\]/);
      const toMatch = value.match(/to-\[(#[0-9A-Fa-f]{6})\]/);

      if (fromMatch && fromMatch[1]) {
        setFromColor(fromMatch[1]);
      }
      if (toMatch && toMatch[1]) {
        setToColor(toMatch[1]);
      }
    }
  }, [value]);

  // Generate Tailwind CSS class when colors change
  useEffect(() => {
    const newGradient = `from-[${fromColor}] via-[${adjustBrightness(fromColor, -20)}] to-[${toColor}]`;
    if (newGradient !== value) {
      onChange(newGradient);
    }
  }, [fromColor, toColor]); // Removed onChange from dependencies

  // Helper function to adjust brightness for the middle color
  const adjustBrightness = useCallback((hexColor: string, percent: number): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
    const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
    const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));

    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }, []);

  const copyToClipboard = useCallback(() => {
    const gradientValue = `from-[${fromColor}] via-[${adjustBrightness(fromColor, -20)}] to-[${toColor}]`;
    navigator.clipboard.writeText(gradientValue);
  }, [fromColor, toColor, adjustBrightness]);

  const gradientStyle = useCallback(() => ({
    background: `linear-gradient(to bottom right, ${fromColor}, ${adjustBrightness(fromColor, -20)}, ${toColor})`
  }), [fromColor, toColor, adjustBrightness]);

  // Preset gradients
  const presets = [
    { name: 'Azul Corporativo', from: '#003F6F', to: '#001A33' },
    { name: 'Naranja Métrica', from: '#00A8E8', to: '#B8390A' },
    { name: 'Azul Oscuro', from: '#1e3a8a', to: '#0f172a' },
    { name: 'Verde Profesional', from: '#065f46', to: '#022c22' },
    { name: 'Púrpura Moderno', from: '#581c87', to: '#2e1065' },
    { name: 'Gris Elegante', from: '#374151', to: '#111827' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Palette className="w-4 h-4" />
          Selector de Gradiente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Vista Previa</Label>
          <div
            className="w-full h-20 rounded-lg border-2 border-gray-200"
            style={gradientStyle()}
          />
        </div>

        {/* Color Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from-color" className="text-sm font-medium mb-2 block">
              Color Inicial
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="from-color"
                type="color"
                value={fromColor}
                onChange={(e) => setFromColor(e.target.value)}
                disabled={disabled}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={fromColor}
                onChange={(e) => setFromColor(e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="#003F6F"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="to-color" className="text-sm font-medium mb-2 block">
              Color Final
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="to-color"
                type="color"
                value={toColor}
                onChange={(e) => setToColor(e.target.value)}
                disabled={disabled}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={toColor}
                onChange={(e) => setToColor(e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="#001A33"
              />
            </div>
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Gradientes Predefinidos</Label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setFromColor(preset.from);
                  setToColor(preset.to);
                }}
                disabled={disabled}
                className="flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    background: `linear-gradient(to right, ${preset.from}, ${preset.to})`
                  }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generated CSS */}
        <div>
          <Label className="text-sm font-medium mb-2 block">CSS Generado</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex-1 font-mono text-xs p-2">
              {`from-[${fromColor}] via-[${adjustBrightness(fromColor, -20)}] to-[${toColor}]`}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              disabled={disabled}
              className="px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Este gradiente incluye un color intermedio automático para mayor suavidad
          </p>
        </div>
      </CardContent>
    </Card>
  );
}