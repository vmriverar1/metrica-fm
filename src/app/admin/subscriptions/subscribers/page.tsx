'use client';

import React, { useState, useEffect } from 'react';
import { SubscribersService, Subscriber } from '@/lib/firestore/subscribers-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed' | 'bounced'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [searchTerm, statusFilter, subscribers]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const [allSubscribers, subscriberStats] = await Promise.all([
        SubscribersService.getAll(),
        SubscribersService.getStats()
      ]);
      setSubscribers(allSubscribers);
      setStats(subscriberStats);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscribers = () => {
    let filtered = [...subscribers];

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.email.toLowerCase().includes(term) ||
        (sub.name && sub.name.toLowerCase().includes(term))
      );
    }

    setFilteredSubscribers(filtered);
  };

  const handleStatusChange = async (subscriber: Subscriber, newStatus: 'active' | 'unsubscribed') => {
    try {
      await SubscribersService.update(subscriber.id, { status: newStatus });
      await loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      alert('Error al actualizar el estado del suscriptor');
    }
  };

  const handleDelete = async () => {
    if (!subscriberToDelete) return;

    try {
      await SubscribersService.delete(subscriberToDelete.id);
      await loadSubscribers();
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Error al eliminar el suscriptor');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Estado', 'Fecha Suscripción', 'Fuente'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        sub.subscribed_at instanceof Timestamp ? sub.subscribed_at.toDate().toLocaleDateString() : '',
        sub.source || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suscriptores-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !(timestamp instanceof Timestamp)) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      unsubscribed: 'secondary',
      bounced: 'destructive'
    };

    const labels: Record<string, string> = {
      active: 'Activo',
      unsubscribed: 'Desuscrito',
      bounced: 'Rebotado'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Desuscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unsubscribed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rebotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bounced}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suscriptores</CardTitle>
              <CardDescription>
                Gestiona los suscriptores del newsletter
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSubscribers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Activos
              </Button>
              <Button
                variant={statusFilter === 'unsubscribed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('unsubscribed')}
              >
                Desuscritos
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Suscripción</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron suscriptores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {subscriber.email}
                        </div>
                      </TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                      <TableCell>
                        {subscriber.source ? (
                          <Badge variant="outline">{subscriber.source}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {subscriber.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(subscriber, 'unsubscribed')}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desuscribir
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(subscriber, 'active')}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSubscriberToDelete(subscriber);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscriptor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El suscriptor{' '}
              <strong>{subscriberToDelete?.email}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
