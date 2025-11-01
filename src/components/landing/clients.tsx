'use client';

import Image from 'next/image';
import { HomePageData } from '@/types/home';
import { getValidImageUrl, DEFAULT_LOGO } from '@/lib/firestore/fallbacks';

interface ClientsProps {
  data: HomePageData['clients'];
}

export default function Clients({ data }: ClientsProps) {
  if (!data || !data.logos || data.logos.length === 0) {
    return null;
  }

  return (
    <section id="clients" className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-3xl font-bold text-white">
          {data.section.title}
        </h2>
        <p className="text-white/80 mt-2 mb-8">
          {data.section.subtitle}
        </p>
        <div
          className="relative mt-8 w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            height: '140px'
          }}
        >
          <div
            className="flex items-center animate-marquee-slow gap-8 h-full"
            style={{ width: `calc(140px * ${data.logos.length * 2})` }}
          >
            {/* First set of logos */}
            {data.logos.map((logo, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 flex items-center justify-center w-[120px] h-[120px] bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="relative w-[90px] h-[90px] flex items-center justify-center">
                  <Image
                    src={getValidImageUrl(logo.image, DEFAULT_LOGO)}
                    alt={logo.alt}
                    width={90}
                    height={90}
                    className="object-contain max-w-[90px] max-h-[90px]"
                    data-ai-hint="logo"
                  />
                </div>
              </div>
            ))}
            {/* Second set of logos for seamless loop */}
            {data.logos.map((logo, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 flex items-center justify-center w-[120px] h-[120px] bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="relative w-[90px] h-[90px] flex items-center justify-center">
                  <Image
                    src={getValidImageUrl(logo.image, DEFAULT_LOGO)}
                    alt={logo.alt}
                    width={90}
                    height={90}
                    className="object-contain max-w-[90px] max-h-[90px]"
                    data-ai-hint="logo"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
