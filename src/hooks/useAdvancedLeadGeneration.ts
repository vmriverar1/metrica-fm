'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { useContentIntelligence } from './useContentIntelligence';

interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  source: 'newsletter' | 'download' | 'consultation' | 'job_application' | 'contact_form';
  score: number;
  interests: string[];
  behavior: {
    pagesVisited: string[];
    timeSpent: number;
    contentInteractions: number;
    downloadedResources: string[];
  };
  stage: 'cold' | 'warm' | 'hot' | 'qualified' | 'customer';
  createdAt: Date;
  lastInteraction: Date;
  tags: string[];
}

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'checklist' | 'template' | 'guide' | 'calculator';
  category: string;
  downloadUrl: string;
  value: number; // Lead scoring value
  requirements: ('email' | 'name' | 'company' | 'phone')[];
  conversionRate: number;
  downloadCount: number;
}

interface NewsletterSubscription {
  email: string;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
    contentTypes: string[];
  };
  source: string;
  doubleOptIn: boolean;
  subscriptionDate: Date;
  isActive: boolean;
}

interface LeadScoringCriteria {
  emailProvided: number;
  profileComplete: number;
  companyProvided: number;
  phoneProvided: number;
  contentDownload: number;
  newsletterSubscription: number;
  pageViews: number;
  timeSpent: number;
  socialShares: number;
  returnVisitor: number;
}

const DEFAULT_SCORING_CRITERIA: LeadScoringCriteria = {
  emailProvided: 20,
  profileComplete: 15,
  companyProvided: 25,
  phoneProvided: 30,
  contentDownload: 40,
  newsletterSubscription: 20,
  pageViews: 5,
  timeSpent: 10,
  socialShares: 15,
  returnVisitor: 10
};

