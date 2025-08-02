'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortfolioCTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main headline */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              ¿Tienes un{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                proyecto en mente?
              </span>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Conversemos sobre cómo podemos ayudarte a transformar tu visión en realidad. 
            Con más de 15 años de experiencia, estamos listos para hacer tu próximo proyecto extraordinario.
          </motion.p>

          {/* Contact options */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {/* WhatsApp/Call */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conversación inmediata sobre tu proyecto
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-green-50 hover:border-green-200"
                asChild
              >
                <a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer">
                  Chatear ahora
                </a>
              </Button>
            </motion.div>

            {/* Phone */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Llamada Directa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Agenda una consulta telefónica gratuita
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-blue-50 hover:border-blue-200"
                asChild
              >
                <a href="tel:+51999999999">
                  Llamar ahora
                </a>
              </Button>
            </motion.div>

            {/* Email */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Envíanos los detalles de tu proyecto
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-orange-50 hover:border-orange-200"
                asChild
              >
                <a href="mailto:info@metrica-dip.com">
                  Escribir email
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Main CTA Button */}
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium"
              asChild
            >
              <a href="/contact">
                <span className="mr-3">Iniciar mi Proyecto</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-border/30"
          >
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15+</div>
                <div className="text-sm text-muted-foreground">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">200+</div>
                <div className="text-sm text-muted-foreground">Proyectos Exitosos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Clientes Satisfechos</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}