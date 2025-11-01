'use client';

import React, { useState } from 'react';
import { useDepartments } from '@/hooks/useCareersAdmin';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Building2, ArrowLeft, Edit, Trash2, Palette } from 'lucide-react';
import { Department } from '@/types/careers';

const DepartmentsManagement = () => {
  const router = useRouter();
  const {
    departments,
    loading,
    error,
    remove: removeDepartment,
    refresh: refreshDepartments
  } = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);

  // Filter departments
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete department
  const handleDeleteDepartment = async (department: Department) => {
    try {
      const result = await removeDepartment(department.id);
      if (result.exito) {
        setDeleteConfirm(null);
        refreshDepartments();
      } else {
        console.error('Error deleting department:', result.mensaje);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003F6F]">Gestión de Departamentos</h1>
          <p className="text-gray-600 mt-1">
            Administra los departamentos y áreas de la empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredDepartments.length} departamentos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departamentos
          </CardTitle>
          <CardDescription>
            Lista de todos los departamentos de la empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Cargando departamentos...</div>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay departamentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'No se encontraron departamentos con el término de búsqueda'
                  : 'Comienza creando tu primer departamento'}
              </p>
              <div className="mt-6">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Departamento
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDepartments.map((department) => (
                <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: department.color + '20' }}
                    >
                      <Building2 className="w-6 h-6" style={{ color: department.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{department.name}</h3>
                        <Badge
                          variant={department.active ? "default" : "secondary"}
                          className={department.active ? "bg-green-100 text-green-800" : ""}
                        >
                          {department.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {department.description}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {department.color}
                        </span>
                        <span>ID: {department.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(department)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{deleteConfirm?.name}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteDepartment(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsManagement;