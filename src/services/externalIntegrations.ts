'use client';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'crm' | 'ats' | 'email' | 'analytics' | 'storage' | 'notification' | 'payment';
  provider: string;
  enabled: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookUrl?: string;
    customFields?: Record<string, string>;
  };
  endpoints: {
    baseUrl: string;
    auth?: string;
    webhook?: string;
    testConnection?: string;
  };
  rateLimits: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
  dataMapping: Record<string, string>; // Map internal fields to external API fields
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    rateLimitRemaining?: number;
    rateLimitReset?: Date;
  };
}

export interface WebhookEvent {
  id: string;
  source: string;
  type: string;
  data: any;
  timestamp: Date;
  signature?: string;
  processed: boolean;
}

class ExternalAPIClient {
  private config: IntegrationConfig;
  private rateLimitTracker: Map<string, { count: number; resetTime: Date }> = new Map();

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: {
          code: 'INTEGRATION_DISABLED',
          message: `Integration ${this.config.name} is disabled`
        }
      };
    }

    try {
      // Check rate limits
      await this.checkRateLimit();

      // Prepare request
      const url = `${this.config.endpoints.baseUrl}${endpoint}`;
      const requestHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'MetricaDIP/1.0',
        ...this.getAuthHeaders(),
        ...headers
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(this.mapDataToExternal(data)) : undefined
      };

      // Execute request with retry logic
      const response = await this.executeWithRetry(url, requestOptions);
      
      // Track rate limits
      this.updateRateLimit(response);

      // Process response
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        success: true,
        data: this.mapDataFromExternal(responseData),
        metadata: {
          requestId: response.headers.get('x-request-id') || 'unknown',
          timestamp: new Date(),
          rateLimitRemaining: this.getRateLimitRemaining(response),
          rateLimitReset: this.getRateLimitReset(response)
        }
      };

    } catch (error) {
      console.error(`API request failed for ${this.config.name}:`, error);
      
      return {
        success: false,
        error: {
          code: 'API_REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        metadata: {
          requestId: 'failed',
          timestamp: new Date()
        }
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.config.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.credentials.apiKey}`;
    }
    
    if (this.config.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.credentials.accessToken}`;
    }

    // Provider-specific auth headers
    switch (this.config.provider) {
      case 'salesforce':
        if (this.config.credentials.accessToken) {
          headers['Authorization'] = `Bearer ${this.config.credentials.accessToken}`;
        }
        break;
      case 'hubspot':
        if (this.config.credentials.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.credentials.apiKey}`;
        }
        break;
      case 'sendgrid':
        if (this.config.credentials.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.credentials.apiKey}`;
        }
        break;
      case 'workday':
        // Workday uses different auth
        if (this.config.credentials.accessToken) {
          headers['Authorization'] = `Bearer ${this.config.credentials.accessToken}`;
        }
        break;
    }

    return headers;
  }

  private async checkRateLimit(): Promise<void> {
    const now = new Date();
    const trackingKey = `${this.config.id}_${now.getMinutes()}`;
    const tracker = this.rateLimitTracker.get(trackingKey);

    if (tracker) {
      if (tracker.count >= this.config.rateLimits.requestsPerMinute) {
        const waitTime = tracker.resetTime.getTime() - now.getTime();
        if (waitTime > 0) {
          console.warn(`Rate limit reached for ${this.config.name}, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } else {
        tracker.count++;
      }
    } else {
      this.rateLimitTracker.set(trackingKey, {
        count: 1,
        resetTime: new Date(now.getTime() + 60000) // Reset after 1 minute
      });
    }

    // Cleanup old tracking entries
    this.cleanupRateLimitTracker();
  }

  private cleanupRateLimitTracker(): void {
    const now = new Date();
    for (const [key, tracker] of this.rateLimitTracker.entries()) {
      if (tracker.resetTime < now) {
        this.rateLimitTracker.delete(key);
      }
    }
  }

  private updateRateLimit(response: Response): void {
    const remaining = this.getRateLimitRemaining(response);
    const reset = this.getRateLimitReset(response);
    
    if (remaining !== null && reset) {
      // Update internal tracking based on API response
      console.log(`Rate limit: ${remaining} remaining, resets at ${reset}`);
    }
  }

  private getRateLimitRemaining(response: Response): number | null {
    const header = response.headers.get('x-ratelimit-remaining') || 
                  response.headers.get('x-rate-limit-remaining');
    return header ? parseInt(header) : null;
  }

  private getRateLimitReset(response: Response): Date | null {
    const header = response.headers.get('x-ratelimit-reset') || 
                  response.headers.get('x-rate-limit-reset');
    return header ? new Date(parseInt(header) * 1000) : null;
  }

  private async executeWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryPolicy.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on client errors (4xx), only server errors (5xx) and network issues
        if (response.status >= 200 && response.status < 500) {
          return response;
        }
        
        if (attempt === this.config.retryPolicy.maxRetries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Wait before retry
        const delay = this.config.retryPolicy.initialDelayMs * 
                     Math.pow(this.config.retryPolicy.backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === this.config.retryPolicy.maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = this.config.retryPolicy.initialDelayMs * 
                     Math.pow(this.config.retryPolicy.backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private mapDataToExternal(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const mapped: any = {};
    for (const [internalField, externalField] of Object.entries(this.config.dataMapping)) {
      if (data[internalField] !== undefined) {
        mapped[externalField] = data[internalField];
      }
    }
    
    // Include unmapped fields
    for (const [key, value] of Object.entries(data)) {
      if (!this.config.dataMapping[key]) {
        mapped[key] = value;
      }
    }
    
    return mapped;
  }

  private mapDataFromExternal(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const mapped: any = {};
    const reverseMapping = Object.fromEntries(
      Object.entries(this.config.dataMapping).map(([k, v]) => [v, k])
    );
    
    for (const [externalField, internalField] of Object.entries(reverseMapping)) {
      if (data[externalField] !== undefined) {
        mapped[internalField] = data[externalField];
      }
    }
    
    // Include unmapped fields
    for (const [key, value] of Object.entries(data)) {
      if (!reverseMapping[key]) {
        mapped[key] = value;
      }
    }
    
    return mapped;
  }

  async testConnection(): Promise<APIResponse<{ status: string; version?: string }>> {
    if (!this.config.endpoints.testConnection) {
      return {
        success: false,
        error: {
          code: 'TEST_ENDPOINT_NOT_CONFIGURED',
          message: 'Test connection endpoint not configured'
        }
      };
    }

    return await this.makeRequest<{ status: string; version?: string }>(
      this.config.endpoints.testConnection,
      'GET'
    );
  }
}

// CRM Integration (Salesforce/HubSpot)
export class CRMIntegration extends ExternalAPIClient {
  async createContact(contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    source: string;
    interests?: string[];
  }): Promise<APIResponse<{ id: string }>> {
    return await this.makeRequest('/contacts', 'POST', contactData);
  }

  async updateContact(contactId: string, updates: Record<string, any>): Promise<APIResponse<any>> {
    return await this.makeRequest(`/contacts/${contactId}`, 'PUT', updates);
  }

  async getContact(contactId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/contacts/${contactId}`, 'GET');
  }

  async createOpportunity(opportunityData: {
    contactId: string;
    name: string;
    value: number;
    stage: string;
    source: string;
  }): Promise<APIResponse<{ id: string }>> {
    return await this.makeRequest('/opportunities', 'POST', opportunityData);
  }

  async trackEvent(eventData: {
    contactId: string;
    eventType: string;
    properties: Record<string, any>;
  }): Promise<APIResponse<any>> {
    return await this.makeRequest('/events', 'POST', eventData);
  }
}

// ATS Integration (Workday/BambooHR)
export class ATSIntegration extends ExternalAPIClient {
  async createCandidate(candidateData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    resumeUrl?: string;
    source: string;
  }): Promise<APIResponse<{ id: string }>> {
    return await this.makeRequest('/candidates', 'POST', candidateData);
  }

  async submitJobApplication(applicationData: {
    candidateId: string;
    jobId: string;
    coverLetter?: string;
    customFields?: Record<string, any>;
  }): Promise<APIResponse<{ applicationId: string }>> {
    return await this.makeRequest('/applications', 'POST', applicationData);
  }

  async getJobPostings(filters?: {
    department?: string;
    location?: string;
    status?: 'active' | 'inactive';
  }): Promise<APIResponse<any[]>> {
    const queryParams = new URLSearchParams(filters || {}).toString();
    return await this.makeRequest(`/jobs${queryParams ? '?' + queryParams : ''}`, 'GET');
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/applications/${applicationId}`, 'PUT', { status, notes });
  }

  async scheduleInterview(interviewData: {
    applicationId: string;
    type: 'phone' | 'video' | 'in-person';
    scheduledTime: Date;
    interviewers: string[];
    location?: string;
  }): Promise<APIResponse<{ interviewId: string }>> {
    return await this.makeRequest('/interviews', 'POST', interviewData);
  }
}

// Email Service Integration (SendGrid/Mailchimp)
export class EmailServiceIntegration extends ExternalAPIClient {
  async sendTransactionalEmail(emailData: {
    to: string;
    templateId: string;
    templateData: Record<string, any>;
    tags?: string[];
  }): Promise<APIResponse<{ messageId: string }>> {
    return await this.makeRequest('/mail/send', 'POST', {
      personalizations: [{
        to: [{ email: emailData.to }],
        dynamic_template_data: emailData.templateData
      }],
      template_id: emailData.templateId,
      tags: emailData.tags
    });
  }

  async addToList(listId: string, contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    customFields?: Record<string, any>;
  }): Promise<APIResponse<any>> {
    return await this.makeRequest(`/marketing/contacts`, 'PUT', {
      list_ids: [listId],
      contacts: [{
        email: contactData.email,
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        custom_fields: contactData.customFields
      }]
    });
  }

  async removeFromList(listId: string, email: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/marketing/lists/${listId}/contacts`, 'DELETE', {
      contact_ids: [email]
    });
  }

  async createCampaign(campaignData: {
    name: string;
    subject: string;
    htmlContent: string;
    listIds: string[];
    sendTime?: Date;
  }): Promise<APIResponse<{ campaignId: string }>> {
    return await this.makeRequest('/campaigns', 'POST', campaignData);
  }
}

