'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function FeaturedProjects() {
  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="px-4 bg-gradient-to-b from-background to-muted/30" style={{ paddingTop: '4rem', paddingBottom: '0px' }}>
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Excelencia
            </span>{' '}
            en Cada Proyecto
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubre nuestros proyectos más emblemáticos que definen estándares de calidad, 
            innovación y sostenibilidad en la industria de la construcción.
          </p>
        </motion.div>
      </div>
    </section>
  );
}