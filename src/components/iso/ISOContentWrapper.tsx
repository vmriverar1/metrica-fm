'use client';

import dynamic from 'next/dynamic';

const ISOContent = dynamic(() => import('@/components/iso/ISOContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Cargando certificación ISO 9001...</p>
      </div>
    </div>
  )
});

export default function ISOContentWrapper() {
  return <ISOContent />;
}