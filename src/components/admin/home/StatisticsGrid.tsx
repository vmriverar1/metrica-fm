'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, Briefcase, UserCheck, Award, Building, Target, Zap, Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import BulkOperations from '../BulkOperations';

interface Statistic {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

interface StatisticsGridProps {
  statistics: Statistic[];
  onChange: (statistics: Statistic[]) => void;
  iconPicker?: boolean;
  numberAnimation?: boolean;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  statistics,
  onChange,
  iconPicker = true,
  numberAnimation = true
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [animatingStats, setAnimatingStats] = useState<boolean[]>([false, false, false, false]);
  const [showBulkOps, setShowBulkOps] = useState(false);

  // Iconos disponibles con sus nombres
  const availableIcons = {
    'Briefcase': { icon: Briefcase, label: 'Maletín (Proyectos)' },
    'Users': { icon: Users, label: 'Usuarios (Clientes)' },
    'UserCheck': { icon: UserCheck, label: 'Usuario Check (Profesionales)' },
    'Award': { icon: Award, label: 'Premio (Años/Logros)' },
    'Building': { icon: Building, label: 'Edificio' },
    'Target': { icon: Target, label: 'Objetivo' },
    'TrendingUp': { icon: TrendingUp, label: 'Tendencia' },
    'Zap': { icon: Zap, label: 'Energía' }
  };

  const handleStatisticChange = (index: number, field: keyof Statistic, value: any) => {
    const updatedStats = [...statistics];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    onChange(updatedStats);
  };

  const animateNumber = (index: number) => {
    const newAnimatingStats = [...animatingStats];
    newAnimatingStats[index] = true;
    setAnimatingStats(newAnimatingStats);
    
    setTimeout(() => {
      newAnimatingStats[index] = false;
      setAnimatingStats(newAnimatingStats);
    }, 1000);
  };

  const renderIcon = (iconName: string, className = "h-8 w-8") => {
    const IconComponent = availableIcons[iconName as keyof typeof availableIcons]?.icon || Briefcase;
    return <IconComponent className={className} />;
  };

  const getStatisticColor = (index: number) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];
    return colors[index] || 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Editor de Estadísticas Interactivo
              <Badge variant="outline">4 Stats</Badge>
            </CardTitle>
            <CardDescription>
              Configure las 4 estadísticas principales que se muestran en el hero. Grid visual 2x2.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowBulkOps(!showBulkOps)}
              className="flex items-center gap-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              Bulk Ops
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Editar' : 'Preview'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Mode */}
        {showPreview && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-6 text-gray-800">Vista Previa Grid 2x2</h3>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {statistics.map((stat, index) => (
                <div
                  key={stat.id}
                  className={`text-center p-4 bg-white rounded-lg shadow-sm border transition-all duration-500 ${
                    animatingStats[index] ? 'scale-105 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                  <div className={`flex justify-center mb-2 ${getStatisticColor(index)}`}>
                    {renderIcon(stat.icon)}
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${getStatisticColor(index)} ${
                    animatingStats[index] ? 'animate-pulse' : ''
                  }`}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {!showPreview && (
          <div className="space-y-6">
            {statistics.map((stat, index) => (
              <Card key={stat.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={getStatisticColor(index)}>
                      {renderIcon(stat.icon, "h-5 w-5")}
                    </div>
                    <span>Estadística {index + 1}</span>
                    <Badge variant="secondary">{stat.id}</Badge>
                    {numberAnimation && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => animateNumber(index)}
                        className="ml-auto text-xs"
                      >
                        🎭 Animar
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Columna 1: Valor y Visual */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número/Valor *
                      </label>
                      <Input
                        type="number"
                        value={stat.value}
                        onChange={(e) => handleStatisticChange(index, 'value', Number(e.target.value))}
                        min={0}
                        max={9999}
                        className="text-2xl font-bold text-center"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sufijo (ej: +, M, K)
                      </label>
                      <Input
                        value={stat.suffix}
                        onChange={(e) => handleStatisticChange(index, 'suffix', e.target.value)}
                        placeholder="+"
                        maxLength={3}
                      />
                    </div>

                    {iconPicker && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icono
                        </label>
                        <Select
                          value={stat.icon}
                          onValueChange={(value) => handleStatisticChange(index, 'icon', value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {renderIcon(stat.icon, "h-4 w-4")}
                                {availableIcons[stat.icon as keyof typeof availableIcons]?.label || stat.icon}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(availableIcons).map(([key, iconData]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <iconData.icon className="h-4 w-4" />
                                  {iconData.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Columna 2: Textos */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etiqueta Principal *
                      </label>
                      <Input
                        value={stat.label}
                        onChange={(e) => handleStatisticChange(index, 'label', e.target.value)}
                        placeholder="ej: Proyectos, Clientes, Años..."
                        maxLength={25}
                      />
                      <p className="text-xs text-gray-500 mt-1">{stat.label.length}/25 caracteres</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <Textarea
                        value={stat.description}
                        onChange={(e) => handleStatisticChange(index, 'description', e.target.value)}
                        placeholder="Descripción detallada de la estadística..."
                        rows={3}
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">{stat.description.length}/100 caracteres</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID (identificador)
                      </label>
                      <Input
                        value={stat.id}
                        onChange={(e) => handleStatisticChange(index, 'id', e.target.value)}
                        placeholder="ej: projects, clients, years..."
                        maxLength={20}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#003F6F]">
                {statistics.reduce((acc, stat) => acc + stat.value, 0)}
              </p>
              <p className="text-xs text-gray-600">Suma Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E84E0F]">
                {Math.round(statistics.reduce((acc, stat) => acc + stat.value, 0) / statistics.length)}
              </p>
              <p className="text-xs text-gray-600">Promedio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {statistics.filter(stat => stat.value > 0 && stat.label.length > 0).length}
              </p>
              <p className="text-xs text-gray-600">Completas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(statistics.map(stat => stat.icon)).size}
              </p>
              <p className="text-xs text-gray-600">Iconos Únicos</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips para Estadísticas Efectivas:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use números redondos y fáciles de recordar (50+ en lugar de 47)</li>
            <li>• Los sufijos como "+" o "M" hacen los números más impactantes</li>
            <li>• Mantenga las etiquetas cortas pero descriptivas</li>
            <li>• Use iconos que reflejen claramente cada estadística</li>
            <li>• El orden importa: ponga las estadísticas más impresionantes primero</li>
          </ul>
        </div>

        {/* Bulk Operations */}
        {showBulkOps && (
          <BulkOperations
            items={statistics}
            itemType="statistics"
            onUpdate={onChange}
            maxItems={6}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsGrid;