'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageSquare,
  Save,
  X,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export interface ContactInfo {
  id: string;
  type: 'address' | 'phone' | 'email' | 'hours' | 'website' | 'social' | 'other';
  icon: string;
  title: string;
  content: string;
  order: number;
  status: 'active' | 'inactive';
  metadata?: {
    country_code?: string;
    timezone?: string;
    verification_status?: 'verified' | 'pending' | 'error';
    clickable?: boolean;
    external_link?: string;
  };
}

interface ContactInfoManagerProps {
  contactInfo: ContactInfo[];
  onChange: (contactInfo: ContactInfo[]) => void;
  allowReordering?: boolean;
  maxItems?: number;
  contextType?: 'contact' | 'footer' | 'services' | 'general';
  showVerification?: boolean;
  allowExternalLinks?: boolean;
  validation?: {
    titleRequired?: boolean;
    titleMaxLength?: number;
    contentRequired?: boolean;
    contentMaxLength?: number;
  };
}

export const ContactInfoManager: React.FC<ContactInfoManagerProps> = ({
  contactInfo = [],
  onChange,
  allowReordering = true,
  maxItems = 10,
  contextType = 'contact',
  showVerification = true,
  allowExternalLinks = true,
  validation = {
    titleRequired: true,
    titleMaxLength: 100,
    contentRequired: true,
    contentMaxLength: 500
  }
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactInfo, setNewContactInfo] = useState<Partial<ContactInfo>>({
    type: 'address',
    icon: 'MapPin',
    title: '',
    content: '',
    status: 'active',
    metadata: {}
  });

  // Iconos disponibles por tipo
  const iconsByType = {
    address: ['MapPin', 'Home', 'Building', 'Navigation'],
    phone: ['Phone', 'Smartphone', 'PhoneCall'],
    email: ['Mail', 'Send', 'Inbox'],
    hours: ['Clock', 'Calendar', 'Watch'],
    website: ['Globe', 'Link', 'ExternalLink'],
    social: ['MessageSquare', 'Share2', 'Users'],
    other: ['Info', 'FileText', 'Star']
  };

  // Templates por tipo
  const templatesByType = {
    address: {
      title: 'Oficina Principal',
      content: 'Av. El Derby 055, Piso 9\nSantiago de Surco, Lima - Perú',
      metadata: { clickable: true }
    },
    phone: {
      title: 'Teléfonos',
      content: '+51 1 719-5990\n+51 999 999 999 (WhatsApp)',
      metadata: { country_code: '+51', clickable: true }
    },
    email: {
      title: 'Email',
      content: 'info@metrica-dip.com\nproyectos@metrica-dip.com',
      metadata: { clickable: true }
    },
    hours: {
      title: 'Horarios de Atención',
      content: 'Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 1:00 PM',
      metadata: { timezone: 'America/Lima' }
    }
  };

  // Agregar nueva información de contacto
  const handleAddContactInfo = () => {
    if (!newContactInfo.title?.trim() || !newContactInfo.content?.trim()) return;

    const id = Date.now().toString();
    const contactInfoItem: ContactInfo = {
      id,
      type: newContactInfo.type || 'other',
      icon: newContactInfo.icon || 'Info',
      title: newContactInfo.title.trim(),
      content: newContactInfo.content.trim(),
      order: contactInfo.length,
      status: newContactInfo.status || 'active',
      metadata: {
        verification_status: 'pending',
        clickable: newContactInfo.metadata?.clickable || false,
        ...newContactInfo.metadata
      }
    };

    onChange([...contactInfo, contactInfoItem]);
    setNewContactInfo({ 
      type: 'address', 
      icon: 'MapPin', 
      title: '', 
      content: '', 
      status: 'active',
      metadata: {}
    });
    setShowAddForm(false);
  };

  // Actualizar información existente
  const handleUpdateContactInfo = (id: string, updates: Partial<ContactInfo>) => {
    const updatedContactInfo = contactInfo.map(item => 
      item.id === id 
        ? { ...item, ...updates }
        : item
    );
    onChange(updatedContactInfo);
    setEditingId(null);
  };

  // Eliminar información
  const handleDeleteContactInfo = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta información de contacto?')) {
      const updatedContactInfo = contactInfo.filter(item => item.id !== id);
      onChange(updatedContactInfo);
    }
  };

  // Duplicar información
  const handleDuplicateContactInfo = (item: ContactInfo) => {
    const duplicated: ContactInfo = {
      ...item,
      id: Date.now().toString(),
      title: `${item.title} (Copia)`,
      order: contactInfo.length
    };
    onChange([...contactInfo, duplicated]);
  };

  // Reordenar información
  const handleDragEnd = (result: any) => {
    if (!result.destination || !allowReordering) return;

    const items = Array.from(contactInfo);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedContactInfo = items.map((item, index) => ({
      ...item,
      order: index
    }));

    onChange(reorderedContactInfo);
  };

  // Aplicar template
  const applyTemplate = (type: keyof typeof templatesByType) => {
    const template = templatesByType[type];
    setNewContactInfo({
      type: type as any,
      icon: iconsByType[type as keyof typeof iconsByType][0],
      title: template.title,
      content: template.content,
      status: 'active',
      metadata: template.metadata
    });
    setShowAddForm(true);
  };

  // Verificar información (simulado)
  const handleVerifyContactInfo = (id: string) => {
    const item = contactInfo.find(item => item.id === id);
    if (!item) return;

    // Simulación de verificación
    const verified = Math.random() > 0.3; // 70% éxito
    const status = verified ? 'verified' : 'error';
    
    handleUpdateContactInfo(id, {
      metadata: {
        ...item.metadata,
        verification_status: status
      }
    });
  };

  // Obtener icono de componente
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      MapPin, Phone, Mail, Clock, Globe, MessageSquare,
      Home: MapPin, Building: MapPin, Navigation: MapPin,
      Smartphone: Phone, PhoneCall: Phone,
      Send: Mail, Inbox: Mail,
      Calendar: Clock, Watch: Clock,
      Link: Globe, ExternalLink: Globe,
      Share2: MessageSquare, Users: MessageSquare,
      Info: MessageSquare, FileText: MessageSquare, Star: MessageSquare
    };
    return icons[iconName] || MessageSquare;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
            <Badge variant="secondary">{contactInfo.length}/{maxItems}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              disabled={contactInfo.length >= maxItems}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Info
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Templates rápidos */}
        {showAddForm && (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Templates Rápidos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.keys(templatesByType).map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(type as keyof typeof templatesByType)}
                    className="justify-start"
                  >
                    {React.createElement(getIconComponent(iconsByType[type as keyof typeof iconsByType][0]), { className: "w-4 h-4 mr-2" })}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de nueva información */}
        {showAddForm && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      value={newContactInfo.type || 'address'}
                      onChange={(e) => {
                        const type = e.target.value as ContactInfo['type'];
                        setNewContactInfo(prev => ({
                          ...prev,
                          type,
                          icon: iconsByType[type]?.[0] || 'Info'
                        }));
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="address">Dirección</option>
                      <option value="phone">Teléfono</option>
                      <option value="email">Email</option>
                      <option value="hours">Horarios</option>
                      <option value="website">Sitio Web</option>
                      <option value="social">Redes Sociales</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Icono</label>
                    <select
                      value={newContactInfo.icon || 'Info'}
                      onChange={(e) => setNewContactInfo(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      {iconsByType[newContactInfo.type as keyof typeof iconsByType]?.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      )) || <option value="Info">Info</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={newContactInfo.title || ''}
                    onChange={(e) => setNewContactInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Oficina Principal"
                    maxLength={validation.titleMaxLength}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contenido *</label>
                  <Textarea
                    value={newContactInfo.content || ''}
                    onChange={(e) => setNewContactInfo(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Información de contacto detallada"
                    maxLength={validation.contentMaxLength}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="clickable"
                      checked={newContactInfo.metadata?.clickable || false}
                      onChange={(e) => setNewContactInfo(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, clickable: e.target.checked }
                      }))}
                    />
                    <label htmlFor="clickable" className="text-sm">Enlace clickeable</label>
                  </div>

                  {allowExternalLinks && (
                    <div>
                      <label className="text-sm font-medium">Enlace Externo</label>
                      <Input
                        value={newContactInfo.metadata?.external_link || ''}
                        onChange={(e) => setNewContactInfo(prev => ({
                          ...prev,
                          metadata: { ...prev.metadata, external_link: e.target.value }
                        }))}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddContactInfo} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de información de contacto */}
        {allowReordering ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="contactInfo">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {contactInfo.map((item, index) => (
                    <ContactInfoItem
                      key={item.id}
                      item={item}
                      index={index}
                      editingId={editingId}
                      onEdit={setEditingId}
                      onUpdate={handleUpdateContactInfo}
                      onDelete={handleDeleteContactInfo}
                      onDuplicate={handleDuplicateContactInfo}
                      onVerify={handleVerifyContactInfo}
                      showVerification={showVerification}
                      allowExternalLinks={allowExternalLinks}
                      iconsByType={iconsByType}
                      getIconComponent={getIconComponent}
                      validation={validation}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="space-y-3">
            {contactInfo.map((item, index) => (
              <ContactInfoItem
                key={item.id}
                item={item}
                index={index}
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={handleUpdateContactInfo}
                onDelete={handleDeleteContactInfo}
                onDuplicate={handleDuplicateContactInfo}
                onVerify={handleVerifyContactInfo}
                showVerification={showVerification}
                allowExternalLinks={allowExternalLinks}
                iconsByType={iconsByType}
                getIconComponent={getIconComponent}
                validation={validation}
                draggable={false}
              />
            ))}
          </div>
        )}

        {contactInfo.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay información de contacto configurada</p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              Agregar primera información
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente individual de información de contacto
interface ContactInfoItemProps {
  item: ContactInfo;
  index: number;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ContactInfo>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: ContactInfo) => void;
  onVerify: (id: string) => void;
  showVerification: boolean;
  allowExternalLinks: boolean;
  iconsByType: any;
  getIconComponent: (iconName: string) => any;
  validation: any;
  draggable?: boolean;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  item,
  index,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onVerify,
  showVerification,
  allowExternalLinks,
  iconsByType,
  getIconComponent,
  validation,
  draggable = true
}) => {
  const [editData, setEditData] = useState<Partial<ContactInfo>>(item);
  const IconComponent = getIconComponent(item.icon);

  const handleSave = () => {
    onUpdate(item.id, editData);
  };

  const getVerificationIcon = () => {
    switch (item.metadata?.verification_status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const ContactInfoContent = () => (
    <Card className={`${item.status === 'inactive' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {editingId === item.id ? (
          // Modo edición
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={editData.type || 'other'}
                  onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as ContactInfo['type'] }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="address">Dirección</option>
                  <option value="phone">Teléfono</option>
                  <option value="email">Email</option>
                  <option value="hours">Horarios</option>
                  <option value="website">Sitio Web</option>
                  <option value="social">Redes Sociales</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Icono</label>
                <select
                  value={editData.icon || 'Info'}
                  onChange={(e) => setEditData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  {iconsByType[editData.type as keyof typeof iconsByType]?.map((icon: string) => (
                    <option key={icon} value={icon}>{icon}</option>
                  )) || <option value="Info">Info</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={editData.title || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={validation.titleMaxLength}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                value={editData.content || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                maxLength={validation.contentMaxLength}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={() => onEdit(null)} size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Modo visualización
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {draggable && (
                  <Move className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
                )}
                <IconComponent className="w-5 h-5 text-[#003F6F] mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    {item.status === 'inactive' && (
                      <Badge variant="destructive">Inactiva</Badge>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm whitespace-pre-line">
                    {item.content}
                  </div>
                  
                  {/* Enlaces y acciones */}
                  <div className="flex gap-2 mt-2">
                    {item.metadata?.clickable && (
                      <Badge variant="secondary" className="text-xs">
                        Clickeable
                      </Badge>
                    )}
                    {item.metadata?.external_link && allowExternalLinks && (
                      <a 
                        href={item.metadata.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {showVerification && (
                      <div className="flex items-center gap-1">
                        {getVerificationIcon()}
                        <span className="text-xs text-gray-500">
                          {item.metadata?.verification_status || 'pending'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 ml-2">
                {showVerification && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVerify(item.id)}
                    title="Verificar"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(item)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item.id)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (draggable) {
    return (
      <Draggable draggableId={item.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <ContactInfoContent />
          </div>
        )}
      </Draggable>
    );
  }

  return <ContactInfoContent />;
};