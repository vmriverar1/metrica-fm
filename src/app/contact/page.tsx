import UniversalHero from '@/components/ui/universal-hero';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Contáctanos"
          subtitle="Estamos aquí para ayudarte a transformar tus proyectos en realidad"
          backgroundImage="https://metrica-dip.com/images/slider-inicio-es/05.jpg"
        />
        
        {/* Contenido de contacto */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-6">Hablemos de Tu Proyecto</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Nuestro equipo de expertos está listo para asesorarte en cada etapa de tu proyecto de infraestructura. 
                Desde la conceptualización hasta la entrega final, estamos comprometidos con tu éxito.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Formulario de contacto */}
              <div className="bg-card rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-semibold text-primary mb-6">Envíanos un Mensaje</h3>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellido" className="block text-sm font-medium text-foreground mb-2">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                        placeholder="+51 999 999 999"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium text-foreground mb-2">
                      Empresa/Organización
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo_proyecto" className="block text-sm font-medium text-foreground mb-2">
                      Tipo de Proyecto
                    </label>
                    <select
                      id="tipo_proyecto"
                      name="tipo_proyecto"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background"
                    >
                      <option value="">Selecciona un tipo de proyecto</option>
                      <option value="salud">Proyectos de Salud</option>
                      <option value="educacion">Proyectos de Educación</option>
                      <option value="vivienda">Proyectos de Vivienda</option>
                      <option value="oficina">Proyectos de Oficina</option>
                      <option value="retail">Proyectos de Retail</option>
                      <option value="industria">Proyectos de Industria</option>
                      <option value="hoteleria">Proyectos de Hotelería</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={5}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background resize-none"
                      placeholder="Cuéntanos sobre tu proyecto, presupuesto estimado, cronograma y cualquier detalle relevante..."
                    ></textarea>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    * Campos obligatorios. Nos comprometemos a responder en menos de 24 horas.
                  </p>
                </form>
              </div>

              {/* Información de contacto */}
              <div className="space-y-8">
                <div className="bg-primary/5 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold text-primary mb-6">Información de Contacto</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Oficina Principal</h4>
                        <p className="text-muted-foreground">
                          Av. El Derby 055, Piso 9<br />
                          Santiago de Surco, Lima - Perú
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Teléfonos</h4>
                        <p className="text-muted-foreground">
                          +51 1 719-5990<br />
                          +51 999 999 999 (WhatsApp)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Email</h4>
                        <p className="text-muted-foreground">
                          info@metrica-dip.com<br />
                          proyectos@metrica-dip.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Horarios de Atención</h4>
                        <p className="text-muted-foreground">
                          Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                          Sábados: 9:00 AM - 1:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm border">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-foreground font-medium">Mapa Interactivo</p>
                      <p className="text-sm text-muted-foreground">Santiago de Surco, Lima</p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-accent/5 rounded-2xl p-6">
                  <h4 className="font-semibold text-primary mb-3">¿Necesitas una Cotización Urgente?</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Para proyectos con fechas límite ajustadas, contamos con un equipo especializado 
                    en respuesta rápida que puede brindarte una cotización preliminar en 48 horas.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar Ahora: +51 1 719-5990
                  </Button>
                </div>
              </div>
            </div>

            {/* Sección adicional */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-primary mb-4">Proceso de Contacto</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-primary mb-2">Consulta Inicial</h4>
                    <p className="text-sm text-muted-foreground">
                      Conversamos sobre tu proyecto y necesidades específicas
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-primary mb-2">Propuesta Técnica</h4>
                    <p className="text-sm text-muted-foreground">
                      Desarrollamos una propuesta detallada y personalizada
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-primary mb-2">Inicio del Proyecto</h4>
                    <p className="text-sm text-muted-foreground">
                      Comenzamos a trabajar juntos en la ejecución de tu visión
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}