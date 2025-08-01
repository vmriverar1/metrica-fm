'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface HitoExtendido {
  longDescription: string;
  achievements: {
    number: string;
    label: string;
  }[];
  gallery: string[];
  quote?: string;
  quoteAuthor?: string;
}

interface HitoPanelProps {
  isActive: boolean;
  hitoData: HitoExtendido;
  color: string;
}

export default function HitoPanel({ isActive, hitoData, color }: HitoPanelProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % hitoData.gallery.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + hitoData.gallery.length) % hitoData.gallery.length);
  };

  if (!isActive) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[500px] bg-background/95 backdrop-blur-lg border-l border-border transform translate-x-0 transition-transform duration-500 z-40">
      <div className="h-full overflow-y-auto p-8">
        {/* Descripción extendida */}
        <div className="mb-8">
          <h3 className="text-2xl font-alliance-extrabold mb-4" style={{ color }}>
            Más sobre este período
          </h3>
          <p className="text-base font-alliance-medium text-foreground/80 leading-relaxed">
            {hitoData.longDescription}
          </p>
        </div>

        {/* Logros con números */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {hitoData.achievements.map((achievement, idx) => (
            <div key={idx} className="bg-muted/50 rounded-lg p-4">
              <div className="text-3xl font-alliance-extrabold mb-1" style={{ color }}>
                {achievement.number}
              </div>
              <div className="text-sm font-alliance-medium text-muted-foreground">
                {achievement.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote si existe */}
        {hitoData.quote && (
          <div className="mb-8 p-6 border-l-4 bg-muted/30" style={{ borderColor: color }}>
            <p className="text-lg font-alliance-medium italic text-foreground/80 mb-2">
              "{hitoData.quote}"
            </p>
            {hitoData.quoteAuthor && (
              <p className="text-sm font-alliance-medium text-muted-foreground">
                — {hitoData.quoteAuthor}
              </p>
            )}
          </div>
        )}

        {/* Galería */}
        <div className="mb-8">
          <h4 className="text-xl font-alliance-extrabold mb-4">Galería</h4>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={hitoData.gallery[currentImage]}
              alt={`Galería imagen ${currentImage + 1}`}
              fill
              className="object-cover"
            />
            
            {/* Controles de galería */}
            {hitoData.gallery.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Indicadores */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {hitoData.gallery.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImage ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}