// Analytics Integration (Google Analytics/Mixpanel)
export class AnalyticsIntegration extends ExternalAPIClient {
  async trackEvent(eventData: {
    eventName: string;
    userId?: string;
    properties: Record<string, any>;
    timestamp?: Date;
  }): Promise<APIResponse<any>> {
    return await this.makeRequest('/events', 'POST', eventData);
  }

  async trackPageView(pageData: {
    url: string;
    title: string;
    userId?: string;
    referrer?: string;
  }): Promise<APIResponse<any>> {
    return await this.makeRequest('/page-views', 'POST', pageData);
  }

  async createFunnel(funnelData: {
    name: string;
    steps: Array<{
      name: string;
      eventName: string;
      filters?: Record<string, any>;
    }>;
  }): Promise<APIResponse<{ funnelId: string }>> {
    return await this.makeRequest('/funnels', 'POST', funnelData);
  }
}

// Integration Manager
export class IntegrationManager {
  private integrations: Map<string, ExternalAPIClient> = new Map();
  private webhookEvents: WebhookEvent[] = [];

  constructor(configs: IntegrationConfig[]) {
    this.initializeIntegrations(configs);
  }

  private initializeIntegrations(configs: IntegrationConfig[]): void {
    configs.forEach(config => {
      if (!config.enabled) return;

      let integration: ExternalAPIClient;

      switch (config.type) {
        case 'crm':
          integration = new CRMIntegration(config);
          break;
        case 'ats':
          integration = new ATSIntegration(config);
          break;
        case 'email':
          integration = new EmailServiceIntegration(config);
          break;
        case 'analytics':
          integration = new AnalyticsIntegration(config);
          break;
        default:
          integration = new ExternalAPIClient(config);
      }

      this.integrations.set(config.id, integration);
    });
  }

