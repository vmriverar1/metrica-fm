'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SEOAdvancedEditor,
  ContentSectionsManager
} from '@/components/admin/shared';
import {
  Save,
  Eye,
  FileText,
  Settings,
  Grid,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Globe
} from 'lucide-react';

// Interfaces específicas para Contact
export interface ContactInfo {
  title: string;
  icon: string;
  content: string;
}

export interface ContactForm {
  show_form: boolean;
  form_title: string;
  form_subtitle: string;
  success_message: string;
  error_message: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

export interface ContactHeroSection {
  title: string;
  subtitle: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  show_contact_info: boolean;
  show_form: boolean;
  show_map: boolean;
}

export interface ContactPageData {
  hero: ContactHeroSection;

  sections: {
    intro?: {
      title: string;
      description: string;
    };
    contact_info?: {
      title: string;
      items: ContactInfo[];
    };
    map?: {
      show_placeholder: boolean;
      title: string;
      subtitle: string;
      google_maps_embed?: string;
    };
    process?: {
      title: string;
      steps: Array<{
        number: string;
        title: string;
        description: string;
      }>;
    };
  };

  settings?: {
    form_method?: string;
    form_action?: string;
    response_time?: string;
    urgent_response_time?: string;
    show_map_placeholder?: boolean;
  };

  seo?: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

interface ContactPageEditorProps {
  initialData?: Partial<ContactPageData>;
  onSave?: (data: ContactPageData) => Promise<void>;
  pageId?: string;
}

export function ContactPageEditor({
  initialData,
  onSave,
  pageId = 'contact'
}: ContactPageEditorProps) {
  const [data, setData] = useState<ContactPageData>({
    hero: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte a transformar tus proyectos en realidad',
      background_image: '',
      show_contact_info: true,
      show_form: true,
      show_map: true
    },
    sections: {
      intro: {
        title: 'Hablemos de Tu Proyecto',
        description: 'Nuestro equipo de expertos está listo para asesorarte'
      },
      contact_info: {
        title: 'Información de Contacto',
        items: [
          {
            title: 'Oficina Principal',
            icon: 'MapPin',
            content: 'Andrés Reyes 388, San Isidro'
          },
          {
            title: 'Teléfonos',
            icon: 'Phone',
            content: '+51 1 719-5990\n+51 989 742 678 (WhatsApp)'
          },
          {
            title: 'Email',
            icon: 'Mail',
            content: 'info@metrica-dip.com\ninfo@metricadip.com'
          },
          {
            title: 'Horarios de Atención',
            icon: 'Clock',
            content: 'Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 1:00 PM'
          }
        ]
      },
      map: {
        show_placeholder: true,
        title: 'Ubicación',
        subtitle: 'Santiago de Surco, Lima'
      },
      process: {
        title: 'Proceso de Contacto',
        steps: [
          {
            number: '1',
            title: 'Consulta Inicial',
            description: 'Conversamos sobre tu proyecto'
          },
          {
            number: '2',
            title: 'Propuesta Técnica',
            description: 'Desarrollamos una propuesta detallada'
          },
          {
            number: '3',
            title: 'Inicio del Proyecto',
            description: 'Comenzamos a trabajar juntos'
          }
        ]
      }
    },
    settings: {
      form_method: 'POST',
      form_action: '/api/contact',
      response_time: '24 horas',
      urgent_response_time: '48 horas',
      show_map_placeholder: true
    },
    seo: {
      meta_title: 'Contacto - Métrica FM',
      meta_description: 'Contáctanos para iniciar tu proyecto',
      keywords: ['contacto', 'métrica', 'dip', 'proyectos']
    },
    ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (initialData) {
      setData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleContactInfoChange = (index: number, field: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData.sections.contact_info) {
        newData.sections.contact_info = { title: '', items: [] };
      }
      if (!newData.sections.contact_info.items[index]) {
        newData.sections.contact_info.items[index] = { title: '', icon: '', content: '' };
      }
      newData.sections.contact_info.items[index][field as keyof ContactInfo] = value;
      return newData;
    });
  };

