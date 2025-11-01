'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

interface ComplaintForm {
  // Datos del cliente
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  direccion: string;

  // Datos del reclamo
  tipoReclamo: 'queja' | 'reclamo';
  montoReclamado: string;
  descripcionBien: string;
  detalleReclamo: string;
  pedidoCliente: string;

  // Datos adicionales
  fechaIncidente: string;
  numeroOrden: string;
}

export default function LibroReclamaciones() {
  const [formData, setFormData] = useState<ComplaintForm>({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
    direccion: '',
    tipoReclamo: 'reclamo',
    montoReclamado: '',
    descripcionBien: '',
    detalleReclamo: '',
    pedidoCliente: '',
    fechaIncidente: '',
    numeroOrden: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof ComplaintForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would send the data to your API
      console.log('Complaint submitted:', formData);

      setSubmitStatus('success');

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          nombres: '',
          apellidos: '',
          tipoDocumento: '',
          numeroDocumento: '',
          telefono: '',
          email: '',
          direccion: '',
          tipoReclamo: 'reclamo',
          montoReclamado: '',
          descripcionBien: '',
          detalleReclamo: '',
          pedidoCliente: '',
          fechaIncidente: '',
          numeroOrden: ''
        });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-primary/95 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-20 w-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Libro de Reclamaciones
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor,
            ponemos a su disposición nuestro libro de reclamaciones.
          </p>
        </div>
      </section>

      <main className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 py-12">
        <div className="container mx-auto px-4">

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Diferencia entre Queja y Reclamo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Queja:</h4>
                <p className="text-sm text-gray-600">
                  Disconformidad no relacionada con los productos o servicios;
                  o malestar o descontento respecto a la atención al público.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reclamo:</h4>
                <p className="text-sm text-gray-600">
                  Disconformidad relacionada con los productos o servicios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Proceso de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Recibirá una copia de su reclamo</li>
                <li>• Respuesta en un plazo máximo de 30 días calendario</li>
                <li>• Puede presentar su reclamo en INDECOPI si no está conforme</li>
                <li>• Todos los campos marcados con (*) son obligatorios</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Reclamación</CardTitle>
            <CardDescription>
              Complete todos los campos requeridos para procesar su solicitud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Datos del Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. Identificación del Consumidor Reclamante
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => handleInputChange('nombres', e.target.value)}
                      required
                      placeholder="Ingrese sus nombres"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange('apellidos', e.target.value)}
                      required
                      placeholder="Ingrese sus apellidos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                    <Select value={formData.tipoDocumento} onValueChange={(value) => handleInputChange('tipoDocumento', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="ce">Carnet de Extranjería</SelectItem>
                        <SelectItem value="pasaporte">Pasaporte</SelectItem>
                        <SelectItem value="ruc">RUC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                    <Input
                      id="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                      required
                      placeholder="Número de documento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      required
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      required
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Reclamo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Identificación del Bien Contratado
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Solicitud *</Label>
                    <RadioGroup
                      value={formData.tipoReclamo}
                      onValueChange={(value: 'queja' | 'reclamo') => handleInputChange('tipoReclamo', value)}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reclamo" id="reclamo" />
                        <Label htmlFor="reclamo">Reclamo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="queja" id="queja" />
                        <Label htmlFor="queja">Queja</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="montoReclamado">Monto Reclamado (S/)</Label>
                      <Input
                        id="montoReclamado"
                        type="number"
                        step="0.01"
                        value={formData.montoReclamado}
                        onChange={(e) => handleInputChange('montoReclamado', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaIncidente">Fecha del Incidente</Label>
                      <Input
                        id="fechaIncidente"
                        type="date"
                        value={formData.fechaIncidente}
                        onChange={(e) => handleInputChange('fechaIncidente', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="numeroOrden">Número de Orden/Contrato</Label>
                    <Input
                      id="numeroOrden"
                      value={formData.numeroOrden}
                      onChange={(e) => handleInputChange('numeroOrden', e.target.value)}
                      placeholder="Número de referencia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcionBien">Descripción del Producto o Servicio *</Label>
                    <Textarea
                      id="descripcionBien"
                      value={formData.descripcionBien}
                      onChange={(e) => handleInputChange('descripcionBien', e.target.value)}
                      required
                      placeholder="Describa el producto o servicio objeto del reclamo"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Detalle del Reclamo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. Detalle de la Reclamación y Pedido del Consumidor
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="detalleReclamo">Detalle del Reclamo/Queja *</Label>
                    <Textarea
                      id="detalleReclamo"
                      value={formData.detalleReclamo}
                      onChange={(e) => handleInputChange('detalleReclamo', e.target.value)}
                      required
                      placeholder="Describa detalladamente su reclamo o queja"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pedidoCliente">Pedido del Cliente *</Label>
                    <Textarea
                      id="pedidoCliente"
                      value={formData.pedidoCliente}
                      onChange={(e) => handleInputChange('pedidoCliente', e.target.value)}
                      required
                      placeholder="Indique qué solución espera de parte de la empresa"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Reclamación'}
                </Button>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">¡Reclamación enviada exitosamente!</span>
                  </div>
                  <p className="mt-1 text-sm">
                    Su reclamo ha sido registrado. Recibirá una copia en su correo electrónico
                    y una respuesta en un plazo máximo de 30 días calendario.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Error al enviar la reclamación</span>
                  </div>
                  <p className="mt-1 text-sm">
                    Hubo un problema al procesar su solicitud. Por favor, inténtelo nuevamente.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Métrica FM SAC</h4>
                <p className="text-sm text-gray-600 mb-1">RUC: 20123456789</p>
                <p className="text-sm text-gray-600 mb-1">Dirección: Lima, Perú</p>
                <p className="text-sm text-gray-600 mb-1">Teléfono: +51 989 742 678</p>
                <p className="text-sm text-gray-600">Email: info@metricadip.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">INDECOPI</h4>
                <p className="text-sm text-gray-600 mb-1">Para consultas adicionales:</p>
                <p className="text-sm text-gray-600 mb-1">Teléfono: 224-7777</p>
                <p className="text-sm text-gray-600">Web: www.indecopi.gob.pe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        </div>
      </main>
      <Footer />
    </>
  );
}