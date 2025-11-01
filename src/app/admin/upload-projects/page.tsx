'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadResult {
  success: Array<{
    id: string;
    title: string;
    fileName: string;
  }>;
  errors: Array<{
    id?: string;
    fileName: string;
    error: string;
  }>;
  total: number;
}

const UploadProjectsPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleUpload = async () => {
    try {
      setLoading(true);
      setResult(null);

      console.log('🚀 Iniciando carga de proyectos...');

      const response = await fetch('/api/admin/portfolio/upload-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        console.log('✅ Carga completada:', data.data);
      } else {
        console.error('❌ Error en la carga:', data.error);
        alert(`Error: ${data.message}`);
      }

    } catch (error) {
      console.error('❌ Error ejecutando carga:', error);
      alert('Error ejecutando la carga de proyectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#003F6F]">Carga Masiva de Proyectos</h1>
        <p className="text-gray-600 mt-1">
          Herramienta temporal para subir todos los proyectos desde los archivos JSON a Firestore
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Proyectos a Firestore
          </CardTitle>
          <CardDescription>
            Esta acción leerá todos los archivos JSON de la carpeta viviendas/ y los subirá a la colección portfolio_projects en Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Importante:</strong> Esta operación subirá todos los proyectos a Firestore.
                Si ya existen proyectos con el mismo ID, se fusionarán (merge) los datos.
              </p>
            </div>

            <Button
              onClick={handleUpload}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo proyectos...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Iniciar Carga Masiva
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultados de la Carga
            </CardTitle>
            <CardDescription>
              Resumen de la operación de carga masiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                  <div className="text-sm text-gray-600">Total Archivos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.success.length}</div>
                  <div className="text-sm text-gray-600">Exitosos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-gray-600">Errores</div>
                </div>
              </div>

              {/* Proyectos exitosos */}
              {result.success.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Proyectos Subidos Exitosamente ({result.success.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.success.map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border">
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-gray-600">ID: {project.id}</div>
                        </div>
                        <Badge variant="outline" className="text-green-700">
                          {project.fileName}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errores */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Errores ({result.errors.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded border">
                        <div className="font-medium text-red-800">
                          {error.fileName} {error.id && `(ID: ${error.id})`}
                        </div>
                        <div className="text-sm text-red-600 mt-1">{error.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadProjectsPage;