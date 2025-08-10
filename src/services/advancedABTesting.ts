'use client';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100, percentage of users who see this variant
  config: Record<string, any>; // Configuration overrides for this variant
  isControl: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    percentage: number; // Percentage of users to include in test
    segments: string[]; // User segments to target
    excludeSegments: string[]; // User segments to exclude
    filters: Record<string, any>; // Additional filters
  };
  variants: ABTestVariant[];
  metrics: {
    primary: string; // Primary metric to optimize for
    secondary: string[]; // Secondary metrics to track
    guardrails: Array<{
      metric: string;
      operator: 'gt' | 'lt' | 'eq';
      threshold: number;
    }>;
  };
  statisticalConfig: {
    significanceLevel: number; // e.g., 0.05 for 95% confidence
    power: number; // e.g., 0.8 for 80% power
    minimumDetectableEffect: number; // Minimum effect size to detect
    minimumSampleSize: number;
  };
  results?: ABTestResults;
  metadata: {
    createdBy: string;
    team: string;
    hypothesis: string;
    tags: string[];
  };
}

export interface ABTestResults {
  duration: number; // Days the test ran
  participantCount: number;
  variantResults: Array<{
    variantId: string;
    sampleSize: number;
    metrics: Record<string, {
      value: number;
      confidence: number;
      pValue: number;
      improvement: number; // Percentage improvement vs control
      significantlyDifferent: boolean;
    }>;
  }>;
  winner?: {
    variantId: string;
    confidence: number;
    improvement: number;
    metric: string;
  };
  recommendations: string[];
  statisticalSummary: {
    isStatisticallySignificant: boolean;
    confidenceLevel: number;
    effect: 'positive' | 'negative' | 'neutral';
    recommendation: 'implement_winner' | 'continue_test' | 'inconclusive' | 'stop_test';
  };
}

export interface ABTestParticipant {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  firstExposure?: Date;
  conversions: Array<{
    metric: string;
    value: number;
    timestamp: Date;
  }>;
  metadata: Record<string, any>;
}

export interface ABTestEvent {
  id: string;
  testId: string;
  variantId: string;
  userId: string;
  eventType: 'exposure' | 'conversion' | 'custom';
  eventName: string;
  value: number;
  timestamp: Date;
  properties: Record<string, any>;
}

class StatisticalEngine {
  // Calculate statistical significance using t-test
  static calculateSignificance(
    controlMean: number,
    controlStdDev: number,
    controlSize: number,
    testMean: number,
    testStdDev: number,
    testSize: number
  ): { pValue: number; tStatistic: number; significant: boolean } {
    // Welch's t-test for unequal variances
    const pooledStdError = Math.sqrt(
      (controlStdDev ** 2) / controlSize + (testStdDev ** 2) / testSize
    );
    
    const tStatistic = (testMean - controlMean) / pooledStdError;
    
    // Degrees of freedom using Welch's formula
    const df = Math.pow(pooledStdError, 4) / (
      Math.pow(controlStdDev ** 2 / controlSize, 2) / (controlSize - 1) +
      Math.pow(testStdDev ** 2 / testSize, 2) / (testSize - 1)
    );
    
    // Approximate p-value (simplified calculation)
    const pValue = this.tDistributionCDF(Math.abs(tStatistic), df) * 2;
    
    return {
      pValue,
      tStatistic,
      significant: pValue < 0.05
    };
  }

  // Simplified t-distribution CDF calculation
  private static tDistributionCDF(t: number, df: number): number {
    // Approximation - in production, use a proper statistical library
    return 1 - Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI);
  }

  // Calculate confidence interval
  static calculateConfidenceInterval(
    mean: number,
    stdDev: number,
    sampleSize: number,
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    const z = confidenceLevel === 0.95 ? 1.96 : 2.58; // 95% or 99%
    const marginOfError = z * (stdDev / Math.sqrt(sampleSize));
    
    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
  }

  // Calculate required sample size
  static calculateSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    alpha: number = 0.05,
    power: number = 0.8
  ): number {
    // Simplified sample size calculation for proportion test
    const z_alpha = 1.96; // 95% confidence
    const z_beta = 0.84;  // 80% power
    
    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + minimumDetectableEffect);
    const p_avg = (p1 + p2) / 2;
    
    const numerator = Math.pow(z_alpha * Math.sqrt(2 * p_avg * (1 - p_avg)) + z_beta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }

  // Calculate conversion rate with confidence interval
  static calculateConversionMetrics(
    conversions: number,
    exposures: number
  ): {
    rate: number;
    standardError: number;
    confidenceInterval: { lower: number; upper: number };
  } {
    const rate = exposures > 0 ? conversions / exposures : 0;
    const standardError = exposures > 0 ? Math.sqrt(rate * (1 - rate) / exposures) : 0;
    const marginOfError = 1.96 * standardError; // 95% confidence
    
    return {
      rate,
      standardError,
      confidenceInterval: {
        lower: Math.max(0, rate - marginOfError),
        upper: Math.min(1, rate + marginOfError)
      }
    };
  }
}

export class ABTestingManager {
  private tests: Map<string, ABTest> = new Map();
  private participants: Map<string, ABTestParticipant[]> = new Map();
  private events: ABTestEvent[] = [];
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  constructor() {
    this.loadFromStorage();
  }

  // Test Management
  createTest(testConfig: Omit<ABTest, 'id' | 'status' | 'results'>): string {
    // Validate test configuration
    this.validateTestConfig(testConfig);

    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const test: ABTest = {
      ...testConfig,
      id: testId,
      status: 'draft',
      results: undefined
    };

    this.tests.set(testId, test);
    this.saveToStorage();

    console.log(`A/B Test created: ${test.name} (ID: ${testId})`);
    return testId;
  }

  startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'draft') {
      console.error('Cannot start test: test not found or not in draft status');
      return false;
    }

    // Final validation before starting
    if (!this.validateTestReadyToStart(test)) {
      return false;
    }

    test.status = 'running';
    test.startDate = new Date();
    this.tests.set(testId, test);
    this.saveToStorage();

    console.log(`A/B Test started: ${test.name}`);
    return true;
  }

  stopTest(testId: string, reason?: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      console.error('Cannot stop test: test not found or not running');
      return false;
    }

    test.status = 'completed';
    test.endDate = new Date();
    
    // Generate final results
    test.results = this.generateTestResults(testId);
    
    this.tests.set(testId, test);
    this.saveToStorage();

    console.log(`A/B Test stopped: ${test.name}`, { reason, results: test.results });
    return true;
  }

  // User Assignment
  assignUserToTest(userId: string, testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const userTests = this.userAssignments.get(userId) || new Map();
    const existingAssignment = userTests.get(testId);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Check if user should be included in test
    if (!this.shouldIncludeUserInTest(userId, test)) {
      return null;
    }

    // Assign variant based on weights
    const variantId = this.selectVariantForUser(userId, test);
    if (!variantId) {
      return null;
    }

    // Record assignment
    userTests.set(testId, variantId);
    this.userAssignments.set(userId, userTests);

    // Create participant record
    const participant: ABTestParticipant = {
      userId,
      testId,
      variantId,
      assignedAt: new Date(),
      conversions: [],
      metadata: this.getUserMetadata(userId)
    };

    const testParticipants = this.participants.get(testId) || [];
    testParticipants.push(participant);
    this.participants.set(testId, testParticipants);

    this.saveToStorage();
    return variantId;
  }

  // Event Tracking
  trackEvent(
    userId: string,
    testId: string,
    eventName: string,
    value: number = 1,
    properties: Record<string, any> = {}
  ): void {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return;
    }

    const userTests = this.userAssignments.get(userId);
    const variantId = userTests?.get(testId);
    if (!variantId) {
      return; // User not in test
    }

    // Create event
    const event: ABTestEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testId,
      variantId,
      userId,
      eventType: this.getEventType(eventName, test),
      eventName,
      value,
      timestamp: new Date(),
      properties
    };

    this.events.push(event);

    // Update participant record
    const testParticipants = this.participants.get(testId) || [];
    const participant = testParticipants.find(p => p.userId === userId);
    if (participant) {
      if (event.eventType === 'exposure' && !participant.firstExposure) {
        participant.firstExposure = new Date();
      }

      if (event.eventType === 'conversion') {
        participant.conversions.push({
          metric: eventName,
          value,
          timestamp: new Date()
        });
      }
    }

    this.saveToStorage();
  }

  // Results Analysis
  getTestResults(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    if (test.results) {
      return test.results;
    }

    // Generate live results for running tests
    return this.generateTestResults(testId);
  }

  private generateTestResults(testId: string): ABTestResults {
    const test = this.tests.get(testId)!;
    const participants = this.participants.get(testId) || [];
    const testEvents = this.events.filter(e => e.testId === testId);

    const variantResults = test.variants.map(variant => {
      const variantParticipants = participants.filter(p => p.variantId === variant.id);
      const variantEvents = testEvents.filter(e => e.variantId === variant.id);

      const metrics: Record<string, any> = {};

      // Calculate metrics for this variant
      [test.metrics.primary, ...test.metrics.secondary].forEach(metricName => {
        const metricEvents = variantEvents.filter(e => e.eventName === metricName);
        const exposures = variantEvents.filter(e => e.eventType === 'exposure').length;
        const conversions = metricEvents.length;

        const conversionMetrics = StatisticalEngine.calculateConversionMetrics(conversions, exposures);

        metrics[metricName] = {
          value: conversionMetrics.rate,
          confidence: 0, // Will be calculated against control
          pValue: 0,     // Will be calculated against control
          improvement: 0, // Will be calculated against control
          significantlyDifferent: false
        };
      });

      return {
        variantId: variant.id,
        sampleSize: variantParticipants.length,
        metrics
      };
    });

    // Calculate statistical significance against control
    const controlVariant = test.variants.find(v => v.isControl);
    if (controlVariant) {
      const controlResults = variantResults.find(r => r.variantId === controlVariant.id);
      
      variantResults.forEach(result => {
        if (result.variantId === controlVariant.id) return;

        Object.keys(result.metrics).forEach(metricName => {
          const controlMetric = controlResults?.metrics[metricName];
          const testMetric = result.metrics[metricName];

          if (controlMetric && testMetric) {
            // Simplified significance calculation
            const improvement = controlMetric.value > 0 ? 
              ((testMetric.value - controlMetric.value) / controlMetric.value) * 100 : 0;

            // Mock statistical calculations (in production, use proper statistics)
            const significance = StatisticalEngine.calculateSignificance(
              controlMetric.value, 0.1, controlResults?.sampleSize || 1,
              testMetric.value, 0.1, result.sampleSize
            );

            testMetric.improvement = improvement;
            testMetric.pValue = significance.pValue;
            testMetric.confidence = (1 - significance.pValue) * 100;
            testMetric.significantlyDifferent = significance.significant;
          }
        });
      });
    }

    // Determine winner
    let winner: ABTestResults['winner'];
    const primaryMetricResults = variantResults
      .filter(r => r.variantId !== controlVariant?.id)
      .map(r => ({
        variantId: r.variantId,
        improvement: r.metrics[test.metrics.primary]?.improvement || 0,
        confidence: r.metrics[test.metrics.primary]?.confidence || 0,
        significant: r.metrics[test.metrics.primary]?.significantlyDifferent || false
      }))
      .filter(r => r.significant)
      .sort((a, b) => b.improvement - a.improvement);

    if (primaryMetricResults.length > 0) {
      const best = primaryMetricResults[0];
      winner = {
        variantId: best.variantId,
        confidence: best.confidence,
        improvement: best.improvement,
        metric: test.metrics.primary
      };
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(test, variantResults, winner);

    // Statistical summary
    const statisticalSummary = this.generateStatisticalSummary(test, variantResults, winner);

    const duration = test.endDate ? 
      Math.ceil((test.endDate.getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
      Math.ceil((Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      duration,
      participantCount: participants.length,
      variantResults,
      winner,
      recommendations,
      statisticalSummary
    };
  }

  private generateRecommendations(
    test: ABTest,
    variantResults: ABTestResults['variantResults'],
    winner?: ABTestResults['winner']
  ): string[] {
    const recommendations: string[] = [];

    if (winner && winner.confidence > 95 && winner.improvement > 5) {
      recommendations.push(`Implement variant ${winner.variantId} - shows ${winner.improvement.toFixed(1)}% improvement with ${winner.confidence.toFixed(1)}% confidence`);
    } else if (winner && winner.confidence > 90) {
      recommendations.push(`Consider extending test duration to reach higher confidence levels`);
    } else {
      recommendations.push(`Results are inconclusive - consider running test longer or increasing sample size`);
    }

    // Check guardrail metrics
    test.metrics.guardrails.forEach(guardrail => {
      variantResults.forEach(result => {
        const metricValue = result.metrics[guardrail.metric]?.value;
        if (metricValue !== undefined) {
          let violatesGuardrail = false;
          
          switch (guardrail.operator) {
            case 'gt':
              violatesGuardrail = metricValue <= guardrail.threshold;
              break;
            case 'lt':
              violatesGuardrail = metricValue >= guardrail.threshold;
              break;
            case 'eq':
              violatesGuardrail = metricValue !== guardrail.threshold;
              break;
          }

          if (violatesGuardrail) {
            recommendations.push(`⚠️ Variant ${result.variantId} violates guardrail metric ${guardrail.metric}`);
          }
        }
      });
    });

    return recommendations;
  }

  private generateStatisticalSummary(
    test: ABTest,
    variantResults: ABTestResults['variantResults'],
    winner?: ABTestResults['winner']
  ): ABTestResults['statisticalSummary'] {
    const hasSignificantResult = winner && winner.confidence > 95;
    const effect = winner ? (winner.improvement > 0 ? 'positive' : winner.improvement < 0 ? 'negative' : 'neutral') : 'neutral';

    let recommendation: ABTestResults['statisticalSummary']['recommendation'];
    if (hasSignificantResult && winner!.improvement > 5) {
      recommendation = 'implement_winner';
    } else if (hasSignificantResult && Math.abs(winner!.improvement) < 2) {
      recommendation = 'inconclusive';
    } else if (!hasSignificantResult) {
      const totalSampleSize = variantResults.reduce((sum, r) => sum + r.sampleSize, 0);
      if (totalSampleSize < test.statisticalConfig.minimumSampleSize) {
        recommendation = 'continue_test';
      } else {
        recommendation = 'inconclusive';
      }
    } else {
      recommendation = 'continue_test';
    }

    return {
      isStatisticallySignificant: hasSignificantResult || false,
      confidenceLevel: winner?.confidence || 0,
      effect,
      recommendation
    };
  }

  // Helper methods
  private validateTestConfig(config: Omit<ABTest, 'id' | 'status' | 'results'>): void {
    // Validate variants
    if (config.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100');
    }

    const controlCount = config.variants.filter(v => v.isControl).length;
    if (controlCount !== 1) {
      throw new Error('Test must have exactly one control variant');
    }

    // Validate metrics
    if (!config.metrics.primary) {
      throw new Error('Test must have a primary metric');
    }
  }

  private validateTestReadyToStart(test: ABTest): boolean {
    // Check sample size requirements
    const requiredSampleSize = StatisticalEngine.calculateSampleSize(
      0.1, // Assume 10% baseline conversion
      test.statisticalConfig.minimumDetectableEffect,
      test.statisticalConfig.significanceLevel,
      test.statisticalConfig.power
    );

    test.statisticalConfig.minimumSampleSize = requiredSampleSize;
    console.log(`Test ${test.name} requires minimum ${requiredSampleSize} participants per variant`);

    return true;
  }

  private shouldIncludeUserInTest(userId: string, test: ABTest): boolean {
    // Check if user falls within target percentage
    const userHash = this.hashString(userId + test.id);
    const userPercentile = userHash % 100;
    
    if (userPercentile >= test.targetAudience.percentage) {
      return false;
    }

    // Check segments (simplified - in production, would check user segments)
    // For now, assume all users match target segments
    
    return true;
  }

  private selectVariantForUser(userId: string, test: ABTest): string {
    const userHash = this.hashString(userId + test.id + 'variant');
    const randomValue = userHash % 100;
    
    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (randomValue < cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to control
    return test.variants.find(v => v.isControl)?.id || test.variants[0].id;
  }

  private getEventType(eventName: string, test: ABTest): ABTestEvent['eventType'] {
    if (eventName === 'page_view' || eventName === 'exposure') {
      return 'exposure';
    }
    
    if ([test.metrics.primary, ...test.metrics.secondary].includes(eventName)) {
      return 'conversion';
    }
    
    return 'custom';
  }

  private getUserMetadata(userId: string): Record<string, any> {
    // In production, would fetch user data
    return {
      userId,
      timestamp: new Date().toISOString()
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Storage methods
  private saveToStorage(): void {
    try {
      const data = {
        tests: Object.fromEntries(this.tests),
        participants: Object.fromEntries(this.participants),
        events: this.events,
        userAssignments: Object.fromEntries(
          Array.from(this.userAssignments.entries()).map(([userId, tests]) => [
            userId,
            Object.fromEntries(tests)
          ])
        )
      };
      localStorage.setItem('ab_testing_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save A/B testing data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('ab_testing_data');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      // Restore tests
      if (data.tests) {
        this.tests = new Map(Object.entries(data.tests).map(([id, test]: [string, any]) => [
          id,
          {
            ...test,
            startDate: new Date(test.startDate),
            endDate: test.endDate ? new Date(test.endDate) : undefined
          }
        ]));
      }

      // Restore participants
      if (data.participants) {
        this.participants = new Map(Object.entries(data.participants).map(([testId, parts]: [string, any]) => [
          testId,
          parts.map((p: any) => ({
            ...p,
            assignedAt: new Date(p.assignedAt),
            firstExposure: p.firstExposure ? new Date(p.firstExposure) : undefined,
            conversions: p.conversions.map((c: any) => ({
              ...c,
              timestamp: new Date(c.timestamp)
            }))
          }))
        ]));
      }

      // Restore events
      if (data.events) {
        this.events = data.events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }

      // Restore user assignments
      if (data.userAssignments) {
        this.userAssignments = new Map(
          Object.entries(data.userAssignments).map(([userId, tests]: [string, any]) => [
            userId,
            new Map(Object.entries(tests))
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load A/B testing data:', error);
    }
  }

  // Public API methods
  getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  getTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null;
  }

  getRunningTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(t => t.status === 'running');
  }

  getUserVariant(userId: string, testId: string): string | null {
    return this.userAssignments.get(userId)?.get(testId) || null;
  }

  isUserInTest(userId: string, testId: string): boolean {
    return this.userAssignments.get(userId)?.has(testId) || false;
  }
}

// Global A/B Testing Manager
export const abTestingManager = new ABTestingManager();

// React Hook for A/B Testing
export function useABTest(testId: string, userId?: string) {
  const [variant, setVariant] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId || !testId) {
      setIsLoading(false);
      return;
    }

    // Check if user is already assigned
    const existingVariant = abTestingManager.getUserVariant(userId, testId);
    if (existingVariant) {
      setVariant(existingVariant);
      setIsLoading(false);
      return;
    }

    // Assign user to test
    const assignedVariant = abTestingManager.assignUserToTest(userId, testId);
    setVariant(assignedVariant);
    setIsLoading(false);

    // Track exposure
    if (assignedVariant) {
      abTestingManager.trackEvent(userId, testId, 'exposure');
    }
  }, [testId, userId]);

  const trackConversion = React.useCallback((eventName: string, value?: number, properties?: Record<string, any>) => {
    if (userId && variant) {
      abTestingManager.trackEvent(userId, testId, eventName, value, properties);
    }
  }, [userId, testId, variant]);

  return {
    variant,
    isLoading,
    isInTest: variant !== null,
    trackConversion
  };
}

// Helper function to create common test scenarios
export function createCommonTests() {
  const manager = abTestingManager;

  // Blog CTA Button Test
  manager.createTest({
    name: 'Blog CTA Button Color Test',
    description: 'Test different CTA button colors for lead magnets',
    startDate: new Date(),
    targetAudience: {
      percentage: 50,
      segments: ['blog-visitors'],
      excludeSegments: [],
      filters: {}
    },
    variants: [
      {
        id: 'control',
        name: 'Blue Button',
        description: 'Original blue CTA button',
        weight: 50,
        config: { ctaColor: '#3B82F6' },
        isControl: true
      },
      {
        id: 'orange',
        name: 'Orange Button',
        description: 'Orange CTA button',
        weight: 50,
        config: { ctaColor: '#F97316' },
        isControl: false
      }
    ],
    metrics: {
      primary: 'lead_magnet_download',
      secondary: ['newsletter_signup', 'time_on_page'],
      guardrails: [
        { metric: 'bounce_rate', operator: 'lt', threshold: 0.7 }
      ]
    },
    statisticalConfig: {
      significanceLevel: 0.05,
      power: 0.8,
      minimumDetectableEffect: 0.1,
      minimumSampleSize: 1000
    },
    metadata: {
      createdBy: 'marketing',
      team: 'growth',
      hypothesis: 'Orange buttons will increase conversion rates due to higher visibility',
      tags: ['blog', 'cta', 'conversion']
    }
  });

  // Job Application Flow Test
  manager.createTest({
    name: 'Job Application Form Length',
    description: 'Test short vs long application form',
    startDate: new Date(),
    targetAudience: {
      percentage: 100,
      segments: ['job-seekers'],
      excludeSegments: [],
      filters: {}
    },
    variants: [
      {
        id: 'control',
        name: 'Standard Form',
        description: 'Current 8-field application form',
        weight: 50,
        config: { formFields: 8 },
        isControl: true
      },
      {
        id: 'short',
        name: 'Short Form',
        description: 'Simplified 4-field application form',
        weight: 50,
        config: { formFields: 4 },
        isControl: false
      }
    ],
    metrics: {
      primary: 'application_submitted',
      secondary: ['form_started', 'time_to_complete'],
      guardrails: [
        { metric: 'application_quality_score', operator: 'gt', threshold: 7 }
      ]
    },
    statisticalConfig: {
      significanceLevel: 0.05,
      power: 0.8,
      minimumDetectableEffect: 0.15,
      minimumSampleSize: 800
    },
    metadata: {
      createdBy: 'hr',
      team: 'talent',
      hypothesis: 'Shorter forms will increase application completion rates',
      tags: ['careers', 'form', 'ux']
    }
  });

  console.log('Common A/B tests created successfully');
}