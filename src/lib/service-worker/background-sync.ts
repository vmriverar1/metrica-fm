// FASE 4A: Background Sync Implementation
// Sistema de sincronización en background para operaciones críticas

import { BACKGROUND_SYNC_QUEUES } from './offline-strategies';

export interface SyncTask {
  id: string;
  type: 'contact-form' | 'newsletter-signup' | 'analytics' | 'admin-operation';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncQueue {
  name: string;
  tasks: SyncTask[];
  isProcessing: boolean;
  lastProcessed: Date | null;
}

class BackgroundSyncManager {
  private queues: Map<string, SyncQueue> = new Map();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Initialize queues
    Object.entries(BACKGROUND_SYNC_QUEUES).forEach(([key, config]) => {
      this.queues.set(config.queueName, {
        name: config.queueName,
        tasks: [],
        isProcessing: false,
        lastProcessed: null,
      });
    });

    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Add task to background sync queue
  async addToQueue(
    queueName: string,
    type: SyncTask['type'],
    data: any,
    maxRetries: number = 3
  ): Promise<string> {
    const taskId = this.generateTaskId();
    const task: SyncTask = {
      id: taskId,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    queue.tasks.push(task);
    await this.persistQueue(queueName);

    // If online, try to process immediately
    if (this.isOnline) {
      this.processQueue(queueName);
    }

    return taskId;
  }

  // Process specific queue
  async processQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue || queue.isProcessing || queue.tasks.length === 0) {
      return;
    }

    queue.isProcessing = true;
    const tasksToProcess = [...queue.tasks];

    for (const task of tasksToProcess) {
      try {
        await this.processTask(task);
        // Remove successful task
        queue.tasks = queue.tasks.filter(t => t.id !== task.id);
      } catch (error) {
        console.error(`Failed to process task ${task.id}:`, error);

        // Increment retry count
        const taskInQueue = queue.tasks.find(t => t.id === task.id);
        if (taskInQueue) {
          taskInQueue.retryCount++;

          // Remove if max retries reached
          if (taskInQueue.retryCount >= taskInQueue.maxRetries) {
            console.warn(`Task ${task.id} exceeded max retries, removing`);
            queue.tasks = queue.tasks.filter(t => t.id !== task.id);
            await this.handleFailedTask(task);
          }
        }
      }
    }

    queue.isProcessing = false;
    queue.lastProcessed = new Date();
    await this.persistQueue(queueName);
  }

  // Process individual task based on type
  private async processTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'contact-form':
        await this.processContactForm(task.data);
        break;

      case 'newsletter-signup':
        await this.processNewsletterSignup(task.data);
        break;

      case 'analytics':
        await this.processAnalytics(task.data);
        break;

      case 'admin-operation':
        await this.processAdminOperation(task.data);
        break;

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Specific task processors
  private async processContactForm(data: any): Promise<void> {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Contact form submission failed: ${response.status}`);
    }
  }

  private async processNewsletterSignup(data: any): Promise<void> {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Newsletter signup failed: ${response.status}`);
    }
  }

  private async processAnalytics(data: any): Promise<void> {
    // Send to Firebase Analytics or custom endpoint
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Analytics tracking failed: ${response.status}`);
    }
  }

  private async processAdminOperation(data: any): Promise<void> {
    const { endpoint, method = 'POST', payload } = data;

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Include auth headers if needed
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Admin operation failed: ${response.status}`);
    }
  }

  // Handle online/offline events
  private handleOnline(): void {
    this.isOnline = true;
    console.log('Back online - processing queues');

    // Process all queues
    this.queues.forEach((_, queueName) => {
      this.processQueue(queueName);
    });
  }

  private handleOffline(): void {
    this.isOnline = false;
    console.log('Gone offline - tasks will be queued');
  }

  // Handle failed tasks (could send to error reporting)
  private async handleFailedTask(task: SyncTask): Promise<void> {
    console.error('Task permanently failed:', task);

    // Could send to error reporting service
    // await this.reportError(task);

    // Store in failed tasks for manual review
    const failedTasks = JSON.parse(
      localStorage.getItem('failed-sync-tasks') || '[]'
    );
    failedTasks.push(task);
    localStorage.setItem('failed-sync-tasks', JSON.stringify(failedTasks));
  }

  // Persist queue to localStorage
  private async persistQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      localStorage.setItem(`sync-queue-${queueName}`, JSON.stringify(queue.tasks));
    }
  }

  // Load queues from localStorage
  async loadPersistedQueues(): Promise<void> {
    this.queues.forEach((queue, queueName) => {
      const stored = localStorage.getItem(`sync-queue-${queueName}`);
      if (stored) {
        try {
          queue.tasks = JSON.parse(stored);
        } catch (error) {
          console.error(`Failed to load queue ${queueName}:`, error);
        }
      }
    });
  }

  // Clean up old tasks
  async cleanupOldTasks(): Promise<void> {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();

    this.queues.forEach(queue => {
      queue.tasks = queue.tasks.filter(task => {
        return (now - task.timestamp) < maxAge;
      });
    });
  }

  // Get sync status
  getSyncStatus(): { [queueName: string]: { pending: number; lastProcessed: Date | null } } {
    const status: { [queueName: string]: { pending: number; lastProcessed: Date | null } } = {};

    this.queues.forEach((queue, name) => {
      status[name] = {
        pending: queue.tasks.length,
        lastProcessed: queue.lastProcessed,
      };
    });

    return status;
  }

  // Generate unique task ID
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncManager();

// Helper functions for common operations
export async function queueContactForm(formData: any): Promise<string> {
  return backgroundSync.addToQueue('contact-forms', 'contact-form', formData);
}

export async function queueNewsletterSignup(email: string, preferences?: any): Promise<string> {
  return backgroundSync.addToQueue('newsletter-signups', 'newsletter-signup', {
    email,
    preferences,
    timestamp: Date.now(),
  });
}

export async function queueAnalyticsEvent(eventType: string, eventData: any): Promise<string> {
  return backgroundSync.addToQueue('portfolio-analytics', 'analytics', {
    eventType,
    eventData,
    timestamp: Date.now(),
  });
}

export async function queueAdminOperation(endpoint: string, method: string, payload: any): Promise<string> {
  return backgroundSync.addToQueue('admin-operations', 'admin-operation', {
    endpoint,
    method,
    payload,
  });
}