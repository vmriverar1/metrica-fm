'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Shield,
  Award,
  BookOpen,
  Clipboard,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  Star,
  ArrowRight,
  ExternalLink,
  Share2,
  Printer,
  RefreshCw,
  AlertTriangle,
  Info,
  Plus,
  FolderOpen,
  File,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Document types and categories
const documentCategories = {
  'certificates': {
    label: 'Certificados',
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Certificados oficiales y acreditaciones'
  },
  'policies': {
    label: 'Políticas',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Políticas de calidad y procedimientos'
  },
  'manuals': {
    label: 'Manuales',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Manuales de procesos y procedimientos'
  },
  'procedures': {
    label: 'Procedimientos',
    icon: Clipboard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Procedimientos operativos estándar'
  },
  'audits': {
    label: 'Auditorías',
    icon: BarChart3,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    description: 'Reportes de auditorías y seguimientos'
  },
  'training': {
    label: 'Capacitación',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Material de entrenamiento y desarrollo'
  }
};

// Mock document data
const documents = [
  {
    id: 'cert-iso-2024',
    title: 'Certificado ISO 9001:2015',
    category: 'certificates',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: new Date(2024, 0, 15),
    version: '3.0',
    access: 'public',
    downloads: 1248,
    description: 'Certificado oficial ISO 9001:2015 emitido por organismo acreditado',
    tags: ['ISO 9001', 'Certificación', 'Calidad', 'Oficial'],
    author: 'Organismo Certificador',
    validUntil: new Date(2027, 0, 14)
  },
  {
    id: 'politica-calidad-v3',
    title: 'Política de Calidad',
    category: 'policies',
    type: 'pdf',
    size: '1.8 MB',
    lastModified: new Date(2024, 0, 10),
    version: '3.2',
    access: 'public',
    downloads: 892,
    description: 'Política integral de calidad y compromisos organizacionales',
    tags: ['Política', 'Calidad', 'Compromiso', 'Estrategia'],
    author: 'Dirección General',
    validUntil: new Date(2025, 0, 31)
  },
  {
    id: 'manual-gestion-calidad',
    title: 'Manual de Gestión de Calidad',
    category: 'manuals',
    type: 'pdf',
    size: '12.5 MB',
    lastModified: new Date(2023, 11, 20),
    version: '2.1',
    access: 'restricted',
    downloads: 445,
    description: 'Manual completo del sistema de gestión de calidad ISO 9001',
    tags: ['Manual', 'SGC', 'Procesos', 'ISO 9001'],
    author: 'Equipo de Calidad',
    validUntil: new Date(2024, 11, 20)
  },
  {
    id: 'proc-control-documentos',
    title: 'Procedimiento Control de Documentos',
    category: 'procedures',
    type: 'pdf',
    size: '3.2 MB',
    lastModified: new Date(2024, 1, 5),
    version: '1.5',
    access: 'internal',
    downloads: 234,
    description: 'Procedimiento para control y gestión de documentos del SGC',
    tags: ['Procedimiento', 'Control', 'Documentos', 'SGC'],
    author: 'Coord. Calidad',
    validUntil: new Date(2025, 1, 5)
  },
  {
    id: 'reporte-auditoria-2024',
    title: 'Reporte Auditoría Externa 2024',
    category: 'audits',
    type: 'pdf',
    size: '8.9 MB',
    lastModified: new Date(2024, 2, 15),
    version: '1.0',
    access: 'restricted',
    downloads: 156,
    description: 'Reporte completo de auditoría externa de seguimiento',
    tags: ['Auditoría', 'Externa', 'Seguimiento', '2024'],
    author: 'Auditor Externo',
    validUntil: new Date(2025, 2, 15)
  },
  {
    id: 'material-capacitacion-iso',
    title: 'Material Capacitación ISO 9001',
    category: 'training',
    type: 'pptx',
    size: '15.3 MB',
    lastModified: new Date(2024, 1, 20),
    version: '2.0',
    access: 'internal',
    downloads: 678,
    description: 'Presentación para capacitación en principios ISO 9001',
    tags: ['Capacitación', 'ISO 9001', 'Entrenamiento', 'Equipo'],
    author: 'RRHH - Capacitación',
    validUntil: new Date(2024, 11, 31)
  },
  {
    id: 'acreditacion-organismo',
    title: 'Acreditación del Organismo Certificador',
    category: 'certificates',
    type: 'pdf',
    size: '4.1 MB',
    lastModified: new Date(2023, 8, 10),
    version: '1.0',
    access: 'public',
    downloads: 324,
    description: 'Certificado de acreditación del organismo que nos certificó',
    tags: ['Acreditación', 'Organismo', 'Certificador', 'Válido'],
    author: 'Entidad Acreditadora',
    validUntil: new Date(2026, 8, 10)
  },
  {
    id: 'matriz-objetivos-calidad',
    title: 'Matriz de Objetivos de Calidad',
    category: 'manuals',
    type: 'xlsx',
    size: '890 KB',
    lastModified: new Date(2024, 0, 31),
    version: '4.1',
    access: 'internal',
    downloads: 445,
    description: 'Matriz con objetivos, metas e indicadores de calidad 2024',
    tags: ['Objetivos', 'KPIs', 'Metas', 'Indicadores'],
    author: 'Comité de Calidad',
    validUntil: new Date(2024, 11, 31)
  }
];

export default function DocumentCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'downloads'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  // Filter documents based on category and search term
  const filteredDocuments = documents
    .filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'date':
        default:
          return b.lastModified.getTime() - a.lastModified.getTime();
      }
    });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'xlsx': case 'xls': return BarChart3;
      case 'pptx': case 'ppt': return Eye;
      case 'docx': case 'doc': return File;
      case 'jpg': case 'png': case 'jpeg': return ImageIcon;
      default: return FileText;
    }
  };

  const getAccessIcon = (access: string) => {
    switch (access) {
      case 'public': return Unlock;
      case 'restricted': return Lock;
      case 'internal': return Shield;
      default: return Lock;
    }
  };

  const getAccessLabel = (access: string) => {
    switch (access) {
      case 'public': return 'Público';
      case 'restricted': return 'Restringido';
      case 'internal': return 'Interno';
      default: return 'Privado';
    }
  };

  const handleDownload = (documentId: string) => {
    // Simulate download
    console.log(`Downloading document: ${documentId}`);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Centro de Documentación
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Documentos <span className="text-primary">ISO 9001</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Accede a nuestra biblioteca completa de documentos certificados, políticas de calidad, 
            manuales de procedimientos y reportes de auditorías del sistema de gestión.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Documentos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {documents.filter(d => d.access === 'public').length}
              </div>
              <div className="text-sm text-muted-foreground">Públicos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {documents.reduce((sum, d) => sum + d.downloads, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Descargas</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Actualizados</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="all">Todas las Categorías</option>
                    {Object.entries(documentCategories).map(([key, category]) => (
                      <option key={key} value={key}>{category.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="date">Más Recientes</option>
                    <option value="name">Nombre A-Z</option>
                    <option value="downloads">Más Descargados</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                    </div>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <div className="space-y-1 w-4 h-4">
                      <div className="bg-current h-0.5 rounded" />
                      <div className="bg-current h-0.5 rounded" />
                      <div className="bg-current h-0.5 rounded" />
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Todos ({documents.length})
            </Button>
            {Object.entries(documentCategories).map(([key, category]) => {
              const count = documents.filter(d => d.category === key).length;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="w-4 h-4" />
                  {category.label} ({count})
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Documents Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {filteredDocuments.map((doc, index) => {
                const FileIcon = getFileIcon(doc.type);
                const AccessIcon = getAccessIcon(doc.access);
                const category = documentCategories[doc.category as keyof typeof documentCategories];
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", category.bgColor)}>
                            <FileIcon className={cn("w-6 h-6", category.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight mb-1">
                              {doc.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn("text-xs", category.bgColor, category.color)}>
                                {category.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                v{doc.version}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {doc.description}
                        </p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{doc.lastModified.toLocaleDateString('es-PE')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{doc.downloads}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <AccessIcon className="w-3 h-3" />
                              <span>{getAccessLabel(doc.access)}</span>
                            </div>
                            <span className="text-muted-foreground">{doc.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownload(doc.id)}
                            disabled={doc.access === 'restricted'}
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Descargar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDocument(doc.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 mb-12"
            >
              {filteredDocuments.map((doc, index) => {
                const FileIcon = getFileIcon(doc.type);
                const AccessIcon = getAccessIcon(doc.access);
                const category = documentCategories[doc.category as keyof typeof documentCategories];
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", category.bgColor)}>
                            <FileIcon className={cn("w-6 h-6", category.color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{doc.title}</h3>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge className={cn("text-xs", category.bgColor, category.color)}>
                                  {category.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  v{doc.version}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-3">{doc.description}</p>
                            
                            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{doc.lastModified.toLocaleDateString('es-PE')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{doc.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                <span>{doc.downloads} descargas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AccessIcon className="w-3 h-3" />
                                <span>{getAccessLabel(doc.access)}</span>
                              </div>
                              <span>{doc.size}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button 
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                              disabled={doc.access === 'restricted'}
                            >
                              <Download className="w-3 h-3 mr-2" />
                              Descargar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron documentos</h3>
            <p className="text-muted-foreground mb-6">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </motion.div>
        )}

        {/* Access Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-blue-900">
                    Información de Acceso a Documentos
                  </h4>
                  <div className="space-y-2 text-blue-700">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4" />
                      <span><strong>Públicos:</strong> Acceso libre para descarga</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span><strong>Internos:</strong> Acceso para personal autorizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span><strong>Restringidos:</strong> Acceso mediante solicitud formal</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold mb-4">
                ¿Necesitas acceso a documentos restringidos?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  <Shield className="w-4 h-4 mr-2" />
                  Solicitar Acceso
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Política de Documentos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}