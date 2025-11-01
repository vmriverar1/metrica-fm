'use client';

import { useState, useEffect, useCallback } from 'react';
// Import only client-safe functions
import { HistoriaPageSchema, TimelineEventSchema } from '@/lib/schemas/page-schemas';
import { z } from 'zod';

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type HistoriaPageData = z.infer<typeof HistoriaPageSchema>;

interface UseTimelineDataReturn {
  events: TimelineEvent[];
  pageData: HistoriaPageData | null;
  loading: boolean;
  error: string | null;
  saveEvents: (newEvents: TimelineEvent[]) => Promise<boolean>;
  reloadData: () => Promise<void>;
  validationErrors: string[];
}

export function useTimelineData(): UseTimelineDataReturn {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [pageData, setPageData] = useState<HistoriaPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load from Firestore via API
      const response = await fetch('/api/admin/pages/historia', {
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch historia.json: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load historia data');
      }

      // Extract data from Firestore API response format
      const rawData = result.data?.content || result.data;

      // Basic validation
      try {
        const validatedData = HistoriaPageSchema.parse(rawData);
        setPageData(validatedData);
        setEvents(validatedData.timeline_events || []);
        setValidationErrors([]);
      } catch (validationError) {
        // Use raw data but show validation warnings
        setPageData(rawData);
        setEvents(rawData.timeline_events || []);
        if (validationError instanceof z.ZodError) {
          setValidationErrors(validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timeline data';
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEvents = useCallback(async (newEvents: TimelineEvent[]): Promise<boolean> => {
    try {
      if (!pageData) {
        throw new Error('No page data available');
      }

      // Validate events
      const validationResult = newEvents.every(event => {
        try {
          TimelineEventSchema.parse(event);
          return true;
        } catch {
          return false;
        }
      });

      if (!validationResult) {
        setError('Some events have validation errors');
        return false;
      }

      // Create updated page data
      const updatedPageData = {
        ...pageData,
        timeline_events: newEvents,
        lastModified: new Date().toISOString()
      };

      // In a real application, this would save to the server
      // For now, we'll simulate the save and update local state
      const response = await fetch('/api/admin/pages/historia', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPageData)
      });

      if (response.ok) {
        setPageData(updatedPageData);
        setEvents(newEvents);
        setError(null);
        return true;
      } else {
        throw new Error('Failed to save timeline data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save timeline data';
      setError(errorMessage);
      return false;
    }
  }, [pageData]);

  const reloadData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    events,
    pageData,
    loading,
    error,
    saveEvents,
    reloadData,
    validationErrors
  };
}

// Helper functions for timeline management
export function createNewTimelineEvent(year: string = new Date().getFullYear().toString()): TimelineEvent {
  const id = `event-${Date.now()}`;

  return {
    id,
    year,
    title: `Evento ${year}`,
    subtitle: 'Nuevo hito',
    description: 'Descripción del evento...',
    image: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2359.webp',
    achievements: ['Nuevo logro'],
    gallery: [],
    impact: 'Impacto del evento en la empresa',
    metrics: {
      team_size: 10,
      projects: 5,
      investment: '500K'
    }
  };
}

export function validateTimelineEvent(event: TimelineEvent): { isValid: boolean; errors: string[] } {
  try {
    TimelineEventSchema.parse(event);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
}

export function sortEventsByYear(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.year - b.year);
}

export function duplicateTimelineEvent(event: TimelineEvent, newYear?: number): TimelineEvent {
  const newId = `event-${Date.now()}`;
  
  return {
    ...event,
    id: newId,
    year: newYear || event.year + 1,
    title: `${event.title} (Copia)`
  };
}