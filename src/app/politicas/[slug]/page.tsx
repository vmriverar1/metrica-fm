import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { FileText, Download, Eye, ChevronLeft, Shield, Award, Leaf, Heart, Scale, AlertCircle, Lightbulb, Lock } from 'lucide-react';
import Link from 'next/link';
import { HomePageData } from '@/types/home';
import fs from 'fs';
import path from 'path';

// Función para cargar datos del home
async function getHomeData(): Promise<HomePageData> {
  const filePath = path.join(process.cwd(), 'public', 'json', 'pages', 'home.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Mapeo de íconos
const iconMap = {
  'Award': Award,
  'Shield': Shield,
  'Leaf': Leaf,
  'Heart': Heart,
  'Scale': Scale,
  'AlertCircle': AlertCircle,
  'Lightbulb': Lightbulb,
  'Lock': Lock,
} as const;

interface PolicyPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const homeData = await getHomeData();

  const policy = homeData.policies.policies.find((p) => {
    const policySlug = p.title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return policySlug === params.slug;
  });

  if (!policy) {
    return {
      title: 'Política no encontrada | Métrica FM',
    };
  }

  return {
    title: `${policy.title} | Métrica FM`,
    description: policy.description,
  };
}

export async function generateStaticParams() {
  const homeData = await getHomeData();
  return homeData.policies.policies.map((policy) => {
    const slug = policy.title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return { slug };
  });
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const homeData = await getHomeData();

  // Encontrar la política que coincida con el slug
  const policy = homeData.policies.policies.find((p) => {
    const policySlug = p.title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return policySlug === params.slug;
  });

  if (!policy) {
    notFound();
  }

  const Icon = iconMap[policy.icon as keyof typeof iconMap] || FileText;

  // Color por defecto
  const color = '#00A8E8';

  // Secciones por defecto si no se definen
  const defaultSections = [
    {
      title: 'Nuestro Compromiso',
      content: `En Métrica FM, nos comprometemos firmemente con nuestra ${policy.title}, estableciendo los más altos estándares en todas nuestras operaciones y proyectos.`
    },
    {
      title: 'Alcance y Aplicación',
      content: 'Esta política aplica a todos los niveles de la organización, colaboradores, contratistas y socios de negocio, asegurando su cumplimiento en cada etapa de nuestros proyectos.'
    },
    {
      title: 'Mejora Continua',
      content: 'Implementamos sistemas de gestión que nos permiten identificar oportunidades de mejora, aplicando acciones correctivas y preventivas de manera sistemática y efectiva.'
    }
  ];

  const sections = defaultSections;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section con gradiente oscuro para garantizar visibilidad del menú blanco */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Fondo con gradiente oscuro */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light opacity-95"
          style={{ backgroundColor: color }}
        />

        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/#politicas" className="hover:text-white transition-colors">
              Políticas
            </Link>
            <span>/</span>
            <span className="text-white">{policy.title}</span>
          </div>

          {/* Título y descripción */}
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-alliance-extrabold text-white">
                {policy.title}
              </h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              {policy.description}
            </p>
          </div>

          {/* Botón de regreso */}
          <Link
            href="/#politicas"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-alliance-medium rounded-full transition-all hover:bg-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a Políticas
          </Link>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna de información */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-2xl font-alliance-extrabold text-foreground mb-6">
                  Información del Documento
                </h2>

                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={index} className="bg-accent rounded-xl p-6">
                      <h3 className="font-alliance-medium text-lg text-foreground mb-3">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="mt-8 space-y-3">
                  <a
                    href={policy.pdf || '/pdf/documento-no-disponible.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-alliance-medium rounded-full transition-all hover:bg-primary-dark"
                  >
                    <Eye className="w-5 h-5" />
                    Ver en Nueva Pestaña
                  </a>
                  <a
                    href={policy.pdf || '/pdf/documento-no-disponible.pdf'}
                    download
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-foreground font-alliance-medium rounded-full transition-all hover:bg-accent-dark"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PDF
                  </a>
                </div>
              </div>
            </div>

            {/* Visualizador de PDF */}
            <div className="lg:col-span-2">
              <div className="bg-accent rounded-2xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-alliance-extrabold text-foreground">
                    Documento PDF
                  </h2>
                  <div className="flex gap-2">
                    <a
                      href={policy.pdf || '/pdf/documento-no-disponible.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                      title="Ver en pantalla completa"
                    >
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    </a>
                    <a
                      href={policy.pdf || '/pdf/documento-no-disponible.pdf'}
                      download
                      className="p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </a>
                  </div>
                </div>

                {/* Iframe para mostrar el PDF */}
                <div className="relative bg-white rounded-xl overflow-hidden" style={{ height: '80vh' }}>
                  <iframe
                    src={`${policy.pdf || '/pdf/documento-no-disponible.pdf'}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full"
                    title={`PDF de ${policy.title}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Tu navegador no puede mostrar este PDF directamente.
                      </p>
                      <a
                        href={policy.pdf || '/pdf/documento-no-disponible.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-alliance-medium rounded-full hover:bg-primary-dark transition-all"
                      >
                        <Eye className="w-5 h-5" />
                        Abrir PDF
                      </a>
                    </div>
                  </iframe>
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Si el documento no se visualiza correctamente, puedes descargarlo o abrirlo en una nueva pestaña usando los botones superiores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}