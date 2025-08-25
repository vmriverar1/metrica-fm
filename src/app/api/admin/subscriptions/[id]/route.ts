import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIPTIONS_FILE_PATH = path.join(process.cwd(), 'private/data/subscriptions.json');

// Función helper para leer el archivo de suscripciones
async function readSubscriptionsFile() {
  try {
    const fileContents = await fs.readFile(SUBSCRIPTIONS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading subscriptions file:', error);
    return { newsletter_subscriptions: [], contact_submissions: [], categories: {} };
  }
}

// Función helper para escribir el archivo de suscripciones
async function writeSubscriptionsFile(data: any) {
  try {
    await fs.writeFile(SUBSCRIPTIONS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing subscriptions file:', error);
    return false;
  }
}

// GET - Obtener entrada específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readSubscriptionsFile();
    
    // Buscar en newsletter subscriptions
    let entry = data.newsletter_subscriptions.find((sub: any) => sub.id === id);
    let type = 'newsletter';
    
    // Si no se encuentra, buscar en contact submissions
    if (!entry) {
      entry = data.contact_submissions.find((contact: any) => contact.id === id);
      type = 'contact';
    }

    if (!entry) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    // Convertir fechas
    if (type === 'newsletter') {
      entry = {
        ...entry,
        subscribedAt: new Date(entry.subscribedAt),
        lastEmailSent: entry.lastEmailSent ? new Date(entry.lastEmailSent) : null,
        unsubscribedAt: entry.unsubscribedAt ? new Date(entry.unsubscribedAt) : null
      };
    } else {
      entry = {
        ...entry,
        submittedAt: new Date(entry.submittedAt),
        followUpDate: entry.followUpDate ? new Date(entry.followUpDate) : null,
        notes: entry.notes ? entry.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })) : []
      };
    }

    return NextResponse.json({ ...entry, type });
  } catch (error) {
    console.error('Error in GET /api/admin/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar entrada específica
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await readSubscriptionsFile();

    // Buscar en newsletter subscriptions
    let entryIndex = data.newsletter_subscriptions.findIndex((sub: any) => sub.id === id);
    let type = 'newsletter';
    let arrayKey = 'newsletter_subscriptions';
    
    // Si no se encuentra, buscar en contact submissions
    if (entryIndex === -1) {
      entryIndex = data.contact_submissions.findIndex((contact: any) => contact.id === id);
      type = 'contact';
      arrayKey = 'contact_submissions';
    }

    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    const existingEntry = data[arrayKey][entryIndex];

    // Validaciones específicas por tipo
    if (type === 'newsletter' && body.email && body.email !== existingEntry.email) {
      // Verificar que el nuevo email no exista
      const emailExists = data.newsletter_subscriptions.some((sub: any) => 
        sub.email === body.email && sub.id !== id
      );
      if (emailExists) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Manejar cambio de estado especial para newsletter
    if (type === 'newsletter' && body.status && body.status !== existingEntry.status) {
      if (body.status === 'unsubscribed' && existingEntry.status !== 'unsubscribed') {
        body.unsubscribedAt = new Date().toISOString();
      } else if (body.status === 'active' && existingEntry.status === 'unsubscribed') {
        body.unsubscribedAt = null;
        body.unsubscribeReason = null;
      }
    }

    // Actualizar entrada
    const updatedEntry = {
      ...existingEntry,
      ...body,
      updatedAt: new Date().toISOString()
    };

    data[arrayKey][entryIndex] = updatedEntry;

    const success = await writeSubscriptionsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar entrada' },
        { status: 500 }
      );
    }

    // Convertir fechas para respuesta
    let responseEntry;
    if (type === 'newsletter') {
      responseEntry = {
        ...updatedEntry,
        subscribedAt: new Date(updatedEntry.subscribedAt),
        lastEmailSent: updatedEntry.lastEmailSent ? new Date(updatedEntry.lastEmailSent) : null,
        unsubscribedAt: updatedEntry.unsubscribedAt ? new Date(updatedEntry.unsubscribedAt) : null
      };
    } else {
      responseEntry = {
        ...updatedEntry,
        submittedAt: new Date(updatedEntry.submittedAt),
        followUpDate: updatedEntry.followUpDate ? new Date(updatedEntry.followUpDate) : null,
        notes: updatedEntry.notes ? updatedEntry.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })) : []
      };
    }

    return NextResponse.json(responseEntry);
  } catch (error) {
    console.error('Error in PATCH /api/admin/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readSubscriptionsFile();

    // Buscar en newsletter subscriptions
    let entryIndex = data.newsletter_subscriptions.findIndex((sub: any) => sub.id === id);
    let arrayKey = 'newsletter_subscriptions';
    
    // Si no se encuentra, buscar en contact submissions
    if (entryIndex === -1) {
      entryIndex = data.contact_submissions.findIndex((contact: any) => contact.id === id);
      arrayKey = 'contact_submissions';
    }

    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Entrada no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar entrada
    data[arrayKey].splice(entryIndex, 1);

    const success = await writeSubscriptionsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar entrada' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}