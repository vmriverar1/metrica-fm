'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'section';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: Date.now().toString(36)
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.level || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };
    
    // Send to your error monitoring service
    console.warn('Error logged:', errorData);
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    } else {
      // Max retries reached, redirect to home or show persistent error
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Component level error - minimal UI
      if (this.props.level === 'component' || this.props.level === 'section') {
        return (
          <div className="w-full p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Error en {this.props.level === 'component' ? 'componente' : 'sección'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            <Button
              onClick={this.handleRetry}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar ({this.maxRetries - this.retryCount})
            </Button>
          </div>
        );
      }

      // Page level error - full screen UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">¡Ups! Algo salió mal</CardTitle>
              <CardDescription className="text-base">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar ({this.maxRetries - this.retryCount})
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  Recargar página
                </Button>
              </div>
              <Button onClick={this.handleGoHome} variant="ghost" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>

              {this.props.showDetails && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Detalles técnicos
                  </summary>
                  <div className="text-xs font-mono text-muted-foreground">
                    <p className="mb-2">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </p>
                    <p className="mb-2">
                      <strong>Mensaje:</strong> {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper components
export function PageErrorBoundary({ children, showDetails = false }: { 
  children: ReactNode; 
  showDetails?: boolean; 
}) {
  return (
    <ErrorBoundary level="page" showDetails={showDetails}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, fallback }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <ErrorBoundary level="component" fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="section">
      {children}
    </ErrorBoundary>
  );
}