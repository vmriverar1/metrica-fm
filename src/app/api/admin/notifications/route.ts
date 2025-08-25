import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTIFICATIONS_FILE_PATH = path.join(process.cwd(), 'private/data/notifications.json');

// Función helper para leer el archivo de notificaciones
async function readNotificationsFile() {
  try {
    const fileContents = await fs.readFile(NOTIFICATIONS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading notifications file:', error);
    return { 
      notifications: [], 
      settings: {
        maxNotifications: 30,
        enabledNotifications: {
          new_subscriber: true,
          new_contact: true
        }
      }, 
      stats: {
        totalNotifications: 0,
        unreadCount: 0
      }
    };
  }
}

// Función helper para escribir el archivo de notificaciones
async function writeNotificationsFile(data: any) {
  try {
    await fs.writeFile(NOTIFICATIONS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing notifications file:', error);
    return false;
  }
}

// Función para mantener solo las últimas 30 notificaciones
function limitNotifications(notifications: any[], maxCount: number = 30) {
  if (notifications.length <= maxCount) return notifications;
  
  // Ordenar por fecha de creación (más recientes primero) y tomar las primeras 30
  return notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxCount);
}

// Función para actualizar estadísticas
function updateStats(notifications: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalNotifications: notifications.length,
    unreadCount: notifications.filter(n => n.status === 'unread').length,
    todayCount: notifications.filter(n => new Date(n.createdAt) >= today).length,
    thisWeekCount: notifications.filter(n => new Date(n.createdAt) >= weekAgo).length,
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {}),
    byPriority: notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {})
  };
}

// GET - Obtener todas las notificaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'read' | 'unread'
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    
    const data = await readNotificationsFile();
    
    let notifications = data.notifications || [];

    // Filtrar por status si se especifica
    if (status) {
      notifications = notifications.filter((n: any) => n.status === status);
    }

    // Filtrar por tipo si se especifica
    if (type) {
      notifications = notifications.filter((n: any) => n.type === type);
    }

    // Filtrar por prioridad si se especifica
    if (priority) {
      notifications = notifications.filter((n: any) => n.priority === priority);
    }

    // Convertir fechas para el frontend
    const notificationsWithDates = notifications.map((notification: any) => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
      readAt: notification.readAt ? new Date(notification.readAt) : null
    }));

    // Ordenar por fecha de creación (más recientes primero)
    notificationsWithDates.sort((a: any, b: any) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json({
      notifications: notificationsWithDates,
      settings: data.settings || {},
      stats: data.stats || updateStats(notifications)
    });
  } catch (error) {
    console.error('Error in GET /api/admin/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', relatedId, relatedType, metadata, actionUrl } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Tipo, título y mensaje son requeridos' },
        { status: 400 }
      );
    }

    const data = await readNotificationsFile();

    // Crear nueva notificación
    const newNotification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      priority,
      status: 'unread',
      relatedId: relatedId || null,
      relatedType: relatedType || null,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      readAt: null,
      actionUrl: actionUrl || null
    };

    // Agregar nueva notificación
    data.notifications = data.notifications || [];
    data.notifications.unshift(newNotification);

    // Mantener solo las últimas 30 notificaciones
    data.notifications = limitNotifications(data.notifications, data.settings?.maxNotifications || 30);

    // Actualizar estadísticas
    data.stats = updateStats(data.notifications);

    // Guardar cambios
    const success = await writeNotificationsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al guardar notificación' },
        { status: 500 }
      );
    }

    // Convertir fechas para respuesta
    const responseNotification = {
      ...newNotification,
      createdAt: new Date(newNotification.createdAt),
      readAt: null
    };

    return NextResponse.json(responseNotification, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'mark_all_read') {
      const data = await readNotificationsFile();
      
      // Marcar todas como leídas
      data.notifications = data.notifications.map((notification: any) => ({
        ...notification,
        status: 'read',
        readAt: notification.status === 'unread' ? new Date().toISOString() : notification.readAt
      }));

      // Actualizar estadísticas
      data.stats = updateStats(data.notifications);

      const success = await writeNotificationsFile(data);
      if (!success) {
        return NextResponse.json(
          { error: 'Error al actualizar notificaciones' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}