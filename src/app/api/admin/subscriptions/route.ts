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
    return { 
      newsletter_subscriptions: [], 
      contact_submissions: [], 
      categories: {
        newsletter_interests: [],
        newsletter_categories: [],
        project_types: [],
        budget_ranges: [],
        timelines: [],
        locations: [],
        contact_sources: []
      }
    };
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

// GET - Obtener todas las suscripciones y contactos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'newsletter' o 'contacts'
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    
    const data = await readSubscriptionsFile();
    
    let result = {
      newsletter_subscriptions: data.newsletter_subscriptions || [],
      contact_submissions: data.contact_submissions || [],
      categories: data.categories || {}
    };

    // Filtrar por tipo si se especifica
    if (type === 'newsletter') {
      result.contact_submissions = [];
    } else if (type === 'contacts') {
      result.newsletter_subscriptions = [];
    }

    // Filtrar por status si se especifica
    if (status) {
      result.newsletter_subscriptions = result.newsletter_subscriptions.filter(
        (sub: any) => sub.status === status
      );
      result.contact_submissions = result.contact_submissions.filter(
        (contact: any) => contact.status === status
      );
    }

    // Filtrar por source si se especifica
    if (source) {
      result.newsletter_subscriptions = result.newsletter_subscriptions.filter(
        (sub: any) => sub.source === source
      );
      result.contact_submissions = result.contact_submissions.filter(
        (contact: any) => contact.source === source
      );
    }

    // Convertir fechas para el frontend
    result.newsletter_subscriptions = result.newsletter_subscriptions.map((sub: any) => ({
      ...sub,
      subscribedAt: new Date(sub.subscribedAt),
      lastEmailSent: sub.lastEmailSent ? new Date(sub.lastEmailSent) : null,
      unsubscribedAt: sub.unsubscribedAt ? new Date(sub.unsubscribedAt) : null
    }));

    result.contact_submissions = result.contact_submissions.map((contact: any) => ({
      ...contact,
      submittedAt: new Date(contact.submittedAt),
      followUpDate: contact.followUpDate ? new Date(contact.followUpDate) : null,
      notes: contact.notes ? contact.notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt)
      })) : []
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/subscriptions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// POST - Crear nueva entrada (newsletter o contacto)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...entryData } = body;
    
    if (!type || (type !== 'newsletter' && type !== 'contact')) {
      return NextResponse.json(
        { error: 'Tipo requerido: newsletter o contact' },
        { status: 400 }
      );
    }

    const data = await readSubscriptionsFile();

    if (type === 'newsletter') {
      // Validar campos requeridos para newsletter
      const { email, firstName, lastName } = entryData;
      if (!email || !firstName || !lastName) {
        return NextResponse.json(
          { error: 'Email, nombre y apellido son requeridos' },
          { status: 400 }
        );
      }

      // Verificar que el email no exista en newsletter
      const existingSubscription = data.newsletter_subscriptions.find(
        (sub: any) => sub.email === email
      );
      if (existingSubscription) {
        return NextResponse.json(
          { error: 'Email ya suscrito al newsletter' },
          { status: 400 }
        );
      }

      // Crear nueva suscripción
      const newSubscription = {
        id: `news_${Date.now()}`,
        ...entryData,
        status: 'active',
        subscribedAt: new Date().toISOString(),
        emailsSent: 0,
        opensCount: 0,
        clicksCount: 0,
        preferences: {
          frequency: 'weekly',
          categories: ['noticias'],
          format: 'html',
          ...entryData.preferences
        }
      };

      data.newsletter_subscriptions.push(newSubscription);
      
      const success = await writeSubscriptionsFile(data);
      if (!success) {
        return NextResponse.json(
          { error: 'Error al guardar suscripción' },
          { status: 500 }
        );
      }

      // Crear notificación automática
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:9003'}/api/admin/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_subscriber',
            title: 'Nueva suscripción al newsletter',
            message: `${firstName} ${lastName} se suscribió al newsletter desde ${entryData.source || 'web'}`,
            priority: 'low',
            relatedId: newSubscription.id,
            relatedType: 'newsletter_subscription',
            metadata: {
              subscriberEmail: email,
              subscriberName: `${firstName} ${lastName}`,
              source: entryData.source || 'web',
              company: entryData.company || 'Independiente'
            },
            actionUrl: `/admin/subscriptions?tab=newsletter&search=${encodeURIComponent(email)}`
          })
        });
      } catch (notifError) {
        console.error('Error creando notificación automática:', notifError);
        // No fallar la creación de suscripción por error en notificación
      }

      return NextResponse.json(newSubscription, { status: 201 });

    } else if (type === 'contact') {
      // Validar campos requeridos para contacto
      const { firstName, lastName, email, message } = entryData;
      if (!firstName || !lastName || !email || !message) {
        return NextResponse.json(
          { error: 'Nombre, apellido, email y mensaje son requeridos' },
          { status: 400 }
        );
      }

      // Crear nuevo contacto
      const newContact = {
        id: `contact_${Date.now()}`,
        type: entryData.type || 'general_inquiry',
        ...entryData,
        status: 'new',
        priority: 'medium',
        submittedAt: new Date().toISOString(),
        assignedTo: null,
        notes: [],
        tags: entryData.tags || []
      };

      data.contact_submissions.push(newContact);
      
      const success = await writeSubscriptionsFile(data);
      if (!success) {
        return NextResponse.json(
          { error: 'Error al guardar contacto' },
          { status: 500 }
        );
      }

      // Crear notificación automática
      try {
        const priorityMap = {
          'urgent': 'high',
          'comercial': 'high',
          'consulta': 'medium',
          'general_inquiry': 'medium'
        };
        const notificationPriority = priorityMap[entryData.type as keyof typeof priorityMap] || 'medium';

        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:9003'}/api/admin/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_contact',
            title: `Nueva consulta de ${entryData.type === 'comercial' ? 'proyecto comercial' : 'contacto'}`,
            message: `${firstName} ${lastName} envió consulta${entryData.projectType ? ` para ${entryData.projectType}` : ''}${entryData.location ? ` en ${entryData.location}` : ''}`,
            priority: notificationPriority,
            relatedId: newContact.id,
            relatedType: 'contact_submission',
            metadata: {
              contactEmail: email,
              contactName: `${firstName} ${lastName}`,
              company: entryData.company || 'Particular',
              projectType: entryData.projectType || 'general',
              budget: entryData.budget || 'no-especificado',
              location: entryData.location || 'no-especificado'
            },
            actionUrl: `/admin/subscriptions?tab=contacts&search=${encodeURIComponent(email)}`
          })
        });
      } catch (notifError) {
        console.error('Error creando notificación automática:', notifError);
        // No fallar la creación de contacto por error en notificación
      }

      return NextResponse.json(newContact, { status: 201 });
    }

  } catch (error) {
    console.error('Error in POST /api/admin/subscriptions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}