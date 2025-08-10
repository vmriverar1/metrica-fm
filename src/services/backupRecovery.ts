'use client';

export interface BackupConfig {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential';
  scope: 'all' | 'user_data' | 'system_config' | 'analytics' | 'custom';
  schedule: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6, for weekly backups
    dayOfMonth?: number; // 1-31, for monthly backups
  };
  retention: {
    maxBackups: number;
    maxAgeDays: number;
    compressionEnabled: boolean;
  };
  storage: {
    location: 'local' | 's3' | 'gcs' | 'azure';
    path: string;
    encryption: boolean;
    encryptionKey?: string;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    channels: Array<{
      type: 'email' | 'webhook' | 'slack';
      target: string;
    }>;
  };
  customFilters?: {
    includePaths: string[];
    excludePaths: string[];
    includeKeys: string[];
    excludeKeys: string[];
  };
}

export interface BackupRecord {
  id: string;
  configId: string;
  type: BackupConfig['type'];
  scope: BackupConfig['scope'];
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'corrupted' | 'expired';
  size: number; // bytes
  fileCount: number;
  storageLocation: string;
  checksum: string;
  metadata: {
    version: string;
    environment: string;
    userAgent: string;
    dataVersion: number;
  };
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  verificationStatus?: {
    verified: boolean;
    verifiedAt?: Date;
    integrityCheck: boolean;
    restorabilityCheck: boolean;
  };
}

export interface RestoreOptions {
  backupId: string;
  targetLocation?: string;
  overwriteExisting: boolean;
  selectiveRestore?: {
    includePaths: string[];
    excludePaths: string[];
    includeKeys: string[];
    excludeKeys: string[];
  };
  dryRun: boolean;
  restorePoint?: Date;
}

export interface RestoreRecord {
  id: string;
  backupId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  restoredItems: number;
  totalItems: number;
  targetLocation: string;
  options: RestoreOptions;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  verification?: {
    dataIntegrity: boolean;
    functionalTest: boolean;
    verifiedAt: Date;
  };
}

export interface BackupData {
  metadata: {
    version: string;
    timestamp: Date;
    type: BackupConfig['type'];
    scope: BackupConfig['scope'];
    environment: string;
    checksum: string;
  };
  userData: {
    profiles: Record<string, any>;
    preferences: Record<string, any>;
    sessions: Record<string, any>;
    favorites: Record<string, any>;
  };
  systemConfig: {
    integrationConfigs: Record<string, any>;
    abTestConfigs: Record<string, any>;
    notificationSettings: Record<string, any>;
    securitySettings: Record<string, any>;
  };
  analyticsData: {
    events: Array<any>;
    metrics: Record<string, any>;
    logs: Array<any>;
    reports: Record<string, any>;
  };
  customData?: Record<string, any>;
}

class DataCollector {
  static async collectUserData(): Promise<BackupData['userData']> {
    const userData: BackupData['userData'] = {
      profiles: {},
      preferences: {},
      sessions: {},
      favorites: {}
    };

    try {
      // Collect user profiles
      const profileKeys = this.getStorageKeys('profile_');
      for (const key of profileKeys) {
        const data = localStorage.getItem(key);
        if (data) userData.profiles[key] = JSON.parse(data);
      }

      // Collect user preferences
      const preferenceKeys = this.getStorageKeys('preferences_');
      for (const key of preferenceKeys) {
        const data = localStorage.getItem(key);
        if (data) userData.preferences[key] = JSON.parse(data);
      }

      // Collect session data
      const sessionKeys = this.getStorageKeys('session_');
      for (const key of sessionKeys) {
        const data = sessionStorage.getItem(key);
        if (data) userData.sessions[key] = JSON.parse(data);
      }

      // Collect favorites
      const favoriteKeys = this.getStorageKeys('favorites_');
      for (const key of favoriteKeys) {
        const data = localStorage.getItem(key);
        if (data) userData.favorites[key] = JSON.parse(data);
      }

    } catch (error) {
      console.error('Error collecting user data:', error);
      throw new Error('Failed to collect user data for backup');
    }

    return userData;
  }

