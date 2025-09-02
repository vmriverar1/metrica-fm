'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown } from 'lucide-react';
import { LUCIDE_ICONS, LucideIconName } from '@/types/dynamic-elements';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface IconPickerProps {
  value: string;
  onChange: (icon: LucideIconName) => void;
  error?: boolean;
  placeholder?: string;
}

export default function IconPicker({ 
  value, 
  onChange, 
  error = false,
  placeholder = "Seleccionar ícono" 
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar íconos por búsqueda
  const filteredIcons = LUCIDE_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIconSelect = (icon: LucideIconName) => {
    onChange(icon);
    setOpen(false);
  };

  const isValidIcon = LUCIDE_ICONS.includes(value as LucideIconName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${error ? 'border-destructive' : ''}`}
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <DynamicIcon 
                  name={value} 
                  className="h-4 w-4" 
                  fallbackIcon="Circle"
                />
                <span>{value}</span>
                {!isValidIcon && (
                  <Badge variant="destructive" className="text-xs">
                    Inválido
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar íconos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredIcons.length} íconos encontrados
            </div>
          )}
        </div>
        <ScrollArea className="h-64">
          <div className="p-2">
            {filteredIcons.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No se encontraron íconos para "{searchTerm}"
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant={value === icon ? "default" : "ghost"}
                    className="h-10 w-10 p-0"
                    onClick={() => handleIconSelect(icon)}
                    title={icon}
                  >
                    <DynamicIcon 
                      name={icon} 
                      className="h-4 w-4" 
                      fallbackIcon="Circle"
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total: {LUCIDE_ICONS.length} íconos</span>
            <span>Lucide React</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}