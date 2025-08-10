'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { useContentIntelligence } from './useContentIntelligence';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  categories: string[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  location?: {
    enabled: boolean;
    radius: number; // km
    coordinates?: { lat: number; lng: number };
  };
}

interface SmartNotification {
  id: string;
  type: 'blog_post' | 'job_posting' | 'application_status' | 'content_recommendation' | 'career_opportunity' | 'system_alert';
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  personalization: {
    score: number; // Relevance score 0-1
    reasons: string[]; // Why this notification was sent
    targeting: string[]; // User segments this targets
  };
  data: Record<string, any>; // Additional data payload
  deliveryChannels: ('email' | 'push' | 'sms' | 'in-app')[];
  scheduling: {
    sendAt: Date;
    timezone: string;
    respectQuietHours: boolean;
  };
  tracking: {
    sent: boolean;
    sentAt?: Date;
    opened: boolean;
    openedAt?: Date;
    clicked: boolean;
    clickedAt?: Date;
    dismissed: boolean;
    dismissedAt?: Date;
  };
  actions?: Array<{
    id: string;
    label: string;
    url?: string;
    action?: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
  expiresAt?: Date;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationTemplate {
  id: string;
  type: SmartNotification['type'];
  category: string;
  titleTemplate: string;
  messageTemplate: string;
  defaultPriority: SmartNotification['priority'];
  personalizationRules: Array<{
    condition: string;
    scoreModifier: number;
    reasonText: string;
  }>;
  deliveryRules: {
    channels: SmartNotification['deliveryChannels'];
    timing: 'immediate' | 'batched' | 'scheduled';
    batchWindow?: number; // minutes
  };
  actions?: NotificationTemplate['actions'];
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'one-time' | 'recurring' | 'triggered';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: {
    segments: string[];
    filters: Record<string, any>;
    estimatedReach: number;
  };
  template: NotificationTemplate;
  schedule?: {
    startDate: Date;
    endDate?: Date;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM
  };
  trigger?: {
    event: string;
    conditions: Record<string, any>;
    delay?: number; // minutes
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
  };
  createdAt: Date;
}

export function useSmartNotifications(userId: string, userType: 'blog' | 'careers') {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  const analytics = useAdvancedAnalytics(userType === 'blog' ? 'blog' : 'careers');
  const contentIntelligence = useContentIntelligence(userType);
  const notificationQueue = useRef<SmartNotification[]>([]);

  // Initialize notifications system
  useEffect(() => {
    loadUserPreferences();
    loadNotifications();
    setupPushNotifications();
    startNotificationProcessor();
  }, [userId]);

  const loadUserPreferences = useCallback(async () => {
    try {
      const stored = localStorage.getItem(`${userId}_notification_preferences`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        // Set default preferences
        const defaultPrefs: NotificationPreferences = {
          email: true,
          push: false,
          sms: false,
          inApp: true,
          frequency: 'daily',
          categories: userType === 'blog' ? ['industria-tendencias', 'casos-estudio'] : ['gestion-direccion', 'ingenieria-tecnica'],
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          location: {
            enabled: false,
            radius: 50
          }
        };
        setPreferences(defaultPrefs);
        localStorage.setItem(`${userId}_notification_preferences`, JSON.stringify(defaultPrefs));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, [userId, userType]);

  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem(`${userId}_notifications`);
      if (stored) {
        const notificationsData = JSON.parse(stored);
        const parsedNotifications = notificationsData.map((notif: any) => ({
          ...notif,
          scheduling: {
            ...notif.scheduling,
            sendAt: new Date(notif.scheduling.sendAt)
          },
          tracking: {
            ...notif.tracking,
            sentAt: notif.tracking.sentAt ? new Date(notif.tracking.sentAt) : undefined,
            openedAt: notif.tracking.openedAt ? new Date(notif.tracking.openedAt) : undefined,
            clickedAt: notif.tracking.clickedAt ? new Date(notif.tracking.clickedAt) : undefined,
            dismissedAt: notif.tracking.dismissedAt ? new Date(notif.tracking.dismissedAt) : undefined
          },
          expiresAt: notif.expiresAt ? new Date(notif.expiresAt) : undefined,
          createdAt: new Date(notif.createdAt)
        }));
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId]);

  const saveNotifications = useCallback((notificationData: SmartNotification[]) => {
    try {
      localStorage.setItem(`${userId}_notifications`, JSON.stringify(notificationData));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [userId]);

  // Push notifications setup
  const setupPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setPushSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }, []);

  const enablePushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // Would be set in env
      });

      setPushSubscription(subscription);
      
      // Update preferences
      if (preferences) {
        const updatedPrefs = { ...preferences, push: true };
        setPreferences(updatedPrefs);
        localStorage.setItem(`${userId}_notification_preferences`, JSON.stringify(updatedPrefs));
      }

      analytics.trackEvent('push_notifications_enabled', { userId });
      return true;

    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    }
  }, [preferences, userId, analytics]);

  // Generate personalized notification
  const generatePersonalizedNotification = useCallback((
    template: NotificationTemplate,
    data: Record<string, any>,
    userContext?: {
      interests: string[];
      behavior: Record<string, any>;
      location?: { lat: number; lng: number };
    }
  ): SmartNotification => {
    let personalizationScore = 0.5; // Base score
    const reasons: string[] = [];
    const targeting: string[] = [];

    // Apply personalization rules
    template.personalizationRules.forEach(rule => {
      // Simplified rule evaluation - in a real app, this would be more sophisticated
      if (rule.condition.includes('interest') && userContext?.interests) {
        const hasMatchingInterest = userContext.interests.some(interest => 
          data.category?.toLowerCase().includes(interest.toLowerCase()) ||
          data.title?.toLowerCase().includes(interest.toLowerCase())
        );
        if (hasMatchingInterest) {
          personalizationScore += rule.scoreModifier;
          reasons.push(rule.reasonText);
        }
      }

      if (rule.condition.includes('behavior') && userContext?.behavior) {
        // Check user behavior patterns
        const recentActivity = userContext.behavior.recentActivity || 0;
        if (recentActivity > 5) {
          personalizationScore += rule.scoreModifier;
          reasons.push(rule.reasonText);
        }
      }

      if (rule.condition.includes('location') && userContext?.location && data.location) {
        // Simple distance check - in reality, would use proper geo calculations
        const isNearby = true; // Simplified
        if (isNearby) {
          personalizationScore += rule.scoreModifier;
          reasons.push(rule.reasonText);
        }
      }
    });

    // Determine targeting segments
    if (userType === 'blog') {
      targeting.push('blog-readers');
      if (userContext?.interests?.includes('construccion')) targeting.push('construction-professionals');
    } else {
      targeting.push('job-seekers');
      if (data.level === 'senior') targeting.push('senior-professionals');
    }

    // Fill template
    const title = template.titleTemplate
      .replace(/\{([^}]+)\}/g, (match, key) => data[key] || match);
    const message = template.messageTemplate
      .replace(/\{([^}]+)\}/g, (match, key) => data[key] || match);

    // Determine delivery channels based on preferences and priority
    let deliveryChannels = template.deliveryRules.channels;
    if (preferences) {
      deliveryChannels = deliveryChannels.filter(channel => {
        switch (channel) {
          case 'email': return preferences.email;
          case 'push': return preferences.push && pushSubscription;
          case 'sms': return preferences.sms;
          case 'in-app': return preferences.inApp;
          default: return false;
        }
      });
    }

    // Schedule delivery
    const now = new Date();
    let sendAt = now;

    if (template.deliveryRules.timing === 'batched' && template.deliveryRules.batchWindow) {
      sendAt = new Date(now.getTime() + template.deliveryRules.batchWindow * 60000);
    } else if (preferences?.frequency !== 'immediate') {
      // Schedule based on user frequency preference
      switch (preferences.frequency) {
        case 'daily':
          sendAt = new Date(now);
          sendAt.setHours(9, 0, 0, 0); // 9 AM next day
          if (sendAt <= now) sendAt.setDate(sendAt.getDate() + 1);
          break;
        case 'weekly':
          sendAt = new Date(now);
          sendAt.setDate(sendAt.getDate() + (7 - sendAt.getDay() + 1) % 7); // Next Monday
          sendAt.setHours(9, 0, 0, 0);
          break;
        case 'monthly':
          sendAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0, 0);
          break;
      }
    }

    const notification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      title,
      message,
      category: template.category,
      priority: template.defaultPriority,
      personalization: {
        score: Math.min(personalizationScore, 1),
        reasons,
        targeting
      },
      data,
      deliveryChannels,
      scheduling: {
        sendAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        respectQuietHours: true
      },
      tracking: {
        sent: false,
        opened: false,
        clicked: false,
        dismissed: false
      },
      actions: template.actions,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      isRead: false,
      createdAt: now
    };

    return notification;
  }, [userType, preferences, pushSubscription]);

  // Queue notification for delivery
  const queueNotification = useCallback((notification: SmartNotification) => {
    notificationQueue.current.push(notification);
    
    const updatedNotifications = [...notifications, notification];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    analytics.trackEvent('notification_queued', {
      notificationId: notification.id,
      type: notification.type,
      priority: notification.priority,
      personalizationScore: notification.personalization.score
    });
  }, [notifications, saveNotifications, analytics]);

  // Process notification queue
  const startNotificationProcessor = useCallback(() => {
    const processQueue = () => {
      const now = new Date();
      const toProcess = notificationQueue.current.filter(notif => 
        notif.scheduling.sendAt <= now && !notif.tracking.sent
      );

      toProcess.forEach(async notification => {
        // Check quiet hours
        if (preferences?.quietHours.enabled && notification.scheduling.respectQuietHours) {
          const currentHour = now.getHours();
          const quietStart = parseInt(preferences.quietHours.start.split(':')[0]);
          const quietEnd = parseInt(preferences.quietHours.end.split(':')[0]);
          
          const isQuietTime = quietStart > quietEnd ? 
            (currentHour >= quietStart || currentHour < quietEnd) :
            (currentHour >= quietStart && currentHour < quietEnd);

          if (isQuietTime) {
            // Reschedule for after quiet hours
            const nextSend = new Date(now);
            nextSend.setHours(quietEnd, 0, 0, 0);
            if (nextSend <= now) nextSend.setDate(nextSend.getDate() + 1);
            
            notification.scheduling.sendAt = nextSend;
            return;
          }
        }

        // Send notification
        await sendNotification(notification);
      });

      // Clean up processed notifications from queue
      notificationQueue.current = notificationQueue.current.filter(notif => !notif.tracking.sent);
    };

    // Process queue every minute
    const interval = setInterval(processQueue, 60000);
    processQueue(); // Initial run

    return () => clearInterval(interval);
  }, [preferences]);

  // Send notification through selected channels
  const sendNotification = useCallback(async (notification: SmartNotification) => {
    const results = await Promise.allSettled(
      notification.deliveryChannels.map(async channel => {
        switch (channel) {
          case 'push':
            return sendPushNotification(notification);
          case 'email':
            return sendEmailNotification(notification);
          case 'sms':
            return sendSMSNotification(notification);
          case 'in-app':
            return showInAppNotification(notification);
          default:
            throw new Error(`Unknown channel: ${channel}`);
        }
      })
    );

    const hasSuccess = results.some(result => result.status === 'fulfilled');

    if (hasSuccess) {
      // Mark as sent
      notification.tracking.sent = true;
      notification.tracking.sentAt = new Date();

      // Update notifications list
      const updatedNotifications = notifications.map(notif =>
        notif.id === notification.id ? notification : notif
      );
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);

      analytics.trackEvent('notification_sent', {
        notificationId: notification.id,
        channels: notification.deliveryChannels,
        priority: notification.priority
      });
    }

    return hasSuccess;
  }, [notifications, saveNotifications, analytics]);

  // Channel-specific sending functions
  const sendPushNotification = useCallback(async (notification: SmartNotification) => {
    if (!pushSubscription) throw new Error('No push subscription');

    // In a real app, this would send to your push service
    console.log('Sending push notification:', notification.title);
    
    // Show browser notification as demo
    if (Notification.permission === 'granted') {
      const notificationOptions = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        data: notification.data,
        actions: notification.actions?.slice(0, 2).map(action => ({
          action: action.id,
          title: action.label
        }))
      };

      const browserNotif = new Notification(notification.title, notificationOptions);
      
      browserNotif.onclick = () => {
        markNotificationAsClicked(notification.id);
        if (notification.data.url) {
          window.open(notification.data.url, '_blank');
        }
        browserNotif.close();
      };
    }

    return true;
  }, [pushSubscription]);

  const sendEmailNotification = useCallback(async (notification: SmartNotification) => {
    // In a real app, this would integrate with email service (SendGrid, etc.)
    console.log('Sending email notification:', notification.title);
    return true;
  }, []);

  const sendSMSNotification = useCallback(async (notification: SmartNotification) => {
    // In a real app, this would integrate with SMS service (Twilio, etc.)
    console.log('Sending SMS notification:', notification.title);
    return true;
  }, []);

  const showInAppNotification = useCallback(async (notification: SmartNotification) => {
    // This would integrate with your in-app notification system
    console.log('Showing in-app notification:', notification.title);
    return true;
  }, []);

  // Notification interaction tracking
  const markNotificationAsRead = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === notificationId) {
        notif.isRead = true;
        if (!notif.tracking.opened) {
          notif.tracking.opened = true;
          notif.tracking.openedAt = new Date();
        }
      }
      return notif;
    });

    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    analytics.trackEvent('notification_read', { notificationId });
  }, [notifications, saveNotifications, analytics]);

  const markNotificationAsClicked = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === notificationId) {
        notif.tracking.clicked = true;
        notif.tracking.clickedAt = new Date();
        if (!notif.tracking.opened) {
          notif.tracking.opened = true;
          notif.tracking.openedAt = new Date();
        }
      }
      return notif;
    });

    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    analytics.trackEvent('notification_clicked', { notificationId });
  }, [notifications, saveNotifications, analytics]);

  const dismissNotification = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === notificationId) {
        notif.tracking.dismissed = true;
        notif.tracking.dismissedAt = new Date();
      }
      return notif;
    });

    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    analytics.trackEvent('notification_dismissed', { notificationId });
  }, [notifications, saveNotifications, analytics]);

  // Update user preferences
  const updateNotificationPreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem(`${userId}_notification_preferences`, JSON.stringify(updated));

    analytics.trackEvent('notification_preferences_updated', {
      changes: Object.keys(newPreferences)
    });
  }, [preferences, userId, analytics]);

  // Get unread notifications count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.isRead).length;
  }, [notifications]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category?: string) => {
    return category 
      ? notifications.filter(notif => notif.category === category)
      : notifications;
  }, [notifications]);

  // Clear old notifications
  const clearOldNotifications = useCallback((olderThanDays = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const filteredNotifications = notifications.filter(notif => 
      notif.createdAt > cutoffDate || !notif.isRead
    );

    if (filteredNotifications.length !== notifications.length) {
      setNotifications(filteredNotifications);
      saveNotifications(filteredNotifications);

      analytics.trackEvent('notifications_cleaned', {
        removedCount: notifications.length - filteredNotifications.length
      });
    }
  }, [notifications, saveNotifications, analytics]);

  return {
    // State
    notifications,
    preferences,
    isLoading,
    pushSubscription,
    
    // Actions
    generatePersonalizedNotification,
    queueNotification,
    markNotificationAsRead,
    markNotificationAsClicked,
    dismissNotification,
    updateNotificationPreferences,
    enablePushNotifications,
    clearOldNotifications,
    
    // Getters
    getUnreadCount,
    getNotificationsByCategory
  };
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Blog notifications
  new_blog_post: {
    id: 'new_blog_post',
    type: 'blog_post',
    category: 'content',
    titleTemplate: 'Nuevo artículo: {title}',
    messageTemplate: 'Hemos publicado un nuevo artículo sobre {category} que podría interesarte.',
    defaultPriority: 'medium',
    personalizationRules: [
      {
        condition: 'interest_match',
        scoreModifier: 0.3,
        reasonText: 'Basado en tus intereses'
      },
      {
        condition: 'recent_behavior',
        scoreModifier: 0.2,
        reasonText: 'Usuario activo reciente'
      }
    ],
    deliveryRules: {
      channels: ['email', 'push', 'in-app'],
      timing: 'batched',
      batchWindow: 60
    },
    actions: [
      {
        id: 'read_article',
        label: 'Leer artículo',
        style: 'primary'
      },
      {
        id: 'save_for_later',
        label: 'Guardar',
        style: 'secondary'
      }
    ]
  },

  // Career notifications
  matching_job_posted: {
    id: 'matching_job_posted',
    type: 'job_posting',
    category: 'opportunities',
    titleTemplate: 'Nueva oportunidad: {title}',
    messageTemplate: 'Encontramos una posición que coincide con tu perfil: {title} en {location}.',
    defaultPriority: 'high',
    personalizationRules: [
      {
        condition: 'skill_match',
        scoreModifier: 0.4,
        reasonText: 'Coincide con tus habilidades'
      },
      {
        condition: 'location_match',
        scoreModifier: 0.2,
        reasonText: 'Cerca de tu ubicación'
      },
      {
        condition: 'salary_match',
        scoreModifier: 0.2,
        reasonText: 'Dentro de tu rango salarial'
      }
    ],
    deliveryRules: {
      channels: ['push', 'email', 'in-app'],
      timing: 'immediate'
    },
    actions: [
      {
        id: 'view_job',
        label: 'Ver posición',
        style: 'primary'
      },
      {
        id: 'apply_now',
        label: 'Aplicar ahora',
        style: 'primary'
      }
    ]
  },

  application_status_update: {
    id: 'application_status_update',
    type: 'application_status',
    category: 'applications',
    titleTemplate: 'Actualización de tu aplicación',
    messageTemplate: 'Tu aplicación para {jobTitle} ha sido {status}.',
    defaultPriority: 'high',
    personalizationRules: [],
    deliveryRules: {
      channels: ['push', 'email', 'in-app'],
      timing: 'immediate'
    },
    actions: [
      {
        id: 'view_application',
        label: 'Ver detalles',
        style: 'primary'
      }
    ]
  }
};

// Hook for notification campaigns (for admin/marketing use)
export function useNotificationCampaigns() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const analytics = useAdvancedAnalytics('careers');

  const createCampaign = useCallback((
    campaignData: Omit<NotificationCampaign, 'id' | 'metrics' | 'createdAt'>
  ): string => {
    const campaign: NotificationCampaign = {
      ...campaignData,
      id: `campaign_${Date.now()}`,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        unsubscribed: 0
      },
      createdAt: new Date()
    };

    setCampaigns(prev => [...prev, campaign]);

    analytics.trackEvent('notification_campaign_created', {
      campaignId: campaign.id,
      type: campaign.type,
      estimatedReach: campaign.targetAudience.estimatedReach
    });

    return campaign.id;
  }, [analytics]);

  return {
    campaigns,
    createCampaign
  };
}