  static async collectSystemConfig(): Promise<BackupData['systemConfig']> {
    const systemConfig: BackupData['systemConfig'] = {
      integrationConfigs: {},
      abTestConfigs: {},
      notificationSettings: {},
      securitySettings: {}
    };

    try {
      // Collect integration configurations
      const integrationData = localStorage.getItem('integration_configs');
      if (integrationData) {
        systemConfig.integrationConfigs = JSON.parse(integrationData);
      }

      // Collect A/B test configurations
      const abTestData = localStorage.getItem('ab_testing_data');
      if (abTestData) {
        systemConfig.abTestConfigs = JSON.parse(abTestData);
      }

      // Collect notification settings
      const notificationKeys = this.getStorageKeys('notification_');
      for (const key of notificationKeys) {
        const data = localStorage.getItem(key);
        if (data) systemConfig.notificationSettings[key] = JSON.parse(data);
      }

      // Collect security settings
      const securityData = localStorage.getItem('security_settings');
      if (securityData) {
        systemConfig.securitySettings = JSON.parse(securityData);
      }

    } catch (error) {
      console.error('Error collecting system config:', error);
      throw new Error('Failed to collect system configuration for backup');
    }

    return systemConfig;
  }

  static async collectAnalyticsData(): Promise<BackupData['analyticsData']> {
    const analyticsData: BackupData['analyticsData'] = {
      events: [],
      metrics: {},
      logs: [],
      reports: {}
    };

    try {
      // Collect analytics events
      const eventsData = localStorage.getItem('analytics_events');
      if (eventsData) {
        analyticsData.events = JSON.parse(eventsData);
      }

      // Collect metrics data
      const metricsKeys = this.getStorageKeys('metrics_');
      for (const key of metricsKeys) {
        const data = localStorage.getItem(key);
        if (data) analyticsData.metrics[key] = JSON.parse(data);
      }

      // Collect logs (limited to recent logs)
      const logsData = localStorage.getItem('application_logs');
      if (logsData) {
        const logs = JSON.parse(logsData);
        // Keep only last 1000 logs to limit backup size
        analyticsData.logs = logs.slice(-1000);
      }

      // Collect reports
      const reportKeys = this.getStorageKeys('report_');
      for (const key of reportKeys) {
        const data = localStorage.getItem(key);
        if (data) analyticsData.reports[key] = JSON.parse(data);
      }

    } catch (error) {
      console.error('Error collecting analytics data:', error);
      throw new Error('Failed to collect analytics data for backup');
    }

    return analyticsData;
  }

  static async collectCustomData(filters?: BackupConfig['customFilters']): Promise<Record<string, any>> {
    const customData: Record<string, any> = {};

    try {
      if (filters?.includeKeys) {
        // Collect specific keys
        for (const key of filters.includeKeys) {
          const data = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (data) customData[key] = JSON.parse(data);
        }
      }

      if (filters?.includePaths) {
        // Collect keys matching patterns
        for (const pattern of filters.includePaths) {
          const keys = this.getStorageKeys(pattern);
          for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) customData[key] = JSON.parse(data);
          }
        }
      }

      // Apply exclusions
      if (filters?.excludeKeys) {
        for (const key of filters.excludeKeys) {
          delete customData[key];
        }
      }

    } catch (error) {
      console.error('Error collecting custom data:', error);
      throw new Error('Failed to collect custom data for backup');
    }

    return customData;
  }

  private static getStorageKeys(prefix: string): string[] {
    const keys: string[] = [];
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    return keys;
  }
}

class BackupCompression {
  static async compress(data: BackupData): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      
      // In a real implementation, use proper compression library
      // For demo, we'll use base64 encoding as a placeholder
      const compressed = btoa(unescape(encodeURIComponent(jsonString)));
      
      console.log(`Data compressed: ${jsonString.length} -> ${compressed.length} bytes`);
      return compressed;
    } catch (error) {
      console.error('Compression failed:', error);
      throw new Error('Failed to compress backup data');
    }
  }

  static async decompress(compressedData: string): Promise<BackupData> {
    try {
      // In a real implementation, use proper compression library
      const jsonString = decodeURIComponent(escape(atob(compressedData)));
      const data = JSON.parse(jsonString);
      
      console.log(`Data decompressed: ${compressedData.length} -> ${jsonString.length} bytes`);
      return data as BackupData;
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Failed to decompress backup data');
    }
  }
}

