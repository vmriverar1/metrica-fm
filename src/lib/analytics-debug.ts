/**
 * Analytics Debug Utility
 *
 * Helper functions to debug and monitor Analytics events in development
 */

type AnalyticsEvent = {
  timestamp: Date;
  eventName: string;
  params?: Record<string, any>;
  status: 'success' | 'error' | 'pending';
  error?: string;
};

class AnalyticsDebugger {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 50; // Keep last 50 events
  private isEnabled = false;

  constructor() {
    // Enable in development or when debug flag is set
    if (typeof window !== 'undefined') {
      this.isEnabled =
        process.env.NODE_ENV === 'development' ||
        localStorage.getItem('analytics_debug') === 'true';

      // Expose debugger to window for console access
      (window as any).__analyticsDebug = this;
    }
  }

  /**
   * Enable debug mode
   */
  enable() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_debug', 'true');
    }
    console.log('[Analytics Debug] Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable() {
    this.isEnabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_debug');
    }
    console.log('[Analytics Debug] Debug mode disabled');
  }

  /**
   * Log an analytics event
   */
  log(eventName: string, params?: Record<string, any>, status: AnalyticsEvent['status'] = 'success', error?: string) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      timestamp: new Date(),
      eventName,
      params,
      status,
      error
    };

    this.events.push(event);

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Console log with nice formatting
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
    console.group(`${emoji} [Analytics] ${eventName}`);
    console.log('Timestamp:', event.timestamp.toISOString());
    if (params) {
      console.log('Parameters:', params);
    }
    if (error) {
      console.error('Error:', error);
    }
    console.groupEnd();
  }

  /**
   * Get all recorded events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events summary
   */
  getSummary() {
    const summary = {
      totalEvents: this.events.length,
      successCount: this.events.filter(e => e.status === 'success').length,
      errorCount: this.events.filter(e => e.status === 'error').length,
      pendingCount: this.events.filter(e => e.status === 'pending').length,
      eventTypes: {} as Record<string, number>
    };

    this.events.forEach(event => {
      summary.eventTypes[event.eventName] = (summary.eventTypes[event.eventName] || 0) + 1;
    });

    return summary;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const summary = this.getSummary();
    console.group('📊 [Analytics] Summary');
    console.log('Total Events:', summary.totalEvents);
    console.log('✅ Success:', summary.successCount);
    console.log('❌ Errors:', summary.errorCount);
    console.log('⏳ Pending:', summary.pendingCount);
    console.log('\n📋 Event Types:');
    console.table(summary.eventTypes);
    console.groupEnd();
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
    console.log('[Analytics Debug] Event log cleared');
  }

  /**
   * Test Analytics connection
   */
  async testConnection() {
    console.log('[Analytics Debug] Testing Analytics connection...');

    try {
      // Try to import the analytics module
      const { analytics } = await import('@/lib/analytics');

      // Send a test event
      await analytics.logEvent('debug_test_event', {
        test_id: `test_${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      console.log('✅ [Analytics Debug] Test passed - Analytics is working');
      return true;
    } catch (error) {
      console.error('❌ [Analytics Debug] Test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const analyticsDebugger = new AnalyticsDebugger();

/**
 * Console commands for debugging (available in browser console):
 *
 * window.__analyticsDebug.enable()        - Enable debug mode
 * window.__analyticsDebug.disable()       - Disable debug mode
 * window.__analyticsDebug.getEvents()     - Get all events
 * window.__analyticsDebug.getSummary()    - Get events summary
 * window.__analyticsDebug.printSummary()  - Print summary to console
 * window.__analyticsDebug.clear()         - Clear event log
 * window.__analyticsDebug.testConnection() - Test Analytics connection
 */

// Add helpful message to console in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log(
    '%c📊 Analytics Debug Utility Loaded',
    'background: #003F6F; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;'
  );
  console.log(
    '%cUse window.__analyticsDebug to access debug commands',
    'color: #003F6F; font-style: italic;'
  );
  console.log('Available commands:');
  console.log('  • __analyticsDebug.enable()       - Enable debug mode');
  console.log('  • __analyticsDebug.printSummary() - View Analytics summary');
  console.log('  • __analyticsDebug.testConnection() - Test Analytics');
}

export default analyticsDebugger;
