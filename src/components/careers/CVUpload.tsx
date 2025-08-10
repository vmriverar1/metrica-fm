'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Trash2,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  FileCheck,
  FileWarning
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  validation?: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

interface CVUploadProps {
  jobId?: string;
  required?: boolean;
  acceptedFormats?: string[];
  maxSize?: number; // in MB
  onFilesUploaded?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  className?: string;
}

const DEFAULT_ACCEPTED_FORMATS = ['.pdf', '.doc', '.docx', '.txt'];
const DEFAULT_MAX_SIZE = 5; // 5MB

export default function CVUpload({
  jobId,
  required = true,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  maxSize = DEFAULT_MAX_SIZE,
  onFilesUploaded,
  existingFiles = [],
  className
}: CVUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upload');
  
  // Quick profile form state
  const [quickProfile, setQuickProfile] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    summary: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { isValid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      errors.push(`El archivo excede el tamaño máximo de ${maxSize}MB`);
    }
    
    // Check file format
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      errors.push(`Formato no soportado. Use: ${acceptedFormats.join(', ')}`);
    }
    
    // Check file name
    if (file.name.includes(' ')) {
      warnings.push('El nombre del archivo contiene espacios');
    }
    
    if (file.name.length > 50) {
      warnings.push('El nombre del archivo es muy largo');
    }
    
    // PDF recommendations
    if (fileExtension === '.pdf' && file.size < 100 * 1024) {
      warnings.push('El PDF parece ser muy pequeño, verifique que contenga todo su CV');
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  };

  const simulateUpload = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0,
        validation: validateFile(file)
      };

      // Simulate progressive upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          uploadedFile.status = uploadedFile.validation!.isValid ? 'success' : 'error';
          uploadedFile.url = uploadedFile.validation!.isValid ? URL.createObjectURL(file) : undefined;
        }
        uploadedFile.progress = Math.min(progress, 100);
        
        setFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...uploadedFile } : f));
      }, 200);

      resolve(uploadedFile);
    });
  };

  const handleFileUpload = useCallback(async (uploadFiles: File[]) => {
    setIsUploading(true);
    
    const newUploads: UploadedFile[] = [];
    
    for (const file of uploadFiles) {
      const uploadedFile = await simulateUpload(file);
      newUploads.push(uploadedFile);
      setFiles(prev => [...prev, uploadedFile]);
    }
    
    setIsUploading(false);
    onFilesUploaded?.(newUploads);
  }, [onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFileUpload(selectedFiles);
    }
  }, [handleFileUpload]);

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = (file: UploadedFile) => {
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateQuickCV = () => {
    if (!quickProfile.name || !quickProfile.email) {
      alert('Por favor complete al menos el nombre y email');
      return;
    }

    // Generate a simple CV content
    const cvContent = `
CURRÍCULUM VITAE

${quickProfile.name}
Email: ${quickProfile.email}
${quickProfile.phone ? `Teléfono: ${quickProfile.phone}` : ''}

${quickProfile.summary ? `RESUMEN PROFESIONAL\n${quickProfile.summary}\n` : ''}

${quickProfile.experience ? `EXPERIENCIA LABORAL\n${quickProfile.experience}\n` : ''}

${quickProfile.skills ? `HABILIDADES\n${quickProfile.skills}` : ''}

Generado con Métrica DIP Career Portal
Fecha: ${new Date().toLocaleDateString('es-PE')}
    `.trim();

    // Create a blob and simulate file upload
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const file = new File([blob], `CV_${quickProfile.name.replace(/\s+/g, '_')}.txt`, {
      type: 'text/plain'
    });

    handleFileUpload([file]);
    
    // Reset form
    setQuickProfile({
      name: '',
      email: '',
      phone: '',
      experience: '',
      skills: '',
      summary: ''
    });
    
    setSelectedTab('upload');
  };

  const hasValidFiles = files.some(f => f.status === 'success' && f.validation?.isValid);
  const hasErrors = files.some(f => f.status === 'error' || f.validation?.errors.length);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Documentos de Aplicación
            {required && <span className="text-destructive ml-1">*</span>}
          </h3>
          <p className="text-sm text-muted-foreground">
            Sube tu CV y otros documentos relevantes
          </p>
        </div>
        
        {hasValidFiles && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <FileCheck className="w-3 h-3 mr-1" />
            {files.filter(f => f.status === 'success').length} archivo(s) listo(s)
          </Badge>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
          <TabsTrigger value="quick">CV Rápido</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Area */}
          <Card
            className={cn(
              "relative border-2 border-dashed transition-all duration-300",
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Procesando archivos...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Arrastra tus archivos aquí
                        </p>
                        <p className="text-sm text-muted-foreground">
                          o haz clic para seleccionar
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Seleccionar Archivos
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Formatos soportados: {acceptedFormats.join(', ')}</p>
                      <p>Tamaño máximo: {maxSize}MB por archivo</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
            />
          </Card>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Archivos Cargados</h4>
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className={cn(
                      "transition-all duration-200",
                      file.status === 'success' && file.validation?.isValid && "border-green-200 bg-green-50/50",
                      file.status === 'error' && "border-red-200 bg-red-50/50",
                      file.validation?.warnings.length && "border-yellow-200 bg-yellow-50/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.name)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-1">
                                {file.status === 'success' && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                {file.status === 'error' && (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                {file.status === 'uploading' && (
                                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{file.uploadedAt.toLocaleTimeString('es-PE')}</span>
                            </div>

                            {/* Progress Bar */}
                            {file.status === 'uploading' && (
                              <Progress value={file.progress} className="mb-2" />
                            )}

                            {/* Validation Messages */}
                            {file.validation && (
                              <div className="space-y-1">
                                {file.validation.errors.map((error, i) => (
                                  <Alert key={i} className="py-1">
                                    <XCircle className="w-3 h-3" />
                                    <AlertDescription className="text-xs">
                                      {error}
                                    </AlertDescription>
                                  </Alert>
                                ))}
                                
                                {file.validation.warnings.map((warning, i) => (
                                  <Alert key={i} className="py-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <AlertDescription className="text-xs">
                                      {warning}
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {file.status === 'success' && file.url && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => downloadFile(file)}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(file.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Generador de CV Rápido
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Crea un CV básico en minutos si no tienes uno preparado
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nombre Completo *
                  </label>
                  <Input
                    value={quickProfile.name}
                    onChange={(e) => setQuickProfile(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    placeholder="Juan Pérez Rodríguez"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={quickProfile.email}
                    onChange={(e) => setQuickProfile(prev => ({ 
                      ...prev, 
                      email: e.target.value 
                    }))}
                    placeholder="juan.perez@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Teléfono
                  </label>
                  <Input
                    value={quickProfile.phone}
                    onChange={(e) => setQuickProfile(prev => ({ 
                      ...prev, 
                      phone: e.target.value 
                    }))}
                    placeholder="+51 999 123 456"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Años de Experiencia
                  </label>
                  <Input
                    value={quickProfile.experience}
                    onChange={(e) => setQuickProfile(prev => ({ 
                      ...prev, 
                      experience: e.target.value 
                    }))}
                    placeholder="5 años como Ingeniero Civil"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Resumen Profesional
                </label>
                <Textarea
                  value={quickProfile.summary}
                  onChange={(e) => setQuickProfile(prev => ({ 
                    ...prev, 
                    summary: e.target.value 
                  }))}
                  placeholder="Profesional con amplia experiencia en gestión de proyectos de infraestructura..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Habilidades Principales
                </label>
                <Textarea
                  value={quickProfile.skills}
                  onChange={(e) => setQuickProfile(prev => ({ 
                    ...prev, 
                    skills: e.target.value 
                  }))}
                  placeholder="AutoCAD, Project Management, Análisis Estructural, Leadership..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={generateQuickCV}
                  disabled={!quickProfile.name || !quickProfile.email}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generar CV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      {files.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {hasValidFiles ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      Documentos listos para envío
                    </span>
                  </>
                ) : (
                  <>
                    <FileWarning className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">
                      Revisa los archivos antes de continuar
                    </span>
                  </>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {files.filter(f => f.status === 'success').length} de {files.length} completados
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}