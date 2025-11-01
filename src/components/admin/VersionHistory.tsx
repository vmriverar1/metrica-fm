'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  Eye, 
  User, 
  Clock, 
  GitBranch,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Compare,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface VersionRecord {
  id: string;
  timestamp: string;
  author: string;
  email: string;
  action: 'create' | 'update' | 'restore' | 'import';
  message: string;
  changes: {
    added: number;
    modified: number;
    deleted: number;
  };
  data: any;
  size: number;
  checksum: string;
  tags?: string[];
}

interface VersionHistoryProps {
  resource: string;
  onRollback?: (version: VersionRecord) => void;
  onCompare?: (version1: VersionRecord, version2: VersionRecord) => void;
  showDiff?: boolean;
  maxVersions?: number;
  autoSave?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  resource,
  onRollback,
  onCompare,
  showDiff = true,
  maxVersions = 50,
  autoSave = true,
  isOpen = true,
  onClose
}) => {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'author' | 'changes'>('timestamp');

  // Mock version data - in real implementation, this would come from an API
  useEffect(() => {
    const mockVersions: VersionRecord[] = [
      {
        id: 'v1.2.5',
        timestamp: '2024-01-20T14:30:00Z',
        author: 'Juan Pérez',
        email: 'juan.perez@metrica-dip.com',
        action: 'update',
        message: 'Actualización de estadísticas Q1 2024 y nuevos proyectos destacados',
        changes: { added: 2, modified: 8, deleted: 0 },
        data: { /* actual data */ },
        size: 45678,
        checksum: 'sha256:a1b2c3d4...',
        tags: ['production', 'quarterly-update']
      },
      {
        id: 'v1.2.4',
        timestamp: '2024-01-19T09:15:00Z',
        author: 'María González',
        email: 'maria.gonzalez@metrica-dip.com',
        action: 'update',
        message: 'Corrección de textos en sección hero y optimización de imágenes',
        changes: { added: 0, modified: 5, deleted: 1 },
        data: { /* actual data */ },
        size: 44231,
        checksum: 'sha256:e5f6g7h8...',
        tags: ['hotfix']
      },
      {
        id: 'v1.2.3',
        timestamp: '2024-01-18T16:45:00Z',
        author: 'Juan Pérez',
        email: 'juan.perez@metrica-dip.com',
        action: 'restore',
        message: 'Restauración desde backup - reversión de cambios problemáticos',
        changes: { added: 3, modified: 12, deleted: 2 },
        data: { /* actual data */ },
        size: 43987,
        checksum: 'sha256:i9j0k1l2...',
        tags: ['rollback', 'emergency']
      },
      {
        id: 'v1.2.2',
        timestamp: '2024-01-17T11:20:00Z',
        author: 'Carlos Silva',
        email: 'carlos.silva@metrica-dip.com',
        action: 'update',
        message: 'Nuevos pilares DIP y políticas de sostenibilidad actualizadas',
        changes: { added: 4, modified: 6, deleted: 0 },
        data: { /* actual data */ },
        size: 43156,
        checksum: 'sha256:m3n4o5p6...',
        tags: ['content-update']
      }
    ];

    setTimeout(() => {
      setVersions(mockVersions);
      setLoading(false);
    }, 1000);
  }, [resource]);

  // Get unique authors for filtering
  const authors = Array.from(new Set(versions.map(v => v.author)));

  // Filter and sort versions
  const filteredVersions = versions
    .filter(version => {
      const matchesAuthor = filterAuthor === 'all' || version.author === filterAuthor;
      const matchesAction = filterAction === 'all' || version.action === filterAction;
      return matchesAuthor && matchesAction;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'author':
          return a.author.localeCompare(b.author);
        case 'changes':
          const aTotal = a.changes.added + a.changes.modified + a.changes.deleted;
          const bTotal = b.changes.added + b.changes.modified + b.changes.deleted;
          return bTotal - aTotal;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    return 'ahora mismo';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Upload className="w-4 h-4 text-green-600" />;
      case 'update': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'restore': return <RotateCcw className="w-4 h-4 text-cyan-600" />;
      case 'import': return <Download className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'restore': return 'bg-cyan-100 text-cyan-800';
      case 'import': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleVersionExpansion = (id: string) => {
    setExpandedVersions(prev =>
      prev.includes(id)
        ? prev.filter(vid => vid !== id)
        : [...prev, id]
    );
  };

  const handleVersionSelection = (id: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(id)) {
        return prev.filter(vid => vid !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      } else {
        return [prev[1], id];
      }
    });
  };

  const handleRollback = (version: VersionRecord) => {
    if (confirm(`¿Estás seguro de que deseas restaurar a la versión ${version.id}? Esta acción no se puede deshacer.`)) {
      onRollback?.(version);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      const version1 = versions.find(v => v.id === selectedVersions[0]);
      const version2 = versions.find(v => v.id === selectedVersions[1]);
      if (version1 && version2) {
        onCompare?.(version1, version2);
      }
    }
  };

  const getTotalChanges = (changes: VersionRecord['changes']) => {
    return changes.added + changes.modified + changes.deleted;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Control de Versiones
                <Badge variant="outline">{filteredVersions.length} versiones</Badge>
              </CardTitle>
              <CardDescription>
                Historial completo de cambios para {resource}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedVersions.length === 2 && (
                <Button onClick={handleCompare} variant="outline">
                  <Compare className="w-4 h-4 mr-2" />
                  Comparar
                </Button>
              )}
              
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los autores</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="create">Crear</SelectItem>
                <SelectItem value="update">Actualizar</SelectItem>
                <SelectItem value="restore">Restaurar</SelectItem>
                <SelectItem value="import">Importar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Fecha</SelectItem>
                <SelectItem value="author">Autor</SelectItem>
                <SelectItem value="changes">Cambios</SelectItem>
              </SelectContent>
            </Select>

            {selectedVersions.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setSelectedVersions([])}
                size="sm"
              >
                Limpiar selección
              </Button>
            )}
          </div>

          {/* Version List */}
          <div className="flex-1 overflow-auto space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando historial...</p>
              </div>
            ) : filteredVersions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron versiones</p>
              </div>
            ) : (
              filteredVersions.map((version, index) => {
                const isExpanded = expandedVersions.includes(version.id);
                const isSelected = selectedVersions.includes(version.id);
                const isLatest = index === 0;
                const dateInfo = formatDate(version.timestamp);

                return (
                  <Card 
                    key={version.id} 
                    className={`transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''
                    } ${isLatest ? 'border-green-300 bg-green-50' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleVersionExpansion(version.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            {getActionIcon(version.action)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{version.id}</h4>
                                {isLatest && (
                                  <Badge className="bg-green-100 text-green-800">Actual</Badge>
                                )}
                                <Badge className={getActionColor(version.action)}>
                                  {version.action}
                                </Badge>
                                {version.tags?.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{version.message}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right text-xs text-gray-500">
                            <div>{dateInfo.date} {dateInfo.time}</div>
                            <div>{dateInfo.relative}</div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {selectedVersions.length < 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVersionSelection(version.id)}
                                className="w-8 h-8 p-0"
                              >
                                {isSelected ? <Check className="w-4 h-4 text-blue-600" /> : <Compare className="w-4 h-4" />}
                              </Button>
                            )}
                            
                            {!isLatest && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRollback(version)}
                                className="w-8 h-8 p-0 text-cyan-600"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Changes Summary */}
                      <div className="flex items-center gap-4 text-sm mt-2 ml-8">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {version.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatFileSize(version.size)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {version.changes.added > 0 && (
                            <span className="text-green-600">+{version.changes.added}</span>
                          )}
                          {version.changes.modified > 0 && (
                            <span className="text-blue-600">~{version.changes.modified}</span>
                          )}
                          {version.changes.deleted > 0 && (
                            <span className="text-red-600">-{version.changes.deleted}</span>
                          )}
                          <span className="text-gray-500">
                            ({getTotalChanges(version.changes)} cambios)
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 ml-8">
                        <div className="space-y-4">
                          {/* Detailed Changes */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Detalles del cambio:</h5>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{version.changes.added}</div>
                                  <div className="text-gray-600">Agregados</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{version.changes.modified}</div>
                                  <div className="text-gray-600">Modificados</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600">{version.changes.deleted}</div>
                                  <div className="text-gray-600">Eliminados</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Technical Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-medium text-gray-700 mb-1">Información técnica:</h6>
                              <ul className="space-y-1 text-gray-600">
                                <li>Email: {version.email}</li>
                                <li>Checksum: {version.checksum.substring(0, 20)}...</li>
                                <li>Tamaño: {formatFileSize(version.size)}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-700 mb-1">Etiquetas:</h6>
                              <div className="flex flex-wrap gap-1">
                                {version.tags?.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                )) || <span className="text-gray-500 text-xs">Sin etiquetas</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{filteredVersions.length}</div>
                <div className="text-xs text-gray-600">Versiones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{authors.length}</div>
                <div className="text-xs text-gray-600">Autores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{selectedVersions.length}</div>
                <div className="text-xs text-gray-600">Seleccionadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-600">
                  {autoSave ? 'ON' : 'OFF'}
                </div>
                <div className="text-xs text-gray-600">Auto-guardado</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionHistory;