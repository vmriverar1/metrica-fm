import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTIFICATIONS_FILE_PATH = path.join(process.cwd(), 'private/data/notifications.json');

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

async function writeNotificationsFile(data: any) {
  try {
    await fs.writeFile(NOTIFICATIONS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing notifications file:', error);
    return false;
  }
}

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

// PATCH - Marcar notificación individual como leída
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (action === 'mark_read') {
      const data = await readNotificationsFile();
      
      // Encontrar y actualizar la notificación
      const notificationIndex = data.notifications.findIndex((n: any) => n.id === id);
      if (notificationIndex === -1) {
        return NextResponse.json(
          { error: 'Notificación no encontrada' },
          { status: 404 }
        );
      }

      // Marcar como leída si no lo estaba ya
      if (data.notifications[notificationIndex].status === 'unread') {
        data.notifications[notificationIndex].status = 'read';
        data.notifications[notificationIndex].readAt = new Date().toISOString();
      }

      // Actualizar estadísticas
      data.stats = updateStats(data.notifications);

      const success = await writeNotificationsFile(data);
      if (!success) {
        return NextResponse.json(
          { error: 'Error al actualizar notificación' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Notificación marcada como leída' });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/notifications/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación individual
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await readNotificationsFile();
    
    // Encontrar y eliminar la notificación
    const initialLength = data.notifications.length;
    data.notifications = data.notifications.filter((n: any) => n.id !== id);
    
    if (data.notifications.length === initialLength) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estadísticas
    data.stats = updateStats(data.notifications);

    const success = await writeNotificationsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar notificación' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/notifications/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}