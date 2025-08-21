'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

export interface ProgressTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

interface ProgressTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ProgressTask[];
  title?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  isOpen,
  onClose,
  tasks,
  title = 'Progreso de operaciones',
  allowCancel = false,
  onCancel
}) => {
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = { ...prev };
        tasks.forEach(task => {
          if (task.status === 'running' && task.startTime) {
            newElapsed[task.id] = Math.floor((Date.now() - task.startTime.getTime()) / 1000);
          }
        });
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const getStatusIcon = (status: ProgressTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProgressTask['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200';
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  };

  const getOverallStatus = () => {
    if (tasks.some(task => task.status === 'failed')) return 'failed';
    if (tasks.some(task => task.status === 'running')) return 'running';
    if (tasks.every(task => task.status === 'completed')) return 'completed';
    return 'pending';
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const failedTasks = tasks.filter(task => task.status === 'failed').length;
  const runningTasks = tasks.filter(task => task.status === 'running').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(getOverallStatus())}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso general</span>
              <span>{getTotalProgress()}%</span>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completedTasks} completadas</span>
              {runningTasks > 0 && <span>{runningTasks} en progreso</span>}
              {failedTasks > 0 && <span className="text-red-500">{failedTasks} fallidas</span>}
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <div className="font-medium text-sm">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-500">
                    {task.status === 'running' && elapsedTime[task.id] && (
                      <div>{formatTime(elapsedTime[task.id])}</div>
                    )}
                    {task.status === 'completed' && task.endTime && task.startTime && (
                      <div>
                        {formatTime(Math.floor((task.endTime.getTime() - task.startTime.getTime()) / 1000))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar for individual task */}
                {task.status !== 'pending' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>
                        {task.status === 'failed' ? 'Error' : 
                         task.status === 'completed' ? 'Completado' : 'En progreso'}
                      </span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress 
                      value={task.progress} 
                      className={`h-1 ${getStatusColor(task.status)}`}
                    />
                  </div>
                )}

                {/* Error message */}
                {task.status === 'failed' && task.error && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded text-xs">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700">{task.error}</span>
                  </div>
                )}

                {/* Success result */}
                {task.status === 'completed' && task.result && (
                  <div className="flex items-start gap-2 p-2 bg-green-50 rounded text-xs">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-green-700">
                      {typeof task.result === 'string' ? task.result : 'Operación completada exitosamente'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <div>
              {allowCancel && runningTasks > 0 && (
                <Button variant="outline" onClick={onCancel}>
                  Cancelar operaciones
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {getOverallStatus() === 'completed' && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar reporte
                </Button>
              )}
              
              <Button 
                onClick={onClose}
                disabled={runningTasks > 0}
                variant={runningTasks > 0 ? "outline" : "default"}
              >
                {runningTasks > 0 ? 'Ejecutándose...' : 'Cerrar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing progress tracking
export const useProgressTracker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<ProgressTask[]>([]);

  const addTask = (task: Omit<ProgressTask, 'id' | 'startTime'>) => {
    const newTask: ProgressTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      startTime: task.status === 'running' ? new Date() : undefined
    };
    
    setTasks(prev => [...prev, newTask]);
    setIsOpen(true);
    
    return newTask.id;
  };

  const updateTask = (id: string, updates: Partial<ProgressTask>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates };
        
        // Set start time when task begins running
        if (updates.status === 'running' && !task.startTime) {
          updatedTask.startTime = new Date();
        }
        
        // Set end time when task completes or fails
        if ((updates.status === 'completed' || updates.status === 'failed') && !task.endTime) {
          updatedTask.endTime = new Date();
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  const close = () => {
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearTasks,
    close,
    open,
    ProgressTrackerComponent: () => (
      <ProgressTracker
        isOpen={isOpen}
        onClose={close}
        tasks={tasks}
      />
    )
  };
};