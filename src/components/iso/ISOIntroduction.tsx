'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Target,
  Users,
  Globe,
  Building2,
  Award,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useISO } from '@/contexts/ISOContext';

const iconMap = {
  Shield,
  Target,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Award
};

export default function ISOIntroduction() {
  const { data, loading, error } = useISO();

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando información ISO...</p>
        </div>
      </section>
    );
  }

  if (error || !data || !data.introduction) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-red-600">
            {error ? `Error: ${error}` : 'No hay datos de introducción disponibles'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            {data.introduction?.section?.subtitle || 'ISO 9001:2015'}
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {data.introduction?.section?.title || 'Certificación ISO'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {data.introduction?.section?.description || 'Sistema de gestión de calidad certificado'}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="mb-20">

          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-semibold text-foreground">
              {data.introduction?.importance?.title || 'Importancia de ISO 9001'}
            </h3>
          </motion.div>

          {/* Cards Grid - 3 Columns */}
          {data.introduction?.importance?.reasons && data.introduction.importance.reasons.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.introduction.importance.reasons.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="h-full"
                >
                  <Card className="border-t-4 border-t-primary bg-background hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          {item.icon && iconMap[item.icon as keyof typeof iconMap] &&
                            React.createElement(iconMap[item.icon as keyof typeof iconMap], { className: "w-8 h-8 text-primary" })
                          }
                        </div>
                        <h4 className="font-semibold text-xl mb-3">{item.title || 'Sin título'}</h4>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <p className="text-muted-foreground mb-4 leading-relaxed text-center">
                          {item.description || ''}
                        </p>
                        <div className="text-lg font-bold text-primary text-center mt-auto">
                          {item.stat || ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>


      </div>
    </section>
  );
}