'use client';

import React from 'react';
import { useSectionAnimation } from '@/hooks/use-gsap-animations';
import { HomePageData } from '@/types/home';

interface StatsProps {
  data: HomePageData['stats'];
}

export default function Stats({ data }: StatsProps) {
  const sectionRef = useSectionAnimation();

  if (!data?.description_text) return null;

  return (
    <section id="stats" ref={sectionRef} className="relative -mt-[100px] z-30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="w-[90vw] md:w-[80vw] lg:w-[70vw] mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-border/10">
            <p className="text-center text-foreground/80 font-alliance-medium text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
              {data.description_text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
