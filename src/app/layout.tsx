import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import LoadingProvider from '@/components/loading/LoadingProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Métrica DIP Landing',
  description: 'Dirección Integral de Proyectos que transforman la infraestructura del Perú',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LoadingProvider enableRouteLoading={true} minLoadingTime={800}>
          {children}
        </LoadingProvider>
        <Toaster />
      </body>
    </html>
  );
}
