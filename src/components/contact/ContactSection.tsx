'use client';

import React from 'react';
import ContactForm from './ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const iconMap = {
  Mail,
  Phone,
  MapPin,
  Clock
};

interface ContactSectionProps {
  contactInfo: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      content: string;
    }>;
  };
  map: {
    embed_url?: string;
    address?: string;
  };
}

export default function ContactSection({ contactInfo, map }: ContactSectionProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Formulario de contacto */}
      <div className="lg:order-1">
        <ContactForm />
      </div>

      {/* Información de contacto */}
      <div className="space-y-8 lg:order-2">
        <div className="bg-primary/5 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-primary mb-6">{contactInfo.title}</h3>

          <div className="space-y-6">
            {contactInfo.items.map((item, index) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap];
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border">
          <div className="h-64 relative">
            <iframe
              src={map.embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.747374654482!2d-77.05284708570265!3d-12.09724084509915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c834244b1e1b%3A0x7e8bbf4c5a4b1f2c!2sAndres%20Reyes%20388%2C%20San%20Isidro%2015036%2C%20Peru!5e0!3m2!1sen!2sus!4v1632920000000!5m2!1sen!2sus"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-2xl"
              title={`Métrica FM - ${map.address || 'Andres Reyes 388, San Isidro, Lima'}`}
            ></iframe>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{map.address || 'Andres Reyes 388, San Isidro, Lima'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