  const addContactInfo = () => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData.sections.contact_info) {
        newData.sections.contact_info = { title: 'Información de Contacto', items: [] };
      }
      newData.sections.contact_info.items.push({
        title: 'Nuevo contacto',
        icon: 'Phone',
        content: ''
      });
      return newData;
    });
  };

  const removeContactInfo = (index: number) => {
    setData(prev => {
      const newData = { ...prev };
      if (newData.sections.contact_info?.items) {
        newData.sections.contact_info.items.splice(index, 1);
      }
      return newData;
    });
  };

  const handleProcessStepChange = (index: number, field: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData.sections.process) {
        newData.sections.process = { title: '', steps: [] };
      }
      if (!newData.sections.process.steps[index]) {
        newData.sections.process.steps[index] = { number: '', title: '', description: '' };
      }
      newData.sections.process.steps[index][field as keyof typeof newData.sections.process.steps[0]] = value;
      return newData;
    });
  };

  const addProcessStep = () => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData.sections.process) {
        newData.sections.process = { title: 'Proceso', steps: [] };
      }
      const nextNumber = (newData.sections.process.steps.length + 1).toString();
      newData.sections.process.steps.push({
        number: nextNumber,
        title: 'Nuevo paso',
        description: ''
      });
      return newData;
    });
  };

  const removeProcessStep = (index: number) => {
    setData(prev => {
      const newData = { ...prev };
      if (newData.sections.process?.steps) {
        newData.sections.process.steps.splice(index, 1);
      }
      return newData;
    });
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await onSave(data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving contact page:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewUrl = `/contact?preview=true&data=${encodeURIComponent(JSON.stringify(data))}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editor de Página de Contacto</h1>
              <p className="text-gray-600 mt-2">
                Personaliza toda la información y configuración de tu página de contacto
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={saveStatus === 'success' ? 'bg-green-600' : ''}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>

          {saveStatus === 'error' && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Error al guardar los cambios. Por favor, intenta nuevamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">
            <FileText className="w-4 h-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="w-4 h-4 mr-2" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Grid className="w-4 h-4 mr-2" />
            Secciones
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Sección Hero</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título Principal
                    </label>
                    <Input
                      value={data.hero?.title || ''}
                      onChange={(e) => handleInputChange('hero.title', e.target.value)}
                      placeholder="Contáctanos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen de Fondo
                    </label>
                    <Input
                      value={data.hero?.background_image || ''}
                      onChange={(e) => handleInputChange('hero.background_image', e.target.value)}
                      placeholder="URL de la imagen"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <Textarea
                    value={data.hero?.subtitle || ''}
                    onChange={(e) => handleInputChange('hero.subtitle', e.target.value)}
                    rows={2}
                    placeholder="Estamos aquí para ayudarte..."
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={data.hero?.show_contact_info || false}
                      onCheckedChange={(checked) => handleInputChange('hero.show_contact_info', checked)}
                    />
                    <span className="text-sm">Mostrar información de contacto</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <Switch
                      checked={data.hero?.show_form || false}
                      onCheckedChange={(checked) => handleInputChange('hero.show_form', checked)}
                    />
                    <span className="text-sm">Mostrar formulario</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <Switch
                      checked={data.hero?.show_map || false}
                      onCheckedChange={(checked) => handleInputChange('hero.show_map', checked)}
                    />
                    <span className="text-sm">Mostrar mapa</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Sección
                  </label>
                  <Input
                    value={data.sections?.contact_info?.title || ''}
                    onChange={(e) => handleInputChange('sections.contact_info.title', e.target.value)}
                    placeholder="Información de Contacto"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Items de Contacto</h3>
                  <Button onClick={addContactInfo} size="sm">
                    Agregar Contacto
                  </Button>
                </div>

                {data.sections?.contact_info?.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <Input
                            value={item.title}
                            onChange={(e) => handleContactInfoChange(index, 'title', e.target.value)}
                            placeholder="Ej: Oficina Principal"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icono
                          </label>
                          <select
                            value={item.icon}
                            onChange={(e) => handleContactInfoChange(index, 'icon', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="MapPin">Ubicación</option>
                            <option value="Phone">Teléfono</option>
                            <option value="Mail">Email</option>
                            <option value="Clock">Horario</option>
                            <option value="Globe">Web</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contenido
                          </label>
                          <Textarea
                            value={item.content}
                            onChange={(e) => handleContactInfoChange(index, 'content', e.target.value)}
                            rows={2}
                            placeholder="Información de contacto"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => removeContactInfo(index)}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <div className="space-y-6">
            {/* Intro Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sección de Introducción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <Input
                    value={data.sections?.intro?.title || ''}
                    onChange={(e) => handleInputChange('sections.intro.title', e.target.value)}
                    placeholder="Hablemos de Tu Proyecto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <Textarea
                    value={data.sections?.intro?.description || ''}
                    onChange={(e) => handleInputChange('sections.intro.description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Process Section */}
            <Card>
              <CardHeader>
                <CardTitle>Proceso de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Sección
                  </label>
                  <Input
                    value={data.sections?.process?.title || ''}
                    onChange={(e) => handleInputChange('sections.process.title', e.target.value)}
                    placeholder="Proceso de Contacto"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Pasos del Proceso</h4>
                    <Button onClick={addProcessStep} size="sm">
                      Agregar Paso
                    </Button>
                  </div>

                  {data.sections?.process?.steps?.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número
                            </label>
                            <Input
                              value={step.number}
                              onChange={(e) => handleProcessStepChange(index, 'number', e.target.value)}
                              placeholder="1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título
                            </label>
                            <Input
                              value={step.title}
                              onChange={(e) => handleProcessStepChange(index, 'title', e.target.value)}
                              placeholder="Título del paso"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <Textarea
                              value={step.description}
                              onChange={(e) => handleProcessStepChange(index, 'description', e.target.value)}
                              rows={2}
                              placeholder="Descripción del paso"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => removeProcessStep(index)}
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método del Formulario
                  </label>
                  <select
                    value={data.settings?.form_method || 'POST'}
                    onChange={(e) => handleInputChange('settings.form_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Acción
                  </label>
                  <Input
                    value={data.settings?.form_action || ''}
                    onChange={(e) => handleInputChange('settings.form_action', e.target.value)}
                    placeholder="/api/contact"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Respuesta
                  </label>
                  <Input
                    value={data.settings?.response_time || ''}
                    onChange={(e) => handleInputChange('settings.response_time', e.target.value)}
                    placeholder="24 horas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Respuesta Urgente
                  </label>
                  <Input
                    value={data.settings?.urgent_response_time || ''}
                    onChange={(e) => handleInputChange('settings.urgent_response_time', e.target.value)}
                    placeholder="48 horas"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={data.settings?.show_map_placeholder || false}
                    onCheckedChange={(checked) => handleInputChange('settings.show_map_placeholder', checked)}
                  />
                  <span className="text-sm">Mostrar placeholder del mapa</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Configuración SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Título
                </label>
                <Input
                  value={data.seo?.meta_title || ''}
                  onChange={(e) => handleInputChange('seo.meta_title', e.target.value)}
                  placeholder="Contacto - Métrica FM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Descripción
                </label>
                <Textarea
                  value={data.seo?.meta_description || ''}
                  onChange={(e) => handleInputChange('seo.meta_description', e.target.value)}
                  rows={3}
                  placeholder="Contáctanos para iniciar tu proyecto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palabras Clave (separadas por comas)
                </label>
                <Textarea
                  value={data.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => handleInputChange('seo.keywords', e.target.value.split(',').map(k => k.trim()))}
                  rows={2}
                  placeholder="contacto, métrica dip, proyectos"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}