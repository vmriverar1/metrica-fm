import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import UniversalHero from '@/components/ui/universal-hero';
import { Shield, Mail, Phone, MapPin, Calendar, User, Lock, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Métrica FM',
  description: 'Conoce cómo protegemos y manejamos tu información personal en Métrica FM. Transparencia y seguridad en el tratamiento de datos.',
  keywords: 'política de privacidad, protección de datos, LOPD, información personal, seguridad datos',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <UniversalHero
          title="Política de Privacidad"
          subtitle="Tu privacidad es importante para nosotros. Conoce cómo protegemos y manejamos tu información personal."
          backgroundImage="/images/hero/privacy-bg.jpg"
        />

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Introducción */}
            <div className="bg-primary/5 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-4">Compromiso con tu Privacidad</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    En <strong>Métrica FM</strong>, nos comprometemos a proteger y respetar tu privacidad.
                    Esta política explica cómo recopilamos, utilizamos y protegemos tu información personal
                    cuando interactúas con nuestros servicios.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {/* Última actualización */}
              <div className="mb-8 text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Última actualización: Septiembre 2025</span>
              </div>

              {/* Información que recopilamos */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Información que Recopilamos</h2>
                </div>

                <div className="bg-card rounded-lg p-6 border mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Información Personal</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Datos de contacto:</strong> nombre, correo electrónico, teléfono</li>
                    <li>• <strong>Información de proyecto:</strong> detalles sobre tu consulta o proyecto</li>
                    <li>• <strong>Comunicaciones:</strong> mensajes que nos envías a través de formularios</li>
                  </ul>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-xl font-semibold text-primary mb-4">Información Técnica</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas</li>
                    <li>• <strong>Cookies:</strong> para mejorar la experiencia de usuario</li>
                    <li>• <strong>Analytics:</strong> estadísticas de uso del sitio web</li>
                  </ul>
                </div>
              </section>

              {/* Cómo utilizamos la información */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Cómo Utilizamos tu Información</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-primary mb-3">Servicios Principales</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Responder a tus consultas</li>
                      <li>• Proporcionarte cotizaciones</li>
                      <li>• Gestionar proyectos</li>
                      <li>• Enviar información relevante</li>
                    </ul>
                  </div>

                  <div className="bg-card rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-primary mb-3">Mejora del Servicio</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Optimizar nuestro sitio web</li>
                      <li>• Personalizar contenido</li>
                      <li>• Análisis de uso y tendencias</li>
                      <li>• Prevenir fraude y abusos</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Protección de datos */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Protección de tus Datos</h2>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Medidas de Seguridad</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-primary mb-2">Encriptación</h4>
                      <p className="text-sm text-muted-foreground">
                        Datos protegidos con encriptación SSL/TLS
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-primary mb-2">Acceso Limitado</h4>
                      <p className="text-sm text-muted-foreground">
                        Solo personal autorizado accede a tu información
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-primary mb-2">Auditorías</h4>
                      <p className="text-sm text-muted-foreground">
                        Revisiones regulares de seguridad
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Derechos del usuario */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Tus Derechos</h2>

                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-muted-foreground mb-4">
                    Tienes derecho a solicitar:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                      <li>• <strong>Rectificación:</strong> Corregir información incorrecta</li>
                      <li>• <strong>Eliminación:</strong> Solicitar el borrado de tus datos</li>
                    </ul>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Portabilidad:</strong> Obtener copia de tus datos</li>
                      <li>• <strong>Oposición:</strong> Objetar ciertos usos de tu información</li>
                      <li>• <strong>Limitación:</strong> Restringir el procesamiento</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Uso de Cookies</h2>

                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-muted-foreground mb-4">
                    Utilizamos cookies para mejorar tu experiencia. Puedes controlar su uso a través de
                    la configuración de tu navegador.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Esenciales</h4>
                      <p className="text-sm text-muted-foreground">
                        Necesarias para el funcionamiento del sitio
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Analíticas</h4>
                      <p className="text-sm text-muted-foreground">
                        Para entender cómo usas nuestro sitio
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Funcionales</h4>
                      <p className="text-sm text-muted-foreground">
                        Para recordar tus preferencias
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contacto */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Contacto sobre Privacidad</h2>

                <div className="bg-primary/5 rounded-lg p-6">
                  <p className="text-muted-foreground mb-4">
                    Si tienes preguntas sobre esta política o quieres ejercer tus derechos, contáctanos:
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Email</p>
                        <p className="text-sm text-muted-foreground">privacy@metrica-dip.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Teléfono</p>
                        <p className="text-sm text-muted-foreground">+51 1 234-5678</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Dirección</p>
                        <p className="text-sm text-muted-foreground">Andres Reyes 388, San Isidro</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cambios en la política */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Cambios en esta Política</h2>
                <div className="bg-card rounded-lg p-6 border">
                  <p className="text-muted-foreground">
                    Nos reservamos el derecho de actualizar esta política cuando sea necesario.
                    Te notificaremos sobre cambios significativos a través de nuestro sitio web
                    o por correo electrónico si tienes una cuenta con nosotros.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}