export function useAdvancedLeadGeneration(type: 'blog' | 'careers') {
  const [leads, setLeads] = useState<Map<string, Lead>>(new Map());
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [subscriptions, setSubscriptions] = useState<Map<string, NewsletterSubscription>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const analytics = useAdvancedAnalytics(type === 'blog' ? 'blog' : 'careers');
  const contentIntelligence = useContentIntelligence(type);
  const formSubmissions = useRef<Map<string, any>>(new Map());

  // Initialize data from storage
  useEffect(() => {
    loadDataFromStorage();
    initializeLeadMagnets();
  }, [type]);

  const loadDataFromStorage = useCallback(() => {
    try {
      // Load leads
      const storedLeads = localStorage.getItem(`${type}_leads`);
      if (storedLeads) {
        const leadsData = JSON.parse(storedLeads);
        const leadsMap = new Map<string, Lead>();
        
        Object.entries(leadsData).forEach(([email, leadData]: [string, any]) => {
          leadsMap.set(email, {
            ...leadData,
            createdAt: new Date(leadData.createdAt),
            lastInteraction: new Date(leadData.lastInteraction)
          });
        });
        
        setLeads(leadsMap);
      }

      // Load subscriptions
      const storedSubs = localStorage.getItem(`${type}_subscriptions`);
      if (storedSubs) {
        const subsData = JSON.parse(storedSubs);
        const subsMap = new Map<string, NewsletterSubscription>();
        
        Object.entries(subsData).forEach(([email, subData]: [string, any]) => {
          subsMap.set(email, {
            ...subData,
            subscriptionDate: new Date(subData.subscriptionDate)
          });
        });
        
        setSubscriptions(subsMap);
      }
    } catch (error) {
      console.error('Error loading lead generation data:', error);
    }
  }, [type]);

  const saveDataToStorage = useCallback((
    leadsData?: Map<string, Lead>,
    subsData?: Map<string, NewsletterSubscription>
  ) => {
    try {
      if (leadsData) {
        const leadsObject = Object.fromEntries(leadsData);
        localStorage.setItem(`${type}_leads`, JSON.stringify(leadsObject));
      }
      
      if (subsData) {
        const subsObject = Object.fromEntries(subsData);
        localStorage.setItem(`${type}_subscriptions`, JSON.stringify(subsObject));
      }
    } catch (error) {
      console.error('Error saving lead generation data:', error);
    }
  }, [type]);

  // Initialize lead magnets based on type
  const initializeLeadMagnets = useCallback(() => {
    const blogMagnets: LeadMagnet[] = [
      {
        id: 'construction-trends-2024',
        title: 'Tendencias de Construcción 2024',
        description: 'Reporte completo con las principales tendencias del sector construcción en Perú',
        type: 'pdf',
        category: 'Industria & Tendencias',
        downloadUrl: '/downloads/construction-trends-2024.pdf',
        value: 40,
        requirements: ['email', 'name', 'company'],
        conversionRate: 0.15,
        downloadCount: 0
      },
      {
        id: 'project-management-checklist',
        title: 'Checklist de Gestión de Proyectos',
        description: 'Lista completa para gestionar proyectos de construcción exitosamente',
        type: 'checklist',
        category: 'Guías Técnicas',
        downloadUrl: '/downloads/pm-checklist.pdf',
        value: 35,
        requirements: ['email', 'name'],
        conversionRate: 0.22,
        downloadCount: 0
      },
      {
        id: 'sustainability-calculator',
        title: 'Calculadora de Sostenibilidad',
        description: 'Herramienta para calcular el impacto ambiental de tu proyecto',
        type: 'calculator',
        category: 'Sostenibilidad',
        downloadUrl: '/tools/sustainability-calculator',
        value: 45,
        requirements: ['email', 'name', 'company', 'phone'],
        conversionRate: 0.12,
        downloadCount: 0
      }
    ];

    const careersMagnets: LeadMagnet[] = [
      {
        id: 'salary-guide-2024',
        title: 'Guía de Salarios Construcción 2024',
        description: 'Rangos salariales actualizados para profesionales del sector',
        type: 'guide',
        category: 'Información Salarial',
        downloadUrl: '/downloads/salary-guide-2024.pdf',
        value: 30,
        requirements: ['email', 'name'],
        conversionRate: 0.18,
        downloadCount: 0
      },
      {
        id: 'career-path-template',
        title: 'Template Plan de Carrera',
        description: 'Plantilla para planificar tu crecimiento profesional en construcción',
        type: 'template',
        category: 'Desarrollo Profesional',
        downloadUrl: '/downloads/career-path-template.pdf',
        value: 25,
        requirements: ['email', 'name'],
        conversionRate: 0.20,
        downloadCount: 0
      },
      {
        id: 'interview-preparation',
        title: 'Guía de Preparación para Entrevistas',
        description: 'Tips y preguntas frecuentes para entrevistas en construcción',
        type: 'guide',
        category: 'Búsqueda de Empleo',
        downloadUrl: '/downloads/interview-prep.pdf',
        value: 20,
        requirements: ['email'],
        conversionRate: 0.25,
        downloadCount: 0
      }
    ];

    setLeadMagnets(type === 'blog' ? blogMagnets : careersMagnets);
  }, [type]);

  // Calculate lead score
  const calculateLeadScore = useCallback((
    lead: Partial<Lead>,
    criteria: LeadScoringCriteria = DEFAULT_SCORING_CRITERIA
  ): number => {
    let score = 0;

    // Profile completeness
    if (lead.email) score += criteria.emailProvided;
    if (lead.name) score += criteria.profileComplete * 0.3;
    if (lead.company) score += criteria.companyProvided;
    if (lead.phone) score += criteria.phoneProvided;

    // Behavior scoring
    if (lead.behavior) {
      score += Math.min(lead.behavior.pagesVisited.length * criteria.pageViews, 50);
      score += Math.min(lead.behavior.timeSpent / 60000 * criteria.timeSpent, 40); // Per minute
      score += Math.min(lead.behavior.contentInteractions * criteria.socialShares, 30);
      score += lead.behavior.downloadedResources.length * criteria.contentDownload;
    }

    // Source-based scoring
    switch (lead.source) {
      case 'consultation':
        score += 60;
        break;
      case 'download':
        score += criteria.contentDownload;
        break;
      case 'newsletter':
        score += criteria.newsletterSubscription;
        break;
      case 'job_application':
        score += 50;
        break;
      case 'contact_form':
        score += 40;
        break;
    }

    return Math.min(score, 100);
  }, []);

  // Determine lead stage based on score and behavior
  const determineLeadStage = useCallback((score: number, behavior: Lead['behavior']): Lead['stage'] => {
    if (score >= 80) return 'qualified';
    if (score >= 60) return 'hot';
    if (score >= 40) return 'warm';
    if (behavior.contentInteractions > 3 || behavior.downloadedResources.length > 1) return 'warm';
    return 'cold';
  }, []);

  // Capture lead from form submission
  const captureLead = useCallback(async (formData: {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    source: Lead['source'];
    interests?: string[];
    context?: any;
  }): Promise<Lead | null> => {
    setIsLoading(true);

    try {
      // Check if lead already exists
      const existingLead = leads.get(formData.email);
      const now = new Date();

      // Get current user behavior from analytics
      const realTimeMetrics = analytics.getRealTimeMetrics();

      const leadData: Lead = existingLead ? {
        ...existingLead,
        // Update with new information if provided
        name: formData.name || existingLead.name,
        company: formData.company || existingLead.company,
        phone: formData.phone || existingLead.phone,
        interests: [...new Set([...existingLead.interests, ...(formData.interests || [])])],
        behavior: {
          ...existingLead.behavior,
          contentInteractions: existingLead.behavior.contentInteractions + 1
        },
        lastInteraction: now
      } : {
        id: `${formData.email}_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        source: formData.source,
        score: 0,
        interests: formData.interests || [],
        behavior: {
          pagesVisited: [window.location.pathname],
          timeSpent: realTimeMetrics.sessionDuration,
          contentInteractions: 1,
          downloadedResources: []
        },
        stage: 'cold',
        createdAt: existingLead ? existingLead.createdAt : now,
        lastInteraction: now,
        tags: []
      };

      // Calculate score and stage
      leadData.score = calculateLeadScore(leadData);
      leadData.stage = determineLeadStage(leadData.score, leadData.behavior);

      // Add contextual tags
      const tags = [...leadData.tags];
      if (type === 'blog' && formData.context?.category) {
        tags.push(`interested-in-${formData.context.category}`);
      }
      if (type === 'careers' && formData.context?.jobType) {
        tags.push(`seeking-${formData.context.jobType}`);
      }
      leadData.tags = [...new Set(tags)];

      // Update leads map
      const updatedLeads = new Map(leads);
      updatedLeads.set(formData.email, leadData);
      setLeads(updatedLeads);
      saveDataToStorage(updatedLeads, undefined);

      // Track in analytics
      analytics.trackEvent('lead_captured', {
        source: formData.source,
        score: leadData.score,
        stage: leadData.stage,
        isExisting: !!existingLead
      });

      // Trigger automated follow-up based on lead stage
      triggerAutomatedFollowUp(leadData);

      return leadData;

    } catch (error) {
      console.error('Error capturing lead:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [leads, analytics, calculateLeadScore, determineLeadStage, saveDataToStorage, type]);

  // Handle newsletter subscription
  const subscribeToNewsletter = useCallback(async (subscriptionData: {
    email: string;
    preferences: NewsletterSubscription['preferences'];
    source: string;
  }): Promise<boolean> => {
    setIsLoading(true);

    try {
      const subscription: NewsletterSubscription = {
        email: subscriptionData.email,
        preferences: subscriptionData.preferences,
        source: subscriptionData.source,
        doubleOptIn: false, // Would be handled by email service
        subscriptionDate: new Date(),
        isActive: true
      };

      const updatedSubscriptions = new Map(subscriptions);
      updatedSubscriptions.set(subscriptionData.email, subscription);
      setSubscriptions(updatedSubscriptions);
      saveDataToStorage(undefined, updatedSubscriptions);

      // Also capture as lead
      await captureLead({
        email: subscriptionData.email,
        source: 'newsletter',
        interests: subscriptionData.preferences.categories
      });

      analytics.trackEvent('newsletter_subscribed', {
        source: subscriptionData.source,
        categories: subscriptionData.preferences.categories,
        frequency: subscriptionData.preferences.frequency
      });

      return true;

    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscriptions, captureLead, saveDataToStorage, analytics]);

  // Handle lead magnet download
  const downloadLeadMagnet = useCallback(async (
    magnetId: string,
    contactInfo: Record<string, string>
  ): Promise<{ success: boolean; downloadUrl?: string }> => {
    const magnet = leadMagnets.find(m => m.id === magnetId);
    if (!magnet) {
      return { success: false };
    }

    setIsLoading(true);

    try {
      // Capture lead with download context
      const lead = await captureLead({
        email: contactInfo.email,
        name: contactInfo.name,
        company: contactInfo.company,
        phone: contactInfo.phone,
        source: 'download',
        interests: [magnet.category],
        context: { magnetId, magnetTitle: magnet.title }
      });

      if (lead) {
        // Update lead behavior
        const updatedLeads = new Map(leads);
        const updatedLead = updatedLeads.get(lead.email);
        if (updatedLead) {
          updatedLead.behavior.downloadedResources.push(magnetId);
          updatedLead.score = calculateLeadScore(updatedLead);
          updatedLead.stage = determineLeadStage(updatedLead.score, updatedLead.behavior);
          updatedLeads.set(lead.email, updatedLead);
          setLeads(updatedLeads);
          saveDataToStorage(updatedLeads, undefined);
        }

        // Update magnet statistics
        const updatedMagnets = leadMagnets.map(m =>
          m.id === magnetId ? { ...m, downloadCount: m.downloadCount + 1 } : m
        );
        setLeadMagnets(updatedMagnets);

        analytics.trackEvent('lead_magnet_downloaded', {
          magnetId,
          magnetType: magnet.type,
          category: magnet.category,
          leadScore: lead.score
        });

        return { success: true, downloadUrl: magnet.downloadUrl };
      }

      return { success: false };

    } catch (error) {
      console.error('Error downloading lead magnet:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [leadMagnets, captureLead, leads, calculateLeadScore, determineLeadStage, saveDataToStorage, analytics]);

  // Trigger automated follow-up sequences
  const triggerAutomatedFollowUp = useCallback((lead: Lead) => {
    // In a real app, this would integrate with email automation service
    console.log('Triggering automated follow-up for lead:', lead.email, 'Stage:', lead.stage);

    const followUpActions = [];

    switch (lead.stage) {
      case 'qualified':
        followUpActions.push('schedule-consultation-call');
        followUpActions.push('assign-to-sales-team');
        break;
      case 'hot':
        followUpActions.push('send-personalized-content');
        followUpActions.push('invite-to-webinar');
        break;
      case 'warm':
        followUpActions.push('add-to-nurture-sequence');
        followUpActions.push('send-case-studies');
        break;
      case 'cold':
        followUpActions.push('add-to-awareness-campaign');
        break;
    }

    analytics.trackEvent('automated_followup_triggered', {
      leadId: lead.id,
      stage: lead.stage,
      actions: followUpActions
    });
  }, [analytics]);

  // Get lead conversion funnel
  const getConversionFunnel = useCallback(() => {
    const leadsArray = Array.from(leads.values());
    
    const funnel = {
      visitors: leadsArray.length + 1000, // Mock visitor count
      leads: leadsArray.length,
      qualified: leadsArray.filter(l => l.stage === 'qualified').length,
      customers: leadsArray.filter(l => l.stage === 'customer').length
    };

    return {
      ...funnel,
      leadConversionRate: funnel.visitors > 0 ? funnel.leads / funnel.visitors : 0,
      qualificationRate: funnel.leads > 0 ? funnel.qualified / funnel.leads : 0,
      closureRate: funnel.qualified > 0 ? funnel.customers / funnel.qualified : 0
    };
  }, [leads]);

  // Get lead insights
  const getLeadInsights = useCallback(() => {
    const leadsArray = Array.from(leads.values());
    const subscriptionsArray = Array.from(subscriptions.values());

    return {
      totalLeads: leadsArray.length,
      qualifiedLeads: leadsArray.filter(l => l.stage === 'qualified').length,
      averageScore: leadsArray.reduce((acc, l) => acc + l.score, 0) / leadsArray.length || 0,
      topSources: getTopSources(leadsArray),
      conversionFunnel: getConversionFunnel(),
      newsletterSubscribers: subscriptionsArray.filter(s => s.isActive).length,
      topLeadMagnets: leadMagnets
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 3)
        .map(m => ({ title: m.title, downloads: m.downloadCount, conversionRate: m.conversionRate }))
    };
  }, [leads, subscriptions, leadMagnets, getConversionFunnel]);

  const getTopSources = useCallback((leadsArray: Lead[]) => {
    const sourceCount: Record<string, number> = {};
    leadsArray.forEach(lead => {
      sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
    });

    return Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  }, []);

  return {
    leads,
    leadMagnets,
    subscriptions,
    isLoading,
    captureLead,
    subscribeToNewsletter,
    downloadLeadMagnet,
    getLeadInsights,
    getConversionFunnel,
    calculateLeadScore
  };
}

// Hook for progressive profiling
export function useProgressiveProfiling() {
  const [profileData, setProfileData] = useState<Record<string, any>>({});

  const updateProfile = useCallback((email: string, newData: Record<string, any>) => {
    setProfileData(prev => ({
      ...prev,
      [email]: { ...prev[email], ...newData }
    }));
  }, []);

  const getProfileCompleteness = useCallback((email: string) => {
    const profile = profileData[email] || {};
    const fields = ['name', 'company', 'phone', 'position', 'industry'];
    const completedFields = fields.filter(field => profile[field]);
    return completedFields.length / fields.length;
  }, [profileData]);

  const getNextProfileField = useCallback((email: string) => {
    const profile = profileData[email] || {};
    const fields = ['name', 'company', 'phone', 'position', 'industry'];
    return fields.find(field => !profile[field]);
  }, [profileData]);

  return {
    profileData,
    updateProfile,
    getProfileCompleteness,
    getNextProfileField
  };
}