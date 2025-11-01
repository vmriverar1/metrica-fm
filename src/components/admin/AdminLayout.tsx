'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/components/auth';
import { signOut } from '@/lib/firebase-auth';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import AdminNavigation from './AdminNavigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  User,
  Bell,
  Settings
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export default function AdminLayout({
  children,
  title,
  description,
  actions
}: AdminLayoutProps) {
  const { user } = useAuth();
  const { isLoading, message, progress } = useGlobalLoading();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Loading Overlay Global */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {message || 'Cargando...'}
                </h3>
                {progress > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Por favor espera...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar with Collapsible functionality */}
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  Admin
                </span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <AdminNavigation />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="text-sm min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="font-medium text-sidebar-foreground truncate">
                      {user?.name || 'Admin'}
                    </div>
                    <div className="text-sidebar-foreground/70 truncate">
                      {user?.role?.name || 'Administrator'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sidebar-foreground/70 hover:text-red-600 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <SidebarInset>
            {/* Top Header with Sidebar Trigger */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger className="-ml-1" />

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div>
                    {title && (
                      <h1 className="text-xl font-semibold text-foreground">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {actions}
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}