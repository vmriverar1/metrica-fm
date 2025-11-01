'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageCircle,
  Calendar,
  Phone,
  MapPin,
  Building2,
  User,
  Mail,
  Download,
  ExternalLink,
  Bell,
  BellOff,
  Archive,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

export type ApplicationStatus = 'draft' | 'submitted' | 'reviewed' | 'interview_scheduled' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  department: string;
  location: string;
  submittedAt: Date;
  status: ApplicationStatus;
  notes: string;
  notifications: boolean;
  timeline: ApplicationTimelineEvent[];
  nextStep?: {
    type: 'interview' | 'assessment' | 'document' | 'call';
    date: Date;
    description: string;
  };
  feedback?: {
    rating: number;
    comments: string;
    interviewer?: string;
  };
  documents: {
    cv: boolean;
    coverLetter: boolean;
    portfolio: boolean;
    certificates: boolean;
  };
}

interface ApplicationTimelineEvent {
  id: string;
  type: 'submitted' | 'reviewed' | 'interview' | 'feedback' | 'decision' | 'note';
  title: string;
  description: string;
  date: Date;
  important?: boolean;
}

interface ApplicationTrackerProps {
  applications?: Application[];
  onApplicationUpdate?: (application: Application) => void;
  className?: string;
}

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  progress: number;
}> = {
  draft: {
    label: 'Borrador',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <FileText className="w-4 h-4" />,
    progress: 10
  },
  submitted: {
    label: 'Enviada',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-4 h-4" />,
    progress: 25
  },
  reviewed: {
    label: 'En Revisión',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <Eye className="w-4 h-4" />,
    progress: 50
  },
  interview_scheduled: {
    label: 'Entrevista Programada',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    icon: <Calendar className="w-4 h-4" />,
    progress: 70
  },
  interviewed: {
    label: 'Entrevistado',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: <MessageCircle className="w-4 h-4" />,
    progress: 85
  },
  accepted: {
    label: 'Aceptado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-4 h-4" />,
    progress: 100
  },
  rejected: {
    label: 'Rechazado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <XCircle className="w-4 h-4" />,
    progress: 100
  },
  withdrawn: {
    label: 'Retirada',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <Archive className="w-4 h-4" />,
    progress: 100
  }
};

export default function ApplicationTracker({ 
  applications: initialApplications = [],
  onApplicationUpdate,
  className 
}: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [newNote, setNewNote] = useState('');

  // Load applications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('metrica-applications');
    if (saved && !initialApplications.length) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key.includes('Date') || key === 'date' || key === 'submittedAt') {
            return new Date(value);
          }
          return value;
        });
        setApplications(parsed);
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    }
  }, [initialApplications]);

  // Save applications to localStorage
  useEffect(() => {
    localStorage.setItem('metrica-applications', JSON.stringify(applications));
  }, [applications]);

  const updateApplication = (updatedApp: Application) => {
    const updated = applications.map(app => 
      app.id === updatedApp.id ? updatedApp : app
    );
    setApplications(updated);
    onApplicationUpdate?.(updatedApp);
  };

  const addNote = (applicationId: string) => {
    if (!newNote.trim()) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    const noteEvent: ApplicationTimelineEvent = {
      id: Date.now().toString(),
      type: 'note',
      title: 'Nota agregada',
      description: newNote.trim(),
      date: new Date()
    };

    const updatedApp = {
      ...application,
      timeline: [...application.timeline, noteEvent],
      notes: application.notes ? `${application.notes}\n\n${newNote.trim()}` : newNote.trim()
    };

    updateApplication(updatedApp);
    setNewNote('');
  };

  const toggleNotifications = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    updateApplication({
      ...application,
      notifications: !application.notifications
    });
  };

  const getApplicationsByStatus = (status: 'active' | 'completed' | 'archived') => {
    switch (status) {
      case 'active':
        return applications.filter(app => 
          !['accepted', 'rejected', 'withdrawn'].includes(app.status)
        );
      case 'completed':
        return applications.filter(app => 
          ['accepted', 'rejected'].includes(app.status)
        );
      case 'archived':
        return applications.filter(app => app.status === 'withdrawn');
      default:
        return applications;
    }
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const active = applications.filter(app => 
      !['accepted', 'rejected', 'withdrawn'].includes(app.status)
    ).length;
    const interviews = applications.filter(app => 
      ['interview_scheduled', 'interviewed'].includes(app.status)
    ).length;
    const successRate = total > 0 
      ? (applications.filter(app => app.status === 'accepted').length / total * 100)
      : 0;

    return { total, active, interviews, successRate };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  const stats = getApplicationStats();
  const filteredApplications = getApplicationsByStatus(selectedTab as any);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Seguimiento de Aplicaciones
            </h2>
            <p className="text-muted-foreground">
              Gestiona y monitorea tus postulaciones laborales
            </p>
          </div>
          
          <Button className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Nueva Aplicación
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Activas</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Entrevistas</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasa Éxito</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Applications List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Activas ({getApplicationsByStatus('active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({getApplicationsByStatus('completed').length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archivadas ({getApplicationsByStatus('archived').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                No hay aplicaciones {selectedTab === 'active' ? 'activas' : selectedTab}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedTab === 'active' 
                  ? 'Comienza aplicando a oportunidades laborales'
                  : 'Las aplicaciones aparecerán aquí cuando sean procesadas'
                }
              </p>
              <Link href="/careers">
                <Button>Explorar Empleos</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => {
                const statusConfig = APPLICATION_STATUS_CONFIG[application.status];
                
                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {application.jobTitle}
                              </h3>
                              <Badge 
                                className={cn(statusConfig.bgColor, statusConfig.color)}
                              >
                                {statusConfig.icon}
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {application.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {application.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(application.submittedAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleNotifications(application.id)}
                            >
                              {application.notifications ? (
                                <Bell className="w-4 h-4 text-primary" />
                              ) : (
                                <BellOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {statusConfig.icon}
                                    {application.jobTitle}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {application.company} • {application.department}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Progress */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">Progreso</span>
                                      <span className="text-sm text-muted-foreground">
                                        {statusConfig.progress}%
                                      </span>
                                    </div>
                                    <Progress value={statusConfig.progress} />
                                  </div>

                                  {/* Next Step */}
                                  {application.nextStep && (
                                    <Card className="bg-blue-50 border-blue-200">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Calendar className="w-4 h-4 text-blue-600" />
                                          <span className="font-medium text-blue-900">
                                            Próximo Paso
                                          </span>
                                        </div>
                                        <p className="text-sm text-blue-800">
                                          {application.nextStep.description}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                          {application.nextStep.date.toLocaleDateString('es-PE', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Documents */}
                                  <div>
                                    <h4 className="font-medium mb-3">Documentos Enviados</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(application.documents).map(([doc, sent]) => (
                                        <div key={doc} className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg text-sm",
                                          sent ? "bg-green-50 text-green-800" : "bg-gray-50 text-gray-600"
                                        )}>
                                          {sent ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            <XCircle className="w-4 h-4" />
                                          )}
                                          {doc === 'cv' && 'Currículum'}
                                          {doc === 'coverLetter' && 'Carta de Presentación'}
                                          {doc === 'portfolio' && 'Portafolio'}
                                          {doc === 'certificates' && 'Certificados'}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Timeline */}
                                  <div>
                                    <h4 className="font-medium mb-3">Historial</h4>
                                    <div className="space-y-3">
                                      {application.timeline.map((event, idx) => (
                                        <div key={event.id} className="flex gap-3">
                                          <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            event.important ? "bg-primary" : "bg-muted"
                                          )}>
                                            <div className={cn(
                                              "w-2 h-2 rounded-full",
                                              event.important ? "bg-white" : "bg-muted-foreground"
                                            )} />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h5 className="font-medium text-sm">
                                                {event.title}
                                              </h5>
                                              <span className="text-xs text-muted-foreground">
                                                {formatTimeAgo(event.date)}
                                              </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              {event.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Add Note */}
                                  <div>
                                    <h4 className="font-medium mb-3">Agregar Nota</h4>
                                    <div className="flex gap-2">
                                      <Textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Agregar una nota personal sobre esta aplicación..."
                                        className="flex-1"
                                      />
                                      <Button
                                        onClick={() => addNote(application.id)}
                                        disabled={!newNote.trim()}
                                      >
                                        Agregar
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Feedback */}
                                  {application.feedback && (
                                    <Card className="bg-yellow-50 border-yellow-200">
                                      <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                          <Star className="w-4 h-4 text-yellow-600" />
                                          Feedback Recibido
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-sm">Calificación:</span>
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={cn(
                                                  "w-4 h-4",
                                                  i < application.feedback!.rating
                                                    ? "text-yellow-500 fill-current"
                                                    : "text-gray-300"
                                                )}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                          {application.feedback.comments}
                                        </p>
                                        {application.feedback.interviewer && (
                                          <p className="text-xs text-gray-600">
                                            - {application.feedback.interviewer}
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        <Progress 
                          value={statusConfig.progress} 
                          className="mb-3"
                        />

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              Enviada el {application.submittedAt.toLocaleDateString('es-PE')}
                            </span>
                            {application.timeline.length > 1 && (
                              <span className="text-muted-foreground">
                                {application.timeline.length - 1} actualizaciones
                              </span>
                            )}
                          </div>
                          
                          {application.nextStep && (
                            <Badge variant="outline" className="text-xs">
                              Próximo: {application.nextStep.date.toLocaleDateString('es-PE', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}