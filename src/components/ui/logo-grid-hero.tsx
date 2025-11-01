'use client';

import React from 'react';

interface ClientLogo {
  id: string;
  name: string;
  alt: string;
  image: string;
}

interface LogoGridHeroProps {
  title: string;
  subtitle: string;
  logos: ClientLogo[];
}

function LogoGridHero({ title, subtitle, logos }: LogoGridHeroProps) {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

        {logos && logos.length > 0 && (
          <div className="mt-12">
            <p className="text-sm text-muted-foreground mb-6">
              Confianza de {logos.length} clientes líderes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {logos.slice(0, 12).map((logo) => (
                <div key={logo.id} className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex items-center justify-center">
                  <img
                    src={logo.image}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default LogoGridHero;