class BackupEncryption {
  static async encrypt(data: string, key: string): Promise<string> {
    try {
      // In a real implementation, use proper encryption (AES-256)
      // For demo, we'll use a simple XOR cipher
      const encrypted = this.xorEncrypt(data, key);
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt backup data');
    }
  }

  static async decrypt(encryptedData: string, key: string): Promise<string> {
    try {
      const data = atob(encryptedData);
      const decrypted = this.xorEncrypt(data, key); // XOR is symmetric
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt backup data');
    }
  }

  private static xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }
}

export class BackupManager {
  private configs: Map<string, BackupConfig> = new Map();
  private backupRecords: Map<string, BackupRecord> = new Map();
  private restoreRecords: Map<string, RestoreRecord> = new Map();
  private runningBackups: Set<string> = new Set();
  private scheduledBackups: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadFromStorage();
    this.initializeSchedules();
  }

  // Configuration Management
  createBackupConfig(config: Omit<BackupConfig, 'id'>): string {
    const configId = `backup_config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullConfig: BackupConfig = {
      ...config,
      id: configId
    };

    this.configs.set(configId, fullConfig);
    this.saveToStorage();

    if (fullConfig.schedule.enabled) {
      this.scheduleBackup(configId);
    }

    console.log(`Backup configuration created: ${fullConfig.name}`);
    return configId;
  }

  updateBackupConfig(configId: string, updates: Partial<BackupConfig>): boolean {
    const config = this.configs.get(configId);
    if (!config) return false;

    const updatedConfig = { ...config, ...updates };
    this.configs.set(configId, updatedConfig);
    this.saveToStorage();

    // Reschedule if schedule changed
    if (updates.schedule) {
      this.unscheduleBackup(configId);
      if (updatedConfig.schedule.enabled) {
        this.scheduleBackup(configId);
      }
    }

    console.log(`Backup configuration updated: ${updatedConfig.name}`);
    return true;
  }

  deleteBackupConfig(configId: string): boolean {
    const config = this.configs.get(configId);
    if (!config) return false;

    // Cancel any running backups
    if (this.runningBackups.has(configId)) {
      console.warn(`Cannot delete config ${configId}: backup is running`);
      return false;
    }

    this.unscheduleBackup(configId);
    this.configs.delete(configId);
    this.saveToStorage();

    console.log(`Backup configuration deleted: ${config.name}`);
    return true;
  }

  // Backup Execution
  async executeBackup(configId: string, options?: {
    force?: boolean;
    type?: BackupConfig['type'];
  }): Promise<string> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Backup configuration not found: ${configId}`);
    }

    if (this.runningBackups.has(configId) && !options?.force) {
      throw new Error(`Backup is already running for config: ${configId}`);
    }

    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const backupRecord: BackupRecord = {
      id: backupId,
      configId,
      type: options?.type || config.type,
      scope: config.scope,
      startTime: new Date(),
      status: 'running',
      size: 0,
      fileCount: 0,
      storageLocation: '',
      checksum: '',
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        userAgent: navigator.userAgent,
        dataVersion: Date.now()
      }
    };

    this.backupRecords.set(backupId, backupRecord);
    this.runningBackups.add(configId);

    try {
      console.log(`Starting backup: ${config.name} (${backupRecord.type})`);

      // Collect data based on scope
      const backupData = await this.collectBackupData(config, backupRecord.type);

      // Calculate checksum
      const dataString = JSON.stringify(backupData);
      backupRecord.checksum = await this.calculateChecksum(dataString);

      // Compress if enabled
      let finalData = dataString;
      if (config.retention.compressionEnabled) {
        finalData = await BackupCompression.compress(backupData);
      }

      // Encrypt if enabled
      if (config.storage.encryption && config.storage.encryptionKey) {
        finalData = await BackupEncryption.encrypt(finalData, config.storage.encryptionKey);
      }

      // Store backup
      const storagePath = await this.storeBackup(config, backupId, finalData);
      
      // Update record
      backupRecord.endTime = new Date();
      backupRecord.status = 'completed';
      backupRecord.size = finalData.length;
      backupRecord.fileCount = this.countDataItems(backupData);
      backupRecord.storageLocation = storagePath;

      this.backupRecords.set(backupId, backupRecord);
      this.runningBackups.delete(configId);

      // Clean up old backups
      await this.cleanupOldBackups(configId);

      // Send success notification
      if (config.notifications.onSuccess) {
        await this.sendNotification(config, 'success', backupRecord);
      }

      console.log(`Backup completed: ${config.name} (${backupRecord.size} bytes)`);
      return backupId;

    } catch (error) {
      backupRecord.endTime = new Date();
      backupRecord.status = 'failed';
      backupRecord.error = {
        code: 'BACKUP_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };

      this.backupRecords.set(backupId, backupRecord);
      this.runningBackups.delete(configId);

      // Send failure notification
      if (config.notifications.onFailure) {
        await this.sendNotification(config, 'failure', backupRecord);
      }

      console.error(`Backup failed: ${config.name}`, error);
      throw error;
    }
  }

  private async collectBackupData(config: BackupConfig, type: BackupConfig['type']): Promise<BackupData> {
    const backupData: BackupData = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date(),
        type,
        scope: config.scope,
        environment: process.env.NODE_ENV || 'development',
        checksum: ''
      },
      userData: { profiles: {}, preferences: {}, sessions: {}, favorites: {} },
      systemConfig: { integrationConfigs: {}, abTestConfigs: {}, notificationSettings: {}, securitySettings: {} },
      analyticsData: { events: [], metrics: {}, logs: [], reports: {} },
      customData: {}
    };

    // Collect data based on scope
    switch (config.scope) {
      case 'all':
        backupData.userData = await DataCollector.collectUserData();
        backupData.systemConfig = await DataCollector.collectSystemConfig();
        backupData.analyticsData = await DataCollector.collectAnalyticsData();
        backupData.customData = await DataCollector.collectCustomData(config.customFilters);
        break;
      case 'user_data':
        backupData.userData = await DataCollector.collectUserData();
        break;
      case 'system_config':
        backupData.systemConfig = await DataCollector.collectSystemConfig();
        break;
      case 'analytics':
        backupData.analyticsData = await DataCollector.collectAnalyticsData();
        break;
      case 'custom':
        backupData.customData = await DataCollector.collectCustomData(config.customFilters);
        break;
    }

    return backupData;
  }

  private async storeBackup(config: BackupConfig, backupId: string, data: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${backupId}-${timestamp}.json`;
    const path = `${config.storage.path}/${filename}`;

    switch (config.storage.location) {
      case 'local':
        // Store in localStorage (limited by browser storage limits)
        localStorage.setItem(`backup_${backupId}`, data);
        return `localStorage://backup_${backupId}`;
        
      case 's3':
      case 'gcs':
      case 'azure':
        // In production, integrate with cloud storage APIs
        console.log(`Would upload to ${config.storage.location}: ${path}`);
        return path;
        
      default:
        throw new Error(`Unsupported storage location: ${config.storage.location}`);
    }
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simple hash function for demo (use crypto.subtle in production)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private countDataItems(data: BackupData): number {
    let count = 0;
    
    // Count user data items
    Object.values(data.userData).forEach(category => {
      count += Object.keys(category).length;
    });
    
    // Count system config items
    Object.values(data.systemConfig).forEach(category => {
      count += Object.keys(category).length;
    });
    
    // Count analytics data items
    count += data.analyticsData.events.length;
    count += Object.keys(data.analyticsData.metrics).length;
    count += data.analyticsData.logs.length;
    count += Object.keys(data.analyticsData.reports).length;
    
    // Count custom data items
    if (data.customData) {
      count += Object.keys(data.customData).length;
    }
    
    return count;
  }

  // Restore Operations
  async executeRestore(options: RestoreOptions): Promise<string> {
    const backupRecord = this.backupRecords.get(options.backupId);
    if (!backupRecord) {
      throw new Error(`Backup not found: ${options.backupId}`);
    }

    if (backupRecord.status !== 'completed') {
      throw new Error(`Cannot restore from incomplete backup: ${backupRecord.status}`);
    }

    const restoreId = `restore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const restoreRecord: RestoreRecord = {
      id: restoreId,
      backupId: options.backupId,
      startTime: new Date(),
      status: 'running',
      restoredItems: 0,
      totalItems: backupRecord.fileCount,
      targetLocation: options.targetLocation || 'current',
      options
    };

    this.restoreRecords.set(restoreId, restoreRecord);

    try {
      console.log(`Starting restore from backup: ${options.backupId}`);

      if (options.dryRun) {
        console.log('Dry run mode - no actual restoration will occur');
      }

      // Load backup data
      const backupData = await this.loadBackupData(backupRecord);

      // Verify data integrity
      const checksumValid = await this.verifyChecksum(backupData, backupRecord.checksum);
      if (!checksumValid) {
        throw new Error('Backup data integrity check failed');
      }

      // Perform restoration
      if (!options.dryRun) {
        await this.restoreData(backupData, options);
      }

      // Update restore record
      restoreRecord.endTime = new Date();
      restoreRecord.status = 'completed';
      restoreRecord.restoredItems = backupRecord.fileCount;

      // Perform verification if not dry run
      if (!options.dryRun) {
        restoreRecord.verification = await this.verifyRestore(backupData);
      }

      this.restoreRecords.set(restoreId, restoreRecord);

      console.log(`Restore completed: ${restoreId}`);
      return restoreId;

    } catch (error) {
      restoreRecord.endTime = new Date();
      restoreRecord.status = 'failed';
      restoreRecord.error = {
        code: 'RESTORE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };

      this.restoreRecords.set(restoreId, restoreRecord);

      console.error(`Restore failed: ${restoreId}`, error);
      throw error;
    }
  }

  private async loadBackupData(backupRecord: BackupRecord): Promise<BackupData> {
    let rawData: string;

    if (backupRecord.storageLocation.startsWith('localStorage://')) {
      const key = backupRecord.storageLocation.replace('localStorage://', '');
      const stored = localStorage.getItem(key);
      if (!stored) {
        throw new Error('Backup data not found in local storage');
      }
      rawData = stored;
    } else {
      throw new Error('External storage restoration not implemented');
    }

    // Decrypt if needed
    const config = this.configs.get(backupRecord.configId);
    if (config?.storage.encryption && config.storage.encryptionKey) {
      rawData = await BackupEncryption.decrypt(rawData, config.storage.encryptionKey);
    }

    // Decompress if needed
    if (config?.retention.compressionEnabled) {
      return await BackupCompression.decompress(rawData);
    } else {
      return JSON.parse(rawData);
    }
  }

  private async restoreData(backupData: BackupData, options: RestoreOptions): Promise<void> {
    console.log('Restoring data...');

    // Restore user data
    if (backupData.userData) {
      for (const [key, value] of Object.entries(backupData.userData.profiles)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }

      for (const [key, value] of Object.entries(backupData.userData.preferences)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }

      for (const [key, value] of Object.entries(backupData.userData.sessions)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, JSON.stringify(value));
          }
        }
      }

      for (const [key, value] of Object.entries(backupData.userData.favorites)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }
    }

    // Restore system config
    if (backupData.systemConfig) {
      for (const [category, data] of Object.entries(backupData.systemConfig)) {
        if (data && Object.keys(data).length > 0) {
          const key = `system_${category}`;
          if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
            if (options.overwriteExisting || !localStorage.getItem(key)) {
              localStorage.setItem(key, JSON.stringify(data));
            }
          }
        }
      }
    }

    // Restore analytics data
    if (backupData.analyticsData) {
      if (backupData.analyticsData.events.length > 0) {
        const key = 'analytics_events';
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(backupData.analyticsData.events));
          }
        }
      }

      for (const [key, value] of Object.entries(backupData.analyticsData.metrics)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }

      if (backupData.analyticsData.logs.length > 0) {
        const key = 'application_logs';
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(backupData.analyticsData.logs));
          }
        }
      }

      for (const [key, value] of Object.entries(backupData.analyticsData.reports)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }
    }

    // Restore custom data
    if (backupData.customData) {
      for (const [key, value] of Object.entries(backupData.customData)) {
        if (!options.selectiveRestore || this.shouldRestoreKey(key, options.selectiveRestore)) {
          if (options.overwriteExisting || !localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }
    }

    console.log('Data restoration completed');
  }

  private shouldRestoreKey(key: string, selective: RestoreOptions['selectiveRestore']): boolean {
    if (!selective) return true;

    // Check exclusions first
    if (selective.excludeKeys?.includes(key)) return false;
    if (selective.excludePaths?.some(pattern => key.includes(pattern))) return false;

    // Check inclusions
    if (selective.includeKeys?.length && !selective.includeKeys.includes(key)) return false;
    if (selective.includePaths?.length && !selective.includePaths.some(pattern => key.includes(pattern))) return false;

    return true;
  }

  private async verifyChecksum(data: BackupData, expectedChecksum: string): Promise<boolean> {
    const dataString = JSON.stringify(data);
    const actualChecksum = await this.calculateChecksum(dataString);
    return actualChecksum === expectedChecksum;
  }

  private async verifyRestore(backupData: BackupData): Promise<RestoreRecord['verification']> {
    // Simplified verification - in production, would be more comprehensive
    let dataIntegrity = true;
    let functionalTest = true;

    try {
      // Check that critical data was restored
      const criticalKeys = ['user_profile', 'system_config', 'integration_configs'];
      for (const key of criticalKeys) {
        if (!localStorage.getItem(key)) {
          dataIntegrity = false;
          break;
        }
      }

      // Functional test - try to parse restored data
      try {
        const testKey = localStorage.key(0);
        if (testKey) {
          const testData = localStorage.getItem(testKey);
          if (testData) JSON.parse(testData);
        }
      } catch {
        functionalTest = false;
      }

    } catch (error) {
      dataIntegrity = false;
      functionalTest = false;
    }

    return {
      dataIntegrity,
      functionalTest,
      verifiedAt: new Date()
    };
  }

  // Scheduling
  private scheduleBackup(configId: string): void {
    const config = this.configs.get(configId);
    if (!config || !config.schedule.enabled) return;

    // Clear existing schedule
    this.unscheduleBackup(configId);

    let intervalMs: number;
    switch (config.schedule.frequency) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000;
        break;
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        return;
    }

    const timeout = setInterval(async () => {
      try {
        await this.executeBackup(configId);
      } catch (error) {
        console.error(`Scheduled backup failed for config ${configId}:`, error);
      }
    }, intervalMs);

    this.scheduledBackups.set(configId, timeout);
    console.log(`Backup scheduled: ${config.name} (${config.schedule.frequency})`);
  }

  private unscheduleBackup(configId: string): void {
    const timeout = this.scheduledBackups.get(configId);
    if (timeout) {
      clearInterval(timeout);
      this.scheduledBackups.delete(configId);
    }
  }

  private initializeSchedules(): void {
    for (const config of this.configs.values()) {
      if (config.schedule.enabled) {
        this.scheduleBackup(config.id);
      }
    }
  }

  // Cleanup
  private async cleanupOldBackups(configId: string): Promise<void> {
    const config = this.configs.get(configId);
    if (!config) return;

    const configBackups = Array.from(this.backupRecords.values())
      .filter(b => b.configId === configId && b.status === 'completed')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // Remove backups exceeding max count
    if (configBackups.length > config.retention.maxBackups) {
      const backupsToDelete = configBackups.slice(config.retention.maxBackups);
      for (const backup of backupsToDelete) {
        await this.deleteBackup(backup.id);
      }
    }

    // Remove backups exceeding max age
    const cutoffDate = new Date(Date.now() - config.retention.maxAgeDays * 24 * 60 * 60 * 1000);
    const expiredBackups = configBackups.filter(b => b.startTime < cutoffDate);
    for (const backup of expiredBackups) {
      await this.deleteBackup(backup.id);
    }
  }

  private async deleteBackup(backupId: string): Promise<void> {
    const backup = this.backupRecords.get(backupId);
    if (!backup) return;

    try {
      // Delete from storage
      if (backup.storageLocation.startsWith('localStorage://')) {
        const key = backup.storageLocation.replace('localStorage://', '');
        localStorage.removeItem(key);
      }

      // Remove from records
      this.backupRecords.delete(backupId);
      console.log(`Deleted old backup: ${backupId}`);

    } catch (error) {
      console.error(`Failed to delete backup ${backupId}:`, error);
    }
  }

  // Notifications
  private async sendNotification(
    config: BackupConfig,
    type: 'success' | 'failure',
    record: BackupRecord
  ): Promise<void> {
    const message = type === 'success' 
      ? `Backup completed successfully: ${config.name} (${record.size} bytes)`
      : `Backup failed: ${config.name} - ${record.error?.message}`;

    for (const channel of config.notifications.channels) {
      try {
        switch (channel.type) {
          case 'email':
            console.log(`Email notification: ${message} -> ${channel.target}`);
            break;
          case 'webhook':
            await fetch(channel.target, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, message, backup: record })
            });
            break;
          case 'slack':
            console.log(`Slack notification: ${message} -> ${channel.target}`);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} notification:`, error);
      }
    }
  }

  // Storage
  private saveToStorage(): void {
    try {
      const data = {
        configs: Object.fromEntries(this.configs),
        backupRecords: Object.fromEntries(this.backupRecords),
        restoreRecords: Object.fromEntries(this.restoreRecords)
      };
      localStorage.setItem('backup_manager_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save backup manager data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('backup_manager_data');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      if (data.configs) {
        this.configs = new Map(Object.entries(data.configs));
      }
      
      if (data.backupRecords) {
        this.backupRecords = new Map(
          Object.entries(data.backupRecords).map(([id, record]: [string, any]) => [
            id,
            {
              ...record,
              startTime: new Date(record.startTime),
              endTime: record.endTime ? new Date(record.endTime) : undefined
            }
          ])
        );
      }
      
      if (data.restoreRecords) {
        this.restoreRecords = new Map(
          Object.entries(data.restoreRecords).map(([id, record]: [string, any]) => [
            id,
            {
              ...record,
              startTime: new Date(record.startTime),
              endTime: record.endTime ? new Date(record.endTime) : undefined
            }
          ])
        );
      }

    } catch (error) {
      console.error('Failed to load backup manager data:', error);
    }
  }

  // Public API
  getConfigs(): BackupConfig[] {
    return Array.from(this.configs.values());
  }

  getConfig(configId: string): BackupConfig | null {
    return this.configs.get(configId) || null;
  }

  getBackupRecords(configId?: string): BackupRecord[] {
    const records = Array.from(this.backupRecords.values());
    return configId 
      ? records.filter(r => r.configId === configId)
      : records;
  }

  getRestoreRecords(): RestoreRecord[] {
    return Array.from(this.restoreRecords.values());
  }

  getRunningBackups(): string[] {
    return Array.from(this.runningBackups);
  }
}

// Global backup manager instance
export const backupManager = new BackupManager();

// Helper function to create common backup configurations
export function createCommonBackupConfigs(): void {
  const manager = backupManager;

  // Daily full backup
  manager.createBackupConfig({
    name: 'Daily Full Backup',
    description: 'Complete daily backup of all user and system data',
    type: 'full',
    scope: 'all',
    schedule: {
      enabled: true,
      frequency: 'daily',
      time: '02:00'
    },
    retention: {
      maxBackups: 7,
      maxAgeDays: 30,
      compressionEnabled: true
    },
    storage: {
      location: 'local',
      path: '/backups/daily',
      encryption: true,
      encryptionKey: 'default-backup-key-change-in-production'
    },
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: [
        { type: 'email', target: 'admin@metricadip.com' }
      ]
    }
  });

  // Hourly user data backup
  manager.createBackupConfig({
    name: 'Hourly User Data Backup',
    description: 'Frequent backup of user profiles and preferences',
    type: 'incremental',
    scope: 'user_data',
    schedule: {
      enabled: true,
      frequency: 'hourly'
    },
    retention: {
      maxBackups: 24,
      maxAgeDays: 7,
      compressionEnabled: true
    },
    storage: {
      location: 'local',
      path: '/backups/hourly',
      encryption: false
    },
    notifications: {
      onSuccess: false,
      onFailure: true,
      channels: [
        { type: 'webhook', target: '/api/backup-alerts' }
      ]
    }
  });

  // Weekly system config backup
  manager.createBackupConfig({
    name: 'Weekly System Config Backup',
    description: 'Weekly backup of system configurations and settings',
    type: 'full',
    scope: 'system_config',
    schedule: {
      enabled: true,
      frequency: 'weekly',
      time: '01:00'
    },
    retention: {
      maxBackups: 4,
      maxAgeDays: 90,
      compressionEnabled: true
    },
    storage: {
      location: 'local',
      path: '/backups/weekly',
      encryption: true,
      encryptionKey: 'system-config-backup-key'
    },
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: [
        { type: 'email', target: 'ops@metricadip.com' },
        { type: 'slack', target: '#ops-alerts' }
      ]
    }
  });

  console.log('Common backup configurations created successfully');
}