  getIntegration<T extends ExternalAPIClient = ExternalAPIClient>(id: string): T | null {
    return this.integrations.get(id) as T || null;
  }

  async testAllConnections(): Promise<Record<string, APIResponse<any>>> {
    const results: Record<string, APIResponse<any>> = {};
    
    for (const [id, integration] of this.integrations.entries()) {
      try {
        results[id] = await integration.testConnection();
      } catch (error) {
        results[id] = {
          success: false,
          error: {
            code: 'CONNECTION_TEST_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    }
    
    return results;
  }

  // Webhook handling
  async handleWebhook(source: string, payload: any, signature?: string): Promise<boolean> {
    try {
      // Verify webhook signature (implementation depends on provider)
      if (!this.verifyWebhookSignature(source, payload, signature)) {
        console.warn(`Invalid webhook signature from ${source}`);
        return false;
      }

      const webhookEvent: WebhookEvent = {
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source,
        type: payload.type || 'unknown',
        data: payload,
        timestamp: new Date(),
        signature,
        processed: false
      };

      this.webhookEvents.push(webhookEvent);
      
      // Process webhook based on source and type
      await this.processWebhookEvent(webhookEvent);
      
      webhookEvent.processed = true;
      return true;

    } catch (error) {
      console.error(`Error handling webhook from ${source}:`, error);
      return false;
    }
  }

  private verifyWebhookSignature(source: string, payload: any, signature?: string): boolean {
    // Implementation would vary by provider
    // For now, return true if signature exists
    return !!signature;
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    console.log(`Processing webhook event: ${event.type} from ${event.source}`);
    
    switch (event.source) {
      case 'crm':
        await this.processCRMWebhook(event);
        break;
      case 'ats':
        await this.processATSWebhook(event);
        break;
      case 'email':
        await this.processEmailWebhook(event);
        break;
      default:
        console.log(`No processor for webhook source: ${event.source}`);
    }
  }

  private async processCRMWebhook(event: WebhookEvent): Promise<void> {
    // Handle CRM events (contact updates, opportunity changes, etc.)
    switch (event.type) {
      case 'contact.updated':
        console.log('CRM contact updated:', event.data);
        break;
      case 'opportunity.created':
        console.log('CRM opportunity created:', event.data);
        break;
    }
  }

  private async processATSWebhook(event: WebhookEvent): Promise<void> {
    // Handle ATS events (application status changes, interview scheduling, etc.)
    switch (event.type) {
      case 'application.status_changed':
        console.log('Application status changed:', event.data);
        break;
      case 'interview.scheduled':
        console.log('Interview scheduled:', event.data);
        break;
    }
  }

  private async processEmailWebhook(event: WebhookEvent): Promise<void> {
    // Handle email events (opens, clicks, bounces, etc.)
    switch (event.type) {
      case 'email.opened':
        console.log('Email opened:', event.data);
        break;
      case 'email.clicked':
        console.log('Email clicked:', event.data);
        break;
    }
  }

  getWebhookEvents(filters?: { source?: string; type?: string; processed?: boolean }): WebhookEvent[] {
    if (!filters) return this.webhookEvents;

    return this.webhookEvents.filter(event => {
      if (filters.source && event.source !== filters.source) return false;
      if (filters.type && event.type !== filters.type) return false;
      if (filters.processed !== undefined && event.processed !== filters.processed) return false;
      return true;
    });
  }
}

// Predefined integration configurations
export const DEFAULT_INTEGRATION_CONFIGS: IntegrationConfig[] = [
  {
    id: 'hubspot_crm',
    name: 'HubSpot CRM',
    type: 'crm',
    provider: 'hubspot',
    enabled: false, // Would be enabled with proper credentials
    credentials: {
      apiKey: process.env.HUBSPOT_API_KEY
    },
    endpoints: {
      baseUrl: 'https://api.hubapi.com',
      testConnection: '/contacts/v1/lists/all/contacts/all'
    },
    rateLimits: {
      requestsPerMinute: 100,
      burstLimit: 10
    },
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000
    },
    dataMapping: {
      email: 'email',
      firstName: 'firstname',
      lastName: 'lastname',
      company: 'company',
      phone: 'phone'
    }
  },
  {
    id: 'sendgrid_email',
    name: 'SendGrid Email Service',
    type: 'email',
    provider: 'sendgrid',
    enabled: false,
    credentials: {
      apiKey: process.env.SENDGRID_API_KEY
    },
    endpoints: {
      baseUrl: 'https://api.sendgrid.com/v3',
      testConnection: '/user/profile'
    },
    rateLimits: {
      requestsPerMinute: 600,
      burstLimit: 100
    },
    retryPolicy: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelayMs: 500
    },
    dataMapping: {
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name'
    }
  },
  {
    id: 'workday_ats',
    name: 'Workday ATS',
    type: 'ats',
    provider: 'workday',
    enabled: false,
    credentials: {
      accessToken: process.env.WORKDAY_ACCESS_TOKEN
    },
    endpoints: {
      baseUrl: 'https://wd2-impl-services1.workday.com/ccx/service/customreport2',
      testConnection: '/health'
    },
    rateLimits: {
      requestsPerMinute: 60,
      burstLimit: 5
    },
    retryPolicy: {
      maxRetries: 2,
      backoffMultiplier: 2,
      initialDelayMs: 2000
    },
    dataMapping: {
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      phone: 'phone'
    }
  }
];

// Usage example
export function createIntegrationManager(): IntegrationManager {
  return new IntegrationManager(DEFAULT_INTEGRATION_CONFIGS);
}

// Helper function to test integrations
export async function testIntegrations(): Promise<void> {
  const manager = createIntegrationManager();
  const results = await manager.testAllConnections();
  
  console.log('Integration Test Results:');
  Object.entries(results).forEach(([id, result]) => {
    console.log(`${id}: ${result.success ? '✅ Connected' : '❌ Failed'}`);
    if (!result.success) {
      console.log(`  Error: ${result.error?.message}`);
    }
  });
}