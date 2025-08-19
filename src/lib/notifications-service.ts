/**
 * FASE 5: Notifications Service - Sistema de Notificaciones
 * 
 * Servicio para gestión de notificaciones del sistema de reclutamiento.
 * Incluye emails, notificaciones push y logging de eventos.
 */

import {
  NotificationEvent,
  NotificationTemplate,
  RecruiterProfile,
  JobApplication,
  ApplicationStatus
} from '@/types/careers';

// Mock templates para diferentes tipos de notificaciones
const mockTemplates: NotificationTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Nueva Aplicación Recibida',
    type: 'application-submitted',
    subject: 'Nueva aplicación para {{jobTitle}}',
    htmlContent: `
      <h2>Nueva Aplicación Recibida</h2>
      <p>Hola {{recruiterName}},</p>
      <p>Se ha recibido una nueva aplicación para la posición <strong>{{jobTitle}}</strong>.</p>
      <ul>
        <li><strong>Candidato:</strong> {{candidateName}}</li>
        <li><strong>Email:</strong> {{candidateEmail}}</li>
        <li><strong>Fecha:</strong> {{submittedAt}}</li>
        <li><strong>Fuente:</strong> {{source}}</li>
      </ul>
      <p><a href="{{dashboardUrl}}">Ver en Dashboard</a></p>
    `,
    textContent: 'Nueva aplicación recibida para {{jobTitle}} de {{candidateName}} ({{candidateEmail}}). Ver detalles en {{dashboardUrl}}',
    variables: ['recruiterName', 'jobTitle', 'candidateName', 'candidateEmail', 'submittedAt', 'source', 'dashboardUrl'],
    active: true,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: 'tpl-002',
    name: 'Cambio de Estado',
    type: 'status-changed',
    subject: 'Estado actualizado: {{candidateName}} - {{jobTitle}}',
    htmlContent: `
      <h2>Estado de Aplicación Actualizado</h2>
      <p>Hola {{recruiterName}},</p>
      <p>El estado de la aplicación ha sido actualizado:</p>
      <ul>
        <li><strong>Candidato:</strong> {{candidateName}}</li>
        <li><strong>Posición:</strong> {{jobTitle}}</li>
        <li><strong>Estado anterior:</strong> {{previousStatus}}</li>
        <li><strong>Nuevo estado:</strong> {{newStatus}}</li>
        <li><strong>Actualizado por:</strong> {{updatedBy}}</li>
      </ul>
      <p><a href="{{applicationUrl}}">Ver aplicación</a></p>
    `,
    textContent: 'Estado actualizado para {{candidateName}} en {{jobTitle}}: {{previousStatus}} → {{newStatus}}',
    variables: ['recruiterName', 'candidateName', 'jobTitle', 'previousStatus', 'newStatus', 'updatedBy', 'applicationUrl'],
    active: true,
    createdAt: new Date('2024-12-01')
  },
  {
    id: 'tpl-003',
    name: 'Recordatorio de Entrevista',
    type: 'interview-scheduled',
    subject: 'Recordatorio: Entrevista con {{candidateName}} mañana',
    htmlContent: `
      <h2>Recordatorio de Entrevista</h2>
      <p>Hola {{interviewer}},</p>
      <p>Tienes una entrevista programada para mañana:</p>
      <ul>
        <li><strong>Candidato:</strong> {{candidateName}}</li>
        <li><strong>Posición:</strong> {{jobTitle}}</li>
        <li><strong>Fecha y hora:</strong> {{interviewDate}}</li>
        <li><strong>Tipo:</strong> {{interviewType}}</li>
        <li><strong>Duración:</strong> {{duration}} minutos</li>
      </ul>
      {{#if meetingLink}}
      <p><strong>Enlace de reunión:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>
      {{/if}}
      {{#if location}}
      <p><strong>Ubicación:</strong> {{location}}</p>
      {{/if}}
    `,
    textContent: 'Recordatorio: Entrevista con {{candidateName}} mañana a las {{interviewDate}} para {{jobTitle}}',
    variables: ['interviewer', 'candidateName', 'jobTitle', 'interviewDate', 'interviewType', 'duration', 'meetingLink', 'location'],
    active: true,
    createdAt: new Date('2024-12-01')
  }
];

// Mock notification events storage
let mockNotificationEvents: NotificationEvent[] = [];
let eventIdCounter = 1;

export class NotificationsService {
  /**
   * Send notification when new application is submitted
   */
  static async sendApplicationSubmittedNotification(
    application: JobApplication,
    recruiter: RecruiterProfile
  ): Promise<void> {
    const template = mockTemplates.find(t => t.type === 'application-submitted' && t.active);
    if (!template) return;

    const variables = {
      recruiterName: recruiter.name,
      jobTitle: application.jobTitle,
      candidateName: `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`,
      candidateEmail: application.candidateInfo.email,
      submittedAt: application.submittedAt.toLocaleDateString(),
      source: application.source,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003'}/recruitment-dashboard`
    };

    const notification: NotificationEvent = {
      id: `notif-${eventIdCounter++}`,
      type: 'application-submitted',
      title: this.replaceVariables(template.subject, variables),
      message: this.replaceVariables(template.textContent, variables),
      recipientId: recruiter.id,
      applicationId: application.id,
      jobId: application.jobId,
      priority: 'normal',
      channels: this.getChannelsForRecruiter(recruiter, 'newApplication'),
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        templateId: template.id,
        variables
      }
    };

    // Store notification
    mockNotificationEvents.push(notification);

    // Send via configured channels
    await this.sendNotification(notification, template);
    
    console.log('📧 Notificación enviada:', notification.title);
  }

  /**
   * Send notification when application status changes
   */
  static async sendStatusChangedNotification(
    application: JobApplication,
    previousStatus: ApplicationStatus,
    updatedBy: string,
    recruiter: RecruiterProfile
  ): Promise<void> {
    const template = mockTemplates.find(t => t.type === 'status-changed' && t.active);
    if (!template) return;

    const variables = {
      recruiterName: recruiter.name,
      candidateName: `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`,
      jobTitle: application.jobTitle,
      previousStatus,
      newStatus: application.status,
      updatedBy,
      applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003'}/recruitment-dashboard`
    };

    const notification: NotificationEvent = {
      id: `notif-${eventIdCounter++}`,
      type: 'status-changed',
      title: this.replaceVariables(template.subject, variables),
      message: this.replaceVariables(template.textContent, variables),
      recipientId: recruiter.id,
      applicationId: application.id,
      jobId: application.jobId,
      priority: this.getPriorityForStatusChange(previousStatus, application.status),
      channels: this.getChannelsForRecruiter(recruiter, 'statusChange'),
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        templateId: template.id,
        variables
      }
    };

    mockNotificationEvents.push(notification);
    await this.sendNotification(notification, template);
    
    console.log('🔄 Notificación de cambio de estado enviada:', notification.title);
  }

  /**
   * Send interview reminder notification
   */
  static async sendInterviewReminderNotification(
    application: JobApplication,
    interviewer: RecruiterProfile,
    interviewDetails: {
      scheduledAt: Date;
      type: string;
      duration: number;
      location?: string;
      meetingLink?: string;
    }
  ): Promise<void> {
    const template = mockTemplates.find(t => t.type === 'interview-scheduled' && t.active);
    if (!template) return;

    const variables = {
      interviewer: interviewer.name,
      candidateName: `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`,
      jobTitle: application.jobTitle,
      interviewDate: interviewDetails.scheduledAt.toLocaleString(),
      interviewType: interviewDetails.type,
      duration: interviewDetails.duration.toString(),
      meetingLink: interviewDetails.meetingLink || '',
      location: interviewDetails.location || ''
    };

    const notification: NotificationEvent = {
      id: `notif-${eventIdCounter++}`,
      type: 'interview-scheduled',
      title: this.replaceVariables(template.subject, variables),
      message: this.replaceVariables(template.textContent, variables),
      recipientId: interviewer.id,
      applicationId: application.id,
      jobId: application.jobId,
      priority: 'high',
      channels: this.getChannelsForRecruiter(interviewer, 'interviewReminder'),
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        templateId: template.id,
        variables
      }
    };

    mockNotificationEvents.push(notification);
    await this.sendNotification(notification, template);
    
    console.log('📅 Recordatorio de entrevista enviado:', notification.title);
  }

  /**
   * Get all notifications for a recruiter
   */
  static async getNotificationsForRecruiter(
    recruiterId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<NotificationEvent[]> {
    let notifications = mockNotificationEvents.filter(n => n.recipientId === recruiterId);
    
    if (unreadOnly) {
      notifications = notifications.filter(n => n.status === 'pending' || n.status === 'sent');
    }

    return notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = mockNotificationEvents.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'delivered';
    }
  }

  /**
   * Get notification templates
   */
  static async getTemplates(): Promise<NotificationTemplate[]> {
    return mockTemplates;
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    thisWeek: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const byType = mockNotificationEvents.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = mockNotificationEvents.reduce((acc, notif) => {
      acc[notif.status] = (acc[notif.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisWeek = mockNotificationEvents.filter(n => n.createdAt >= oneWeekAgo).length;

    return {
      total: mockNotificationEvents.length,
      byType,
      byStatus,
      thisWeek
    };
  }

  // Private helper methods

  /**
   * Replace variables in template strings
   */
  private static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  /**
   * Get notification channels for a recruiter based on preferences
   */
  private static getChannelsForRecruiter(
    recruiter: RecruiterProfile,
    eventType: keyof RecruiterProfile['notificationPreferences']['types']
  ): ('email' | 'push' | 'sms')[] {
    const prefs = recruiter.notificationPreferences;
    const channels: ('email' | 'push' | 'sms')[] = [];

    if (prefs.types[eventType]) {
      if (prefs.email) channels.push('email');
      if (prefs.push) channels.push('push');
      if (prefs.sms) channels.push('sms');
    }

    return channels;
  }

  /**
   * Determine priority based on status change
   */
  private static getPriorityForStatusChange(
    from: ApplicationStatus,
    to: ApplicationStatus
  ): NotificationEvent['priority'] {
    // High priority status changes
    if (to === 'hired' || to === 'rejected' || to === 'interview') {
      return 'high';
    }
    
    // Urgent if moving to urgent states
    if (to === 'final-review') {
      return 'urgent';
    }

    return 'normal';
  }

  /**
   * Send notification through configured channels
   */
  private static async sendNotification(
    notification: NotificationEvent,
    template: NotificationTemplate
  ): Promise<void> {
    // In a real implementation, this would integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - Push notification service (Firebase, Pusher, etc.)
    // - SMS service (Twilio, AWS SNS, etc.)

    // For now, just log and mark as sent
    console.log(`📤 Enviando notificación via ${notification.channels.join(', ')}:`);
    console.log(`   - Destinatario: ${notification.recipientId}`);
    console.log(`   - Título: ${notification.title}`);
    console.log(`   - Canales: ${notification.channels.join(', ')}`);

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mark as sent
    notification.status = 'sent';
    notification.sentAt = new Date();
  }

  /**
   * Auto-send notification for new applications
   */
  static async autoNotifyNewApplication(application: JobApplication): Promise<void> {
    // In a real system, this would get the assigned recruiter from the database
    // For now, use mock data
    if (application.assignedTo) {
      const mockRecruiter: RecruiterProfile = {
        id: application.assignedTo.recruiterId,
        name: application.assignedTo.recruiterName,
        email: `${application.assignedTo.recruiterName.toLowerCase().replace(' ', '.')}@metrica-dip.com`,
        role: 'recruiter',
        department: 'Recursos Humanos',
        permissions: {
          canViewAllApplications: true,
          canUpdateApplicationStatus: true,
          canScheduleInterviews: true,
          canAccessAnalytics: false,
          canManageJobs: false,
          canExportData: false
        },
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          types: {
            newApplication: true,
            statusChange: true,
            interviewReminder: true,
            deadlineAlert: true,
            systemUpdate: false
          }
        },
        timezone: 'America/Lima',
        lastActive: new Date(),
        createdAt: new Date()
      };

      await this.sendApplicationSubmittedNotification(application, mockRecruiter);
    }
  }

  /**
   * Clear all notifications (for testing)
   */
  static clearAllNotifications(): void {
    mockNotificationEvents = [];
    eventIdCounter = 1;
  }
}