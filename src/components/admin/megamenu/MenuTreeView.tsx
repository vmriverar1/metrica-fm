'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MousePointer,
  Link,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface MegaMenuSubLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  enabled: boolean;
  is_internal: boolean;
  page_mapping: string;
  order: number;
  click_count: number;
}

interface MegaMenuItem {
  id: string;
  order: number;
  enabled: boolean;
  type: 'megamenu' | 'simple';
  label: string;
  href?: string | null;
  icon: string;
  description: string;
  is_internal?: boolean;
  page_mapping?: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  submenu?: {
    layout: string;
    section1: {
      title: string;
      description: string;
      highlight_color: string;
    };
    links: MegaMenuSubLink[];
    section3: {
      type: string;
      title: string;
      description: string;
      image: string;
      cta: {
        text: string;
        href: string;
        type: string;
        page_mapping?: string;
      };
      background_gradient: string;
    };
  };
}

interface MenuTreeViewProps {
  items: MegaMenuItem[];
  onReorder: (newOrder: string[]) => void;
  onEdit: (item: MegaMenuItem) => void;
  onDelete: (itemId: string) => void;
  onPreview: (item: MegaMenuItem) => void;
  onAddSublink: (itemId: string) => void;
  loading?: boolean;
}

const MenuTreeView: React.FC<MenuTreeViewProps> = ({
  items,
  onReorder,
  onEdit,
  onDelete,
  onPreview,
  onAddSublink,
  loading = false
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedItems = Array.from(items);
    const [reorderedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, reorderedItem);

    // Crear array de IDs en el nuevo orden
    const newOrder = reorderedItems.map(item => item.id);
    onReorder(newOrder);
  };

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable 
          droppableId="menu-items" 
          type="MENU_ITEM" 
          isDropDisabled={false} 
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-4 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50 p-2 rounded-lg border-2 border-dashed border-blue-300' : ''
              }`}
            >
              {sortedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={false}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transform transition-all duration-200 ${
                        snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50' : 'hover:shadow-md'
                      }`}
                    >
                      <Card className={`border-l-4 ${
                        item.enabled 
                          ? item.type === 'megamenu' 
                            ? 'border-l-blue-500' 
                            : 'border-l-green-500'
                          : 'border-l-gray-300'
                      } ${snapshot.isDragging ? 'shadow-2xl bg-white' : ''}`}>
                        <CardContent className="p-4">
                          {/* Header del Item */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
                                title="Arrastra para reordenar"
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>

                              {/* Expand/Collapse for MegaMenus */}
                              {item.type === 'megamenu' && item.submenu && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(item.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {expandedItems.has(item.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}

                              {/* Icon and Label */}
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={item.icon} className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">{item.label}</span>
                              </div>

                              {/* Badges */}
                              <div className="flex items-center gap-2">
                                <Badge variant={item.type === 'megamenu' ? 'default' : 'secondary'}>
                                  {item.type === 'megamenu' ? 'MegaMenu' : 'Simple'}
                                </Badge>
                                <Badge variant={item.enabled ? 'default' : 'destructive'}>
                                  {item.enabled ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  #{item.order}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onPreview(item)}
                                title="Vista previa"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onEdit(item)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onDelete(item.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-3 ml-11">
                            {item.description}
                          </p>

                          {/* Submenu Links (Expandible) */}
                          {item.type === 'megamenu' && 
                           item.submenu && 
                           expandedItems.has(item.id) && (
                            <div className="mt-4 ml-11 pl-4 border-l-2 border-gray-100 space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">
                                  Enlaces del submenú ({item.submenu.links.length}):
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddSublink(item.id)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar
                                </Button>
                              </div>

                              {/* Submenu Links Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.submenu.links
                                  .sort((a, b) => a.order - b.order)
                                  .map((link) => (
                                    <div 
                                      key={link.id} 
                                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                                        link.enabled ? 'bg-white' : 'bg-gray-50 opacity-70'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <DynamicIcon name={link.icon} className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium text-sm">{link.title}</span>
                                        {!link.enabled && (
                                          <Badge variant="destructive" className="text-xs h-4">
                                            Inactivo
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2">
                                        {link.description}
                                      </p>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Link className="h-3 w-3" />
                                          {link.is_internal ? 'Interno' : 'Externo'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MousePointer className="h-3 w-3" />
                                          {link.click_count}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              {/* Section 3 Info (Promotional) */}
                              {item.submenu.section3 && (
                                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm text-gray-800 mb-1">
                                        Sección Promocional
                                      </h4>
                                      <p className="text-xs text-gray-600 mb-2">
                                        {item.submenu.section3.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.submenu.section3.description}
                                      </p>
                                      {item.submenu.section3.cta && (
                                        <div className="mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            CTA: {item.submenu.section3.cta.text}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    {item.submenu.section3.image && (
                                      <div className="w-16 h-10 bg-gray-200 rounded border ml-3 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">IMG</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Footer Info */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t ml-11">
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              {item.click_count} clicks
                            </span>
                            <span>
                              Actualizado: {new Date(item.updated_at).toLocaleDateString()}
                            </span>
                            {item.href && (
                              <span className="flex items-center gap-1">
                                <Link className="h-3 w-3" />
                                {item.is_internal ? 'Interno' : 'Externo'}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MenuTreeView;