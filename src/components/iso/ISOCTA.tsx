'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  ArrowRight,
  Building2,
  Award,
  Shield,
  CheckCircle,
  Star,
  Users,
  Clock,
  Target,
  Zap,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Send,
  ChevronRight,
  Sparkles,
  Trophy,
  Heart,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const contactMethods = [
  {
    id: 'whatsapp',
    icon: MessageCircle,
    title: 'WhatsApp Business',
    subtitle: 'Respuesta inmediata',
    value: '+51 999 123 456',
    action: 'Enviar mensaje',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    href: 'https://wa.me/51999123456?text=Hola,%20estoy%20interesado%20en%20conocer%20más%20sobre%20sus%20servicios%20certificados%20ISO%209001'
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Llamada Directa',
    subtitle: 'Lun - Vie: 8:00 - 18:00',
    value: '+51 1 234 5678',
    action: 'Llamar ahora',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    href: 'tel:+5112345678'
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Correo Electrónico',
    subtitle: 'Respuesta en 24h',
    value: 'proyectos@metricadip.com',
    action: 'Enviar correo',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    href: 'mailto:proyectos@metricadip.com?subject=Consulta%20sobre%20servicios%20ISO%209001&body=Hola,%20estoy%20interesado%20en%20conocer%20más%20sobre%20sus%20servicios%20certificados%20ISO%209001.'
  }
];

const trustIndicators = [
  {
    icon: Award,
    value: '7+',
    label: 'Años Certificados',
    description: 'Manteniendo estándares ISO 9001'
  },
  {
    icon: Building2,
    value: '200+',
    label: 'Proyectos Exitosos',
    description: 'Con certificación de calidad'
  },
  {
    icon: Users,
    value: '98.5%',
    label: 'Satisfacción Cliente',
    description: 'En proyectos certificados'
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Conformidad',
    description: 'En auditorías ISO'
  }
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Calidad Garantizada',
    description: 'Procesos certificados ISO 9001:2015'
  },
  {
    icon: Clock,
    title: 'Entregas Puntuales',
    description: '94.8% de proyectos entregados a tiempo'
  },
  {
    icon: Target,
    title: 'Presupuesto Controlado',
    description: '96.1% de proyectos dentro del presupuesto'
  },
  {
    icon: Trophy,
    title: 'Resultados Excepcionales',
    description: 'Reconocimientos y certificaciones'
  }
];

const quickActions = [
  {
    id: 'quote',
    title: 'Solicitar Cotización',
    description: 'Cotización personalizada para tu proyecto',
    icon: FileText,
    color: 'bg-primary',
    textColor: 'text-primary-foreground'
  },
  {
    id: 'portfolio',
    title: 'Ver Portafolio',
    description: 'Conoce nuestros proyectos certificados',
    icon: Building2,
    color: 'bg-blue-600',
    textColor: 'text-white'
  },
  {
    id: 'certificate',
    title: 'Verificar Certificado',
    description: 'Consulta nuestra certificación ISO',
    icon: Shield,
    color: 'bg-green-600',
    textColor: 'text-white'
  }
];

export default function ISOCTA() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 opacity-10"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(var(--primary)) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Certificados ISO 9001:2015
            </Badge>
          </div>
          
          <motion.h2 
            className="text-4xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ¿Listo para un Proyecto
            <br />
            <span className="text-primary">de Calidad Certificada?</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Únete a más de 200 clientes satisfechos que han confiado en nuestra 
            certificación ISO 9001 para materializar sus proyectos más importantes.
          </motion.p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {trustIndicators.map((indicator, index) => (
            <motion.div
              key={indicator.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="text-center border-none bg-background/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <indicator.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {indicator.value}
                  </div>
                  <div className="font-semibold mb-1">{indicator.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {indicator.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-4">Contáctanos Ahora</h3>
              <p className="text-lg text-muted-foreground">
                Elige el método más conveniente para ti y recibe atención personalizada 
                de nuestro equipo certificado.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {contactMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => window.open(method.href, '_blank')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center", method.bgColor)}>
                          <method.icon className={cn("w-7 h-7", method.color)} />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{method.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2">{method.subtitle}</p>
                          <p className="font-medium text-foreground">{method.value}</p>
                        </div>
                        
                        <div className="text-right">
                          <Button className={cn("transition-all duration-300", method.color)}>
                            {method.action}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-center gap-3 p-3 bg-background/60 rounded-lg"
                >
                  <benefit.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{benefit.title}</div>
                    <div className="text-xs text-muted-foreground">{benefit.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {!submitted ? (
              <Card className="border-none bg-background/80 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Solicita tu Cotización</h3>
                    <p className="text-muted-foreground">
                      Completa el formulario y recibe una propuesta personalizada en 24 horas.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        name="name"
                        placeholder="Nombre completo *"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Correo electrónico *"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="Teléfono"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="company"
                        placeholder="Empresa"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                        required
                      >
                        <option value="">Tipo de proyecto *</option>
                        <option value="oficina">Oficinas</option>
                        <option value="retail">Retail</option>
                        <option value="industria">Industrial</option>
                        <option value="hoteleria">Hotelería</option>
                        <option value="educacion">Educación</option>
                        <option value="vivienda">Vivienda</option>
                        <option value="salud">Salud</option>
                        <option value="otro">Otro</option>
                      </select>

                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="">Presupuesto estimado</option>
                        <option value="50-100">$50K - $100K</option>
                        <option value="100-500">$100K - $500K</option>
                        <option value="500-1M">$500K - $1M</option>
                        <option value="1M+">$1M+</option>
                        <option value="consultar">A consultar</option>
                      </select>
                    </div>

                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Cronograma deseado</option>
                      <option value="inmediato">Inmediato (1-3 meses)</option>
                      <option value="corto">Corto plazo (3-6 meses)</option>
                      <option value="mediano">Mediano plazo (6-12 meses)</option>
                      <option value="largo">Largo plazo (12+ meses)</option>
                    </select>

                    <Textarea
                      name="message"
                      placeholder="Cuéntanos sobre tu proyecto..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Solicitud
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Al enviar, aceptas nuestros términos y política de privacidad. 
                      Responderemos en máximo 24 horas.
                    </p>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none bg-green-50 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-4">
                      ¡Solicitud Enviada Exitosamente!
                    </h3>
                    <p className="text-green-700 mb-6">
                      Gracias por confiar en Métrica DIP. Nuestro equipo certificado ISO 9001 
                      se pondrá en contacto contigo dentro de las próximas 24 horas.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Respuesta garantizada en 24h</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Propuesta con estándares certificados</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">O Explora Nuestras Opciones</h3>
            <p className="text-lg text-muted-foreground">
              Descubre más sobre nuestros servicios certificados y capacidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <Card className="h-full border-none hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110",
                      action.color
                    )}>
                      <action.icon className={cn("w-8 h-8", action.textColor)} />
                    </div>
                    <h4 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-muted-foreground mb-6">
                      {action.description}
                    </p>
                    <Button variant="outline" className="group-hover:border-primary group-hover:text-primary">
                      Explorar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-none text-primary-foreground inline-block">
            <CardContent className="p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Heart className="w-8 h-8" />
                <h4 className="text-3xl font-bold">Construyamos Juntos el Futuro</h4>
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                Con 7 años de certificación ISO 9001, somos tu aliado ideal para 
                proyectos que requieren los más altos estándares de calidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg font-semibold"
                  onClick={() => window.open('https://wa.me/51999123456', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Comenzar Proyecto Ahora
                  <Sparkles className="w-5 h-5 ml-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg"
                >
                  <Globe className="w-5 h-5 mr-3" />
                  Explorar Portafolio
                  <ExternalLink className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}