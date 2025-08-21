'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save,
  Eye,
  RotateCcw,
  Mail,
  MapPin,
  Phone,
  Clock,
  HelpCircle,
  Globe,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Importar componentes shared
import { ContactInfoManager, type ContactInfo } from '../shared/ContactInfoManager';
import { FAQManager, type FAQ } from '../shared/FAQManager';
import { SEOAdvancedEditor, type SEOData } from '../shared/SEOAdvancedEditor';

// Tipos para la página de contacto
interface ContactPageData {
  page: {
    title: string;
    description: string;
    url: string;
  };
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    background_image_fallback?: string;
  };
  sections: {
    intro: {
      title: string;
      description: string;
    };
    contact_info: {
      title: string;
      items: ContactInfo[];
    };
    contact_form: {
      title: string;
      subtitle: string;
      fields: FormField[];
      submit_action: string;
      success_message: string;
      error_message: string;
    };
    map: {
      title: string;
      subtitle: string;
      show_placeholder: boolean;
      embed_url?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    urgent_quote: {
      title: string;
      description: string;
      button: {
        text: string;
        href: string;
        style: string;
      };
    };
    faq: {
      title: string;
      subtitle: string;
      items: FAQ[];
    };
  };
  // SEO Data
  seo: SEOData;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required: boolean;
  order: number;
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
  };
  options?: string[]; // Para select, radio
}

interface ContactPageEditorProps {
  slug?: string;
  initialData?: ContactPageData;
  onSave?: (data: ContactPageData) => Promise<void>;
  onPreview?: (data: ContactPageData) => void;
  readonly?: boolean;
}

export const ContactPageEditor: React.FC<ContactPageEditorProps> = ({
  slug = 'contact',
  initialData,
  onSave,
  onPreview,
  readonly = false
}) => {
  const [data, setData] = useState<ContactPageData>(initialData || getDefaultContactData());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!initialData) {
      loadContactData();
    }
  }, [slug]);

  const loadContactData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pages/${slug}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      setErrors(['Error al cargar los datos de contacto']);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (readonly) return;
    
    setSaving(true);
    setErrors([]);

    try {
      // Validar datos antes de guardar
      const validationErrors = validateContactData(data);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setSaving(false);
        return;
      }

      if (onSave) {
        await onSave(data);
      } else {
        const response = await fetch(`/api/admin/pages/${slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setLastSaved(new Date());
          } else {
            setErrors([result.error || 'Error al guardar']);
          }
        } else {
          setErrors(['Error de conexión al guardar']);
        }
      }
    } catch (error) {
      console.error('Error saving contact data:', error);
      setErrors(['Error inesperado al guardar']);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(data);
    } else {
      // Abrir preview en nueva ventana
      const previewWindow = window.open(`/api/admin/pages/${slug}/preview`, '_blank');
      if (previewWindow) {
        previewWindow.postMessage(data, '*');
      }
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de resetear todos los cambios?')) {
      setData(initialData || getDefaultContactData());
      setErrors([]);
    }
  };

  const updateField = (path: string, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando página de contacto...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F] flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Editor de Página de Contacto
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona toda la información de contacto y formularios
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={readonly}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
          <Button onClick={handleSave} disabled={saving || readonly}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {lastSaved && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Guardado exitosamente a las {lastSaved.toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="form">Formulario</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Tab Básico */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica de la Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título de la Página</label>
                <Input
                  value={data.page.title}
                  onChange={(e) => updateField('page.title', e.target.value)}
                  placeholder="Contáctanos | Métrica DIP"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={data.page.description}
                  onChange={(e) => updateField('page.description', e.target.value)}
                  placeholder="Ponte en contacto con nuestro equipo..."
                  rows={3}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={data.page.url}
                  onChange={(e) => updateField('page.url', e.target.value)}
                  placeholder="/contact"
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Introducción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título de Introducción</label>
                <Input
                  value={data.sections.intro.title}
                  onChange={(e) => updateField('sections.intro.title', e.target.value)}
                  placeholder="Hablemos de Tu Proyecto"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción de Introducción</label>
                <Textarea
                  value={data.sections.intro.description}
                  onChange={(e) => updateField('sections.intro.description', e.target.value)}
                  placeholder="Nuestro equipo de expertos está listo..."
                  rows={3}
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Hero */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título Principal</label>
                <Input
                  value={data.hero.title}
                  onChange={(e) => updateField('hero.title', e.target.value)}
                  placeholder="Contáctanos"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo</label>
                <Textarea
                  value={data.hero.subtitle}
                  onChange={(e) => updateField('hero.subtitle', e.target.value)}
                  placeholder="Estamos aquí para ayudarte..."
                  rows={2}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Imagen de Fondo</label>
                <Input
                  value={data.hero.background_image}
                  onChange={(e) => updateField('hero.background_image', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Imagen de Fondo (Fallback)</label>
                <Input
                  value={data.hero.background_image_fallback || ''}
                  onChange={(e) => updateField('hero.background_image_fallback', e.target.value)}
                  placeholder="/img/contact/hero-fallback.jpg"
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Contacto */}
        <TabsContent value="contact" className="space-y-6">
          <ContactInfoManager
            contactInfo={data.sections.contact_info.items}
            onChange={(items) => updateField('sections.contact_info.items', items)}
            contextType="contact"
            maxItems={10}
            allowReordering={true}
            showVerification={true}
            allowExternalLinks={true}
          />

          <Card>
            <CardHeader>
              <CardTitle>Configuración del Mapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título del Mapa</label>
                <Input
                  value={data.sections.map.title}
                  onChange={(e) => updateField('sections.map.title', e.target.value)}
                  placeholder="Mapa Interactivo"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo del Mapa</label>
                <Input
                  value={data.sections.map.subtitle}
                  onChange={(e) => updateField('sections.map.subtitle', e.target.value)}
                  placeholder="Santiago de Surco, Lima"
                  disabled={readonly}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show_placeholder"
                  checked={data.sections.map.show_placeholder}
                  onChange={(e) => updateField('sections.map.show_placeholder', e.target.checked)}
                  disabled={readonly}
                />
                <label htmlFor="show_placeholder" className="text-sm">
                  Mostrar placeholder del mapa
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">URL de Embed del Mapa</label>
                <Input
                  value={data.sections.map.embed_url || ''}
                  onChange={(e) => updateField('sections.map.embed_url', e.target.value)}
                  placeholder="https://www.google.com/maps/embed/..."
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cotización Urgente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={data.sections.urgent_quote.title}
                  onChange={(e) => updateField('sections.urgent_quote.title', e.target.value)}
                  placeholder="¿Necesitas una Cotización Urgente?"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={data.sections.urgent_quote.description}
                  onChange={(e) => updateField('sections.urgent_quote.description', e.target.value)}
                  placeholder="Para proyectos con fechas límite ajustadas..."
                  rows={3}
                  disabled={readonly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Texto del Botón</label>
                  <Input
                    value={data.sections.urgent_quote.button.text}
                    onChange={(e) => updateField('sections.urgent_quote.button.text', e.target.value)}
                    placeholder="Solicitar Cotización"
                    disabled={readonly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Enlace del Botón</label>
                  <Input
                    value={data.sections.urgent_quote.button.href}
                    onChange={(e) => updateField('sections.urgent_quote.button.href', e.target.value)}
                    placeholder="#contact-form"
                    disabled={readonly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Formulario */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título del Formulario</label>
                <Input
                  value={data.sections.contact_form.title}
                  onChange={(e) => updateField('sections.contact_form.title', e.target.value)}
                  placeholder="Formulario de Contacto"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo</label>
                <Input
                  value={data.sections.contact_form.subtitle}
                  onChange={(e) => updateField('sections.contact_form.subtitle', e.target.value)}
                  placeholder="Completa el formulario y nos pondremos en contacto"
                  disabled={readonly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mensaje de Éxito</label>
                  <Input
                    value={data.sections.contact_form.success_message}
                    onChange={(e) => updateField('sections.contact_form.success_message', e.target.value)}
                    placeholder="¡Mensaje enviado exitosamente!"
                    disabled={readonly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Mensaje de Error</label>
                  <Input
                    value={data.sections.contact_form.error_message}
                    onChange={(e) => updateField('sections.contact_form.error_message', e.target.value)}
                    placeholder="Hubo un error al enviar el mensaje"
                    disabled={readonly}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Acción del Formulario</label>
                <Input
                  value={data.sections.contact_form.submit_action}
                  onChange={(e) => updateField('sections.contact_form.submit_action', e.target.value)}
                  placeholder="/api/contact/submit"
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aquí iría un FormFieldsManager más adelante */}
          <Card>
            <CardHeader>
              <CardTitle>Campos del Formulario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Los campos del formulario se configurarán en la siguiente versión
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título de FAQ</label>
                <Input
                  value={data.sections.faq.title}
                  onChange={(e) => updateField('sections.faq.title', e.target.value)}
                  placeholder="Preguntas Frecuentes"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtítulo de FAQ</label>
                <Input
                  value={data.sections.faq.subtitle}
                  onChange={(e) => updateField('sections.faq.subtitle', e.target.value)}
                  placeholder="Respuestas a las consultas más comunes"
                  disabled={readonly}
                />
              </div>
            </CardContent>
          </Card>

          <FAQManager
            faqs={data.sections.faq.items}
            onChange={(items) => updateField('sections.faq.items', items)}
            contextType="contact"
            maxFAQs={20}
            allowCategories={true}
            allowReordering={true}
            allowTags={true}
            showHelpfulCounts={true}
            allowExport={true}
            allowImport={true}
          />
        </TabsContent>

        {/* Tab SEO */}
        <TabsContent value="seo" className="space-y-6">
          <SEOAdvancedEditor
            data={data.seo}
            onChange={(seoData) => updateField('seo', seoData)}
            contextType="contact"
            siteName="Métrica DIP"
            siteUrl="https://metrica-dip.com"
            showAnalytics={true}
            showSchema={true}
            showPreview={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Función para obtener datos por defecto
function getDefaultContactData(): ContactPageData {
  return {
    page: {
      title: 'Contáctanos | Métrica DIP',
      description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos. Estamos listos para transformar tus ideas en realidad.',
      url: '/contact'
    },
    hero: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte a transformar tus proyectos en realidad',
      background_image: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg'
    },
    sections: {
      intro: {
        title: 'Hablemos de Tu Proyecto',
        description: 'Nuestro equipo de expertos está listo para asesorarte en cada etapa de tu proyecto de infraestructura. Desde la conceptualización hasta la entrega final, estamos comprometidos con tu éxito.'
      },
      contact_info: {
        title: 'Información de Contacto',
        items: []
      },
      contact_form: {
        title: 'Formulario de Contacto',
        subtitle: 'Completa el formulario y nos pondremos en contacto contigo',
        fields: [],
        submit_action: '/api/contact/submit',
        success_message: '¡Mensaje enviado exitosamente!',
        error_message: 'Hubo un error al enviar el mensaje'
      },
      map: {
        title: 'Mapa Interactivo',
        subtitle: 'Santiago de Surco, Lima',
        show_placeholder: true
      },
      urgent_quote: {
        title: '¿Necesitas una Cotización Urgente?',
        description: 'Para proyectos con fechas límite ajustadas, contamos con un equipo especializado en respuesta rápida que puede brindarte una cotización preliminar en 48 horas.',
        button: {
          text: 'Solicitar Cotización',
          href: '#contact-form',
          style: 'primary'
        }
      },
      faq: {
        title: 'Preguntas Frecuentes',
        subtitle: 'Respuestas a las consultas más comunes sobre nuestros servicios',
        items: []
      }
    },
    seo: {
      title: 'Contáctanos | Métrica DIP',
      description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos. Estamos listos para transformar tus ideas en realidad.',
      keywords: ['contacto', 'metrica dip', 'proyectos', 'construcción', 'perú'],
      og_title: 'Contáctanos | Métrica DIP',
      og_description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos.',
      og_type: 'website',
      twitter_card: 'summary',
      robots: 'index, follow'
    }
  };
}

// Función de validación
function validateContactData(data: ContactPageData): string[] {
  const errors: string[] = [];

  if (!data.page.title?.trim()) {
    errors.push('El título de la página es requerido');
  }

  if (!data.page.description?.trim()) {
    errors.push('La descripción de la página es requerida');
  }

  if (!data.hero.title?.trim()) {
    errors.push('El título del hero es requerido');
  }

  if (!data.hero.background_image?.trim()) {
    errors.push('La imagen de fondo del hero es requerida');
  }

  if (data.sections.contact_info.items.length === 0) {
    errors.push('Se requiere al menos un elemento de información de contacto');
  }

  return errors;
}