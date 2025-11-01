'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const routeTitles: Record<string, { title: string; description: string }> = {
  '/admin/subscriptions/subscribers': {
    title: 'Suscriptores',
    description: 'Administra los suscriptores del newsletter'
  },
  '/admin/subscriptions/config': {
    title: 'Configuración de Emails',
    description: 'Configura los destinatarios de notificaciones'
  }
};

export default function SubscriptionsLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const routeConfig = routeTitles[pathname] || {
    title: 'Suscripciones',
    description: 'Sistema de gestión de suscriptores'
  };

  const currentTab = pathname.includes('/config') ? 'config' : 'subscribers';

  return (
    <AdminLayout
      title={routeConfig.title}
      description={routeConfig.description}
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Tabs value={currentTab} className="w-full">
          <TabsList>
            <TabsTrigger
              value="subscribers"
              onClick={() => router.push('/admin/subscriptions/subscribers')}
            >
              Suscriptores
            </TabsTrigger>
            <TabsTrigger
              value="config"
              onClick={() => router.push('/admin/subscriptions/config')}
            >
              Configuración
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {children}
      </div>
    </AdminLayout>
  );
}
