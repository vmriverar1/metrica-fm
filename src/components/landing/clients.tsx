'use client';

import Image from 'next/image';

const logos = [
  { name: 'Cliente 1', src: 'https://placehold.co/150x60/003F6F/FFFFFF?text=CLIENTE+1' },
  { name: 'Cliente 2', src: 'https://placehold.co/150x60/E84E0F/FFFFFF?text=CLIENTE+2' },
  { name: 'Cliente 3', src: 'https://placehold.co/150x60/003F6F/FFFFFF?text=CLIENTE+3' },
  { name: 'Cliente 4', src: 'https://placehold.co/150x60/E84E0F/FFFFFF?text=CLIENTE+4' },
  { name: 'Cliente 5', src: 'https://placehold.co/150x60/003F6F/FFFFFF?text=CLIENTE+5' },
  { name: 'Cliente 6', src: 'https://placehold.co/150x60/E84E0F/FFFFFF?text=CLIENTE+6' },
  { name: 'Cliente 7', src: 'https://placehold.co/150x60/003F6F/FFFFFF?text=CLIENTE+7' },
  { name: 'Cliente 8', src: 'https://placehold.co/150x60/E84E0F/FFFFFF?text=CLIENTE+8' },
  { name: 'Cliente 9', src: 'https://placehold.co/150x60/003F6F/FFFFFF?text=CLIENTE+9' },
  { name: 'Cliente 10', src: 'https://placehold.co/150x60/E84E0F/FFFFFF?text=CLIENTE+10' },
];

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
          <div className="flex animate-marquee gap-12" style={{ width: 'calc(200px * 20)' }}>
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={`first-${index}`} className="flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={150}
                  height={60}
                  className="object-contain opacity-60 hover:opacity-100 transition-all duration-300"
                  data-ai-hint="logo"
                />
              </div>
            ))}
            {/* Second set of logos for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`second-${index}`} className="flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={150}
                  height={60}
                  className="object-contain opacity-60 hover:opacity-100 transition-all duration-300"
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
