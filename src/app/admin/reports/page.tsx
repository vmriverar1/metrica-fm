'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Search, 
  Filter,
  Download,
  Eye,
  Trash2,
  Plus,
  Clock,
  FileText,
  TrendingUp,
  Mail,
  Settings,
  Briefcase,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink
} from 'lucide-react';

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  status: 'completed' | 'generating' | 'error';
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  fileUrl?: string;
  fileSize?: number;
  parameters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    includeMetrics: string[];
    format: string;
  };
  metrics: {
    totalPages?: number;
    totalSheets?: number;
    executionTime?: number;
    dataPoints?: number;
    progress?: number;
  };
  downloadCount: number;
  lastDownloaded?: Date;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  defaultParameters: any;
  availableMetrics: {
    key: string;
    name: string;
    description: string;
  }[];
}

interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        
        // Convertir fechas de strings a Date objects para reportes
        const reportsWithDates = (data.reports || []).map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt),
          completedAt: report.completedAt ? new Date(report.completedAt) : null,
          lastDownloaded: report.lastDownloaded ? new Date(report.lastDownloaded) : null,
          parameters: {
            ...report.parameters,
            dateRange: {
              start: new Date(report.parameters.dateRange.start),
              end: new Date(report.parameters.dateRange.end)
            }
          }
        }));

        setReports(reportsWithDates);
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
      } else {
        console.error('Error loading reports');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter(report => report.id !== reportId));
      } else {
        alert('Error al eliminar reporte');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error al eliminar reporte');
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Generar reporte real basado en el tipo
      const reportData = await generateRealReportData(report.type, report.parameters);
      
      // Crear y descargar CSV con datos reales
      const csvContent = generateCSV(reportData, report.type);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Actualizar contador de descargas
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'download' }),
      });

      if (response.ok) {
        const result = await response.json();
        setReports(reports.map(r => 
          r.id === reportId 
            ? { ...r, downloadCount: result.downloadCount, lastDownloaded: new Date() }
            : r
        ));
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error al generar reporte');
    }
  };

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'generating': return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'mail': return <Mail className="w-5 h-5" />;
      case 'trending-up': return <TrendingUp className="w-5 h-5" />;
      case 'bar-chart-3': return <BarChart3 className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      case 'briefcase': return <Briefcase className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (colorName: string) => {
    switch (colorName) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'gray': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Generar datos reales para reportes
  const generateRealReportData = async (reportType: string, parameters: any) => {
    const startDate = new Date(parameters.dateRange.start);
    const endDate = new Date(parameters.dateRange.end);

    switch (reportType) {
      case 'subscription_analytics':
        // Obtener datos reales de suscripciones
        const subsResponse = await fetch('/api/admin/subscriptions?type=newsletter');
        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          const subs = subsData.newsletter_subscriptions || [];
          
          // Filtrar por rango de fechas
          const filteredSubs = subs.filter((sub: any) => {
            const subDate = new Date(sub.subscribedAt);
            return subDate >= startDate && subDate <= endDate;
          });

          return {
            type: 'newsletter',
            data: filteredSubs,
            summary: {
              total: filteredSubs.length,
              active: filteredSubs.filter((s: any) => s.status === 'active').length,
              unsubscribed: filteredSubs.filter((s: any) => s.status === 'unsubscribed').length,
              totalEmails: filteredSubs.reduce((sum: number, s: any) => sum + s.emailsSent, 0),
              totalOpens: filteredSubs.reduce((sum: number, s: any) => sum + s.opensCount, 0),
              totalClicks: filteredSubs.reduce((sum: number, s: any) => sum + s.clicksCount, 0)
            }
          };
        }
        break;

      case 'contacts_analytics':
        // Obtener datos reales de contactos
        const contactsResponse = await fetch('/api/admin/subscriptions?type=contacts');
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          const contacts = contactsData.contact_submissions || [];
          
          // Filtrar por rango de fechas
          const filteredContacts = contacts.filter((contact: any) => {
            const contactDate = new Date(contact.submittedAt);
            return contactDate >= startDate && contactDate <= endDate;
          });

          return {
            type: 'contacts',
            data: filteredContacts,
            summary: {
              total: filteredContacts.length,
              new: filteredContacts.filter((c: any) => c.status === 'new').length,
              contacted: filteredContacts.filter((c: any) => c.status === 'contacted').length,
              qualified: filteredContacts.filter((c: any) => c.status === 'qualified').length,
              bySource: filteredContacts.reduce((acc: any, c: any) => {
                acc[c.source] = (acc[c.source] || 0) + 1;
                return acc;
              }, {}),
              byType: filteredContacts.reduce((acc: any, c: any) => {
                acc[c.projectType || c.type] = (acc[c.projectType || c.type] || 0) + 1;
                return acc;
              }, {})
            }
          };
        }
        break;

      case 'user_activity':
        // Obtener datos reales de usuarios
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const users = usersData || [];
          
          return {
            type: 'users',
            data: users,
            summary: {
              total: users.length,
              active: users.filter((u: any) => u.isActive).length,
              inactive: users.filter((u: any) => !u.isActive).length,
              byRole: users.reduce((acc: any, u: any) => {
                acc[u.role.name] = (acc[u.role.name] || 0) + 1;
                return acc;
              }, {}),
              byDepartment: users.reduce((acc: any, u: any) => {
                acc[u.department] = (acc[u.department] || 0) + 1;
                return acc;
              }, {})
            }
          };
        }
        break;

      case 'executive_summary':
        // Obtener todos los datos para resumen ejecutivo
        const [subsRes, contactsRes, usersRes] = await Promise.all([
          fetch('/api/admin/subscriptions'),
          fetch('/api/admin/subscriptions?type=contacts'),
          fetch('/api/admin/users')
        ]);

        const allData: any = {};
        if (subsRes.ok) {
          const data = await subsRes.json();
          allData.newsletter = data.newsletter_subscriptions || [];
        }
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          allData.contacts = data.contact_submissions || [];
        }
        if (usersRes.ok) {
          allData.users = await usersRes.json() || [];
        }

        return {
          type: 'executive',
          data: allData,
          summary: {
            totalUsers: allData.users?.length || 0,
            activeUsers: allData.users?.filter((u: any) => u.isActive).length || 0,
            totalSubscribers: allData.newsletter?.length || 0,
            activeSubscribers: allData.newsletter?.filter((s: any) => s.status === 'active').length || 0,
            totalContacts: allData.contacts?.length || 0,
            newContacts: allData.contacts?.filter((c: any) => c.status === 'new').length || 0
          }
        };
    }

    return { type: 'unknown', data: [], summary: {} };
  };

  // Generar CSV con datos reales
  const generateCSV = (reportData: any, reportType: string) => {
    let csvContent = '';

    switch (reportType) {
      case 'subscription_analytics':
        csvContent = 'Email,Nombre,Apellido,Empresa,Estado,Fuente,Fecha Suscripción,Emails Enviados,Aperturas,Clicks,Engagement %\n';
        reportData.data.forEach((sub: any) => {
          const engagement = sub.emailsSent > 0 ? Math.round((sub.opensCount / sub.emailsSent) * 100) : 0;
          const row = [
            sub.email,
            sub.firstName,
            sub.lastName,
            sub.company || '',
            sub.status,
            sub.source,
            new Date(sub.subscribedAt).toLocaleDateString(),
            sub.emailsSent,
            sub.opensCount,
            sub.clicksCount,
            engagement
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          csvContent += row + '\n';
        });
        break;

      case 'contacts_analytics':
        csvContent = 'Email,Nombre,Apellido,Empresa,Tipo,Estado,Prioridad,Fuente,Proyecto,Presupuesto,Fecha,Mensaje\n';
        reportData.data.forEach((contact: any) => {
          const row = [
            contact.email,
            contact.firstName,
            contact.lastName,
            contact.company || '',
            contact.type,
            contact.status,
            contact.priority,
            contact.source,
            contact.projectType || '',
            contact.budget || '',
            new Date(contact.submittedAt).toLocaleDateString(),
            contact.message.replace(/\n/g, ' ').replace(/"/g, '""')
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          csvContent += row + '\n';
        });
        break;

      case 'user_activity':
        csvContent = 'ID,Email,Nombre,Apellido,Rol,Departamento,Estado,Último Login,Fecha Creación\n';
        reportData.data.forEach((user: any) => {
          const row = [
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.role.name,
            user.department,
            user.isActive ? 'Activo' : 'Inactivo',
            user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca',
            new Date(user.createdAt).toLocaleDateString()
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          csvContent += row + '\n';
        });
        break;

      case 'executive_summary':
        csvContent = 'Métrica,Valor\n';
        const summary = reportData.summary;
        const metrics = [
          ['Total Usuarios', summary.totalUsers],
          ['Usuarios Activos', summary.activeUsers],
          ['Total Suscriptores Newsletter', summary.totalSubscribers],
          ['Suscriptores Activos', summary.activeSubscribers],
          ['Total Contactos', summary.totalContacts],
          ['Contactos Nuevos', summary.newContacts],
          ['Tasa Usuarios Activos', `${summary.totalUsers > 0 ? Math.round((summary.activeUsers / summary.totalUsers) * 100) : 0}%`],
          ['Tasa Suscriptores Activos', `${summary.totalSubscribers > 0 ? Math.round((summary.activeSubscribers / summary.totalSubscribers) * 100) : 0}%`]
        ];
        
        metrics.forEach(([metric, value]) => {
          csvContent += `"${metric}","${value}"\n`;
        });
        break;
    }

    return csvContent;
  };

  if (loading) {
    return (
      <AdminLayout title="Generación de Reportes">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Generación de Reportes" 
      description={`${reports.length} reportes generados • ${templates.length} plantillas disponibles`}
      actions={
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generar Reporte
        </Button>
      }
    >
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reportes Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'generating').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Loader className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Descargas</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Templates Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar reportes o templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {activeTab === 'reports' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completados</option>
                <option value="generating">Generando</option>
                <option value="error">Con Error</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tabs para Reportes vs Templates */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reportes Generados ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Reportes Generados */}
        <TabsContent value="reports">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descargas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => {
                    const category = categories.find(c => c.id === report.category);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {report.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {report.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category && (
                            <Badge className={getCategoryColor(category.color)}>
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(category.icon)}
                                {category.name}
                              </span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>
                          {report.status === 'generating' && report.metrics.progress && (
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${report.metrics.progress}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.fileSize ? formatFileSize(report.fileSize) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.downloadCount}
                          {report.lastDownloaded && (
                            <div className="text-xs text-gray-500">
                              Último: {report.lastDownloaded.toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.createdAt.toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            por {report.createdBy}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {report.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(report.id)}
                                title="Descargar reporte"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const reportData = await generateRealReportData(report.type, report.parameters);
                                  let details = `Detalles del reporte:\n\nTítulo: ${report.title}\nTipo: ${report.type}\nCreado: ${report.createdAt.toLocaleDateString()}\nRango: ${report.parameters.dateRange.start.toLocaleDateString()} - ${report.parameters.dateRange.end.toLocaleDateString()}\n\n`;
                                  
                                  if (reportData.summary) {
                                    details += 'Resumen de datos:\n';
                                    Object.entries(reportData.summary).forEach(([key, value]) => {
                                      details += `${key}: ${value}\n`;
                                    });
                                  }
                                  
                                  alert(details);
                                } catch (error) {
                                  alert(`Error al cargar detalles: ${error}`);
                                }
                              }}
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'No se encontraron reportes con los filtros aplicados.'
                    : 'Comienza generando tu primer reporte.'
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Templates */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const category = categories.find(c => c.id === template.category);
              return (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category && (
                        <div className={`p-2 rounded-lg ${getCategoryColor(category.color)}`}>
                          {getCategoryIcon(category.icon)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{category?.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.estimatedTime}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">{template.description}</p>

                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-gray-900">Métricas incluidas:</h4>
                    <div className="space-y-2">
                      {template.availableMetrics.slice(0, 3).map((metric) => (
                        <div key={metric.key} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{metric.name}</div>
                            <div className="text-xs text-gray-600">{metric.description}</div>
                          </div>
                        </div>
                      ))}
                      {template.availableMetrics.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{template.availableMetrics.length - 3} métricas más
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay templates</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No se encontraron templates con los filtros aplicados.'
                  : 'No hay templates disponibles.'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}