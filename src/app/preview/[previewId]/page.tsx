import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import HomePageRenderer from '@/components/preview/HomePageRenderer';
import BlogPageRenderer from '@/components/preview/BlogPageRenderer';
import PortfolioPageRenderer from '@/components/preview/PortfolioPageRenderer';
import AboutPageRenderer from '@/components/preview/AboutPageRenderer';

interface PreviewData {
  component: 'HomePage' | 'BlogPage' | 'PortfolioPage' | 'AboutPage';
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface PreviewPageProps {
  params: {
    previewId: string;
  };
}

async function getPreviewData(previewId: string): Promise<PreviewData | null> {
  try {
    const previewFile = path.join(process.cwd(), 'temp', 'previews', `${previewId}.json`);
    const content = await fs.readFile(previewFile, 'utf-8');
    const previewData: PreviewData = JSON.parse(content);

    // Verificar si el preview ha expirado
    if (previewData.expiresAt && previewData.expiresAt < Date.now()) {
      // Eliminar archivo expirado
      try {
        await fs.unlink(previewFile);
      } catch (error) {
        console.log('Error deleting expired preview:', error);
      }
      return null;
    }

    return previewData;
  } catch (error) {
    console.log('Preview not found or error reading:', error);
    return null;
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { previewId } = params;

  // Validar formato del previewId
  if (!previewId || typeof previewId !== 'string') {
    notFound();
  }

  const previewData = await getPreviewData(previewId);

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⏱️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Preview Expirado</h1>
          <p className="text-gray-600 mb-4">
            Este preview temporal ha expirado o no existe.
          </p>
          <p className="text-sm text-gray-500">
            Los previews tienen una duración de 10 minutos por motivos de seguridad.
          </p>
        </div>
      </div>
    );
  }

  // Renderizar según el componente
  const renderComponent = () => {
    switch (previewData.component) {
      case 'HomePage':
        return <HomePageRenderer data={previewData.data} isPreview={true} />;
      case 'BlogPage':
        return <BlogPageRenderer data={previewData.data} isPreview={true} />;
      case 'PortfolioPage':
        return <PortfolioPageRenderer data={previewData.data} isPreview={true} />;
      case 'AboutPage':
        return <AboutPageRenderer data={previewData.data} isPreview={true} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Componente no soportado</h1>
              <p className="text-gray-600">
                El componente "{previewData.component}" no está disponible para preview.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
        🔍 MODO PREVIEW - Los cambios no están guardados - Expira en {Math.round((previewData.expiresAt - Date.now()) / 60000)} minutos
      </div>
      
      {/* Content with top margin to account for banner */}
      <div className="pt-10">
        {renderComponent()}
      </div>
      
      {/* Preview Footer */}
      <div className="bg-gray-800 text-white py-4 text-center text-sm">
        Preview generado el {new Date(previewData.timestamp).toLocaleString()} • 
        Componente: {previewData.component} • 
        ID: {previewId.substring(0, 8)}...
      </div>
    </>
  );
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PreviewPageProps) {
  const { previewId } = params;
  const previewData = await getPreviewData(previewId);

  if (!previewData) {
    return {
      title: 'Preview Expirado - Métrica FM',
      description: 'Este preview temporal ha expirado',
    };
  }

  return {
    title: `Preview: ${previewData.component} - Métrica FM`,
    description: `Preview temporal de ${previewData.component}`,
    robots: 'noindex, nofollow', // Evitar indexación de previews
  };
}