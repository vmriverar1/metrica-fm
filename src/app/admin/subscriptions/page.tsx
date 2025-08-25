'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Users,
  MessageSquare,
  Calendar,
  Building,
  Phone,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface NewsletterSubscription {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  phone?: string;
  interests: string[];
  source: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  lastEmailSent?: Date;
  emailsSent: number;
  opensCount: number;
  clicksCount: number;
  preferences: {
    frequency: string;
    categories: string[];
    format: string;
  };
}

interface ContactSubmission {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  message: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  location?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high';
  submittedAt: Date;
  assignedTo?: string;
  followUpDate?: Date;
  notes: any[];
  tags: string[];
}

export default function SubscriptionsAdminPage() {
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSubscription[]>([]);
  const [contactSubs, setContactSubs] = useState<ContactSubmission[]>([]);
  const [categories, setCategories] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('newsletter');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        
        // Convertir fechas de strings a Date objects para newsletter
        const newsletterWithDates = (data.newsletter_subscriptions || []).map((sub: any) => ({
          ...sub,
          subscribedAt: new Date(sub.subscribedAt),
          lastEmailSent: sub.lastEmailSent ? new Date(sub.lastEmailSent) : null,
          unsubscribedAt: sub.unsubscribedAt ? new Date(sub.unsubscribedAt) : null
        }));

        // Convertir fechas de strings a Date objects para contactos
        const contactsWithDates = (data.contact_submissions || []).map((contact: any) => ({
          ...contact,
          submittedAt: new Date(contact.submittedAt),
          followUpDate: contact.followUpDate ? new Date(contact.followUpDate) : null,
          notes: contact.notes ? contact.notes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt)
          })) : []
        }));

        setNewsletterSubs(newsletterWithDates);
        setContactSubs(contactsWithDates);
        setCategories(data.categories || {});
      } else {
        console.error('Error loading subscriptions');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string, type: 'newsletter' | 'contact') => {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (type === 'newsletter') {
          setNewsletterSubs(newsletterSubs.filter(sub => sub.id !== id));
        } else {
          setContactSubs(contactSubs.filter(contact => contact.id !== id));
        }
      } else {
        alert('Error al eliminar entrada');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error al eliminar entrada');
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string, type: 'newsletter' | 'contact') => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedEntry = await response.json();
        
        if (type === 'newsletter') {
          const entryWithDates = {
            ...updatedEntry,
            subscribedAt: new Date(updatedEntry.subscribedAt),
            lastEmailSent: updatedEntry.lastEmailSent ? new Date(updatedEntry.lastEmailSent) : null,
            unsubscribedAt: updatedEntry.unsubscribedAt ? new Date(updatedEntry.unsubscribedAt) : null
          };
          
          setNewsletterSubs(newsletterSubs.map(sub => 
            sub.id === id ? entryWithDates : sub
          ));
        } else {
          const entryWithDates = {
            ...updatedEntry,
            submittedAt: new Date(updatedEntry.submittedAt),
            followUpDate: updatedEntry.followUpDate ? new Date(updatedEntry.followUpDate) : null,
            notes: updatedEntry.notes ? updatedEntry.notes.map((note: any) => ({
              ...note,
              createdAt: new Date(note.createdAt)
            })) : []
          };
          
          setContactSubs(contactSubs.map(contact => 
            contact.id === id ? entryWithDates : contact
          ));
        }
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  };

  // Filtrar newsletter subscriptions
  const filteredNewsletterSubs = newsletterSubs.filter(sub => {
    const matchesSearch = 
      sub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.company && sub.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || sub.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Filtrar contact submissions
  const filteredContactSubs = contactSubs.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || contact.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: string, type: 'newsletter' | 'contact') => {
    if (type === 'newsletter') {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'unsubscribed': return 'bg-red-100 text-red-800';
        case 'bounced': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'qualified': return 'bg-purple-100 text-purple-800';
        case 'converted': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementRate = (opens: number, sent: number) => {
    if (sent === 0) return 0;
    return Math.round((opens / sent) * 100);
  };

  const exportToCSV = () => {
    try {
      let csvContent = '';
      let filename = '';

      if (activeTab === 'newsletter') {
        // Exportar newsletter subscriptions
        filename = `newsletter_subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Headers
        csvContent = 'ID,Email,Nombre,Apellido,Empresa,Posición,Teléfono,Estado,Fuente,Fecha Suscripción,Último Email,Emails Enviados,Aperturas,Clicks,Engagement %,Intereses,Frecuencia\n';
        
        // Data rows
        filteredNewsletterSubs.forEach(sub => {
          const row = [
            sub.id,
            sub.email,
            sub.firstName,
            sub.lastName,
            sub.company || '',
            sub.position || '',
            sub.phone || '',
            sub.status,
            sub.source,
            sub.subscribedAt.toLocaleDateString(),
            sub.lastEmailSent ? sub.lastEmailSent.toLocaleDateString() : '',
            sub.emailsSent,
            sub.opensCount,
            sub.clicksCount,
            getEngagementRate(sub.opensCount, sub.emailsSent),
            sub.interests.join(';'),
            sub.preferences.frequency
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += row + '\n';
        });
      } else {
        // Exportar contact submissions
        filename = `contact_submissions_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Headers
        csvContent = 'ID,Email,Nombre,Apellido,Empresa,Posición,Teléfono,Tipo,Estado,Prioridad,Fuente,Proyecto,Presupuesto,Timeline,Ubicación,Fecha Contacto,Asignado A,Seguimiento,Tags,Mensaje\n';
        
        // Data rows
        filteredContactSubs.forEach(contact => {
          const row = [
            contact.id,
            contact.email,
            contact.firstName,
            contact.lastName,
            contact.company || '',
            contact.position || '',
            contact.phone || '',
            contact.type,
            contact.status,
            contact.priority,
            contact.source,
            contact.projectType || '',
            contact.budget || '',
            contact.timeline || '',
            contact.location || '',
            contact.submittedAt.toLocaleDateString(),
            contact.assignedTo || '',
            contact.followUpDate ? contact.followUpDate.toLocaleDateString() : '',
            contact.tags.join(';'),
            contact.message.replace(/\n/g, ' ').replace(/"/g, '""')
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += row + '\n';
        });
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar archivo CSV');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Suscripciones">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Suscripciones" 
      description={`${newsletterSubs.length} suscriptores newsletter • ${contactSubs.length} contactos`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      }
    >
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Newsletter Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsletterSubs.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contactos Nuevos</p>
              <p className="text-2xl font-bold text-gray-900">
                {contactSubs.filter(c => c.status === 'new').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasa Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsletterSubs.length > 0 
                  ? Math.round((newsletterSubs.reduce((acc, sub) => acc + sub.opensCount, 0) / 
                               newsletterSubs.reduce((acc, sub) => acc + sub.emailsSent, 0) || 0) * 100)
                  : 0
                }%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Leads Calificados</p>
              <p className="text-2xl font-bold text-gray-900">
                {contactSubs.filter(c => c.status === 'qualified' || c.status === 'converted').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Star className="w-6 h-6 text-orange-600" />
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
              placeholder="Buscar por nombre, email o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los estados</option>
              {activeTab === 'newsletter' ? (
                <>
                  <option value="active">Activos</option>
                  <option value="unsubscribed">Desuscritos</option>
                  <option value="bounced">Rebotados</option>
                </>
              ) : (
                <>
                  <option value="new">Nuevos</option>
                  <option value="contacted">Contactados</option>
                  <option value="qualified">Calificados</option>
                  <option value="converted">Convertidos</option>
                  <option value="closed">Cerrados</option>
                </>
              )}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas las fuentes</option>
              {categories.contact_sources?.map((source: string) => (
                <option key={source} value={source}>
                  {source.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs para Newsletter vs Contactos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="newsletter" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Newsletter ({newsletterSubs.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contactos ({contactSubs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Newsletter */}
        <TabsContent value="newsletter">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suscriptor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fuente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Suscripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNewsletterSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {sub.firstName[0]}{sub.lastName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {sub.firstName} {sub.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{sub.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sub.company || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{sub.position || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
                            handleToggleStatus(sub.id, newStatus, 'newsletter');
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status, 'newsletter')}`}
                        >
                          {sub.status === 'active' ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activo
                            </>
                          ) : sub.status === 'unsubscribed' ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Desuscrito
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Rebotado
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getEngagementRate(sub.opensCount, sub.emailsSent)}% 
                          <span className="text-gray-500">({sub.opensCount}/{sub.emailsSent})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.source.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.subscribedAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEntry(sub.id, 'newsletter')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNewsletterSubs.length === 0 && (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay suscriptores</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedStatus !== 'all' || selectedSource !== 'all'
                    ? 'No se encontraron suscriptores con los filtros aplicados.'
                    : 'No hay suscriptores al newsletter aún.'
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Contactos */}
        <TabsContent value="contacts">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fuente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContactSubs.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.projectType || contact.type}</div>
                        <div className="text-sm text-gray-500">
                          {contact.budget && `$${contact.budget}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(contact.status, 'contact')}>
                          {contact.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(contact.priority)}>
                          {contact.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.source.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.submittedAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEntry(contact.id, 'contact')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredContactSubs.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contactos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedStatus !== 'all' || selectedSource !== 'all'
                    ? 'No se encontraron contactos con los filtros aplicados.'
                    : 'No hay contactos enviados aún.'
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}