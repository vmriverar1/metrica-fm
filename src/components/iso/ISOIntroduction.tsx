'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Users, 
  Zap, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Building2,
  Award,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useISOData } from '@/hooks/useISOData';
import { cn } from '@/lib/utils';

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
  const { data, loading, error } = useISOData();

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

  if (error || !data) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-red-600">Error cargando datos</p>
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
            {data.introduction.section.subtitle}
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {data.introduction.section.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {data.introduction.section.description}
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          
          {/* Left Column - Why Important */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-8 text-foreground">
              {data.introduction.importance.title}
            </h3>
            
            <div className="space-y-6">
              {data.introduction.importance.reasons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="border-l-4 border-l-primary bg-background hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {React.createElement(iconMap[item.icon as keyof typeof iconMap], { className: "w-6 h-6 text-primary" })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                          <p className="text-muted-foreground mb-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="text-sm font-medium text-primary">
                            {item.stat}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Scope & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Certification Scope */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                {data.introduction.scope.title}
              </h3>
              
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {data.introduction.scope.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <div className="text-sm text-muted-foreground">
                      <strong>Certificado por:</strong> {data.hero.certificate_details.certifying_body}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Vigencia:</strong> {new Date(data.hero.certificate_details.expiry_date).toLocaleDateString('es-PE')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-[#007bc4] to-[#D63D0A] border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        7
                      </div>
                      <div className="text-sm text-white/90">
                        Años Certificados
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        100%
                      </div>
                      <div className="text-sm text-white/90">
                        Conformidad Auditorías
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}