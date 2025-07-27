'use client';

import Image from 'next/image';

const logos = [
  { name: 'Logoipsum 1', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 2', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 3', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 4', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 5', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 6', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 7', src: 'https://placehold.co/150x60.png' },
  { name: 'Logoipsum 8', src: 'https://placehold.co/150x60.png' },
];

// Duplicate logos to create a seamless loop
const extendedLogos = [...logos, ...logos];

export default function Clients() {
  return (
    <section id="clients" className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-3xl font-bold text-foreground">
          Confían en Nosotros
        </h2>
        <div
          className="relative mt-8 w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee gap-16">
            {extendedLogos.map((logo, index) => (
              <div key={index} className="flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={150}
                  height={60}
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  data-ai-hint="logo"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
