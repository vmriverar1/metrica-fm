'use client';

/**
 * Accessibility utilities and hooks for Métrica FM
 * Provides comprehensive a11y support including keyboard navigation, screen readers, and WCAG compliance
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

// Keyboard navigation utilities
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

// Focus management
export class FocusManager {
  private static instance: FocusManager;
  private focusStack: HTMLElement[] = [];
  private trappers: Set<HTMLElement> = new Set();

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  // Focus trap for modals and dialogs
  trapFocus(container: HTMLElement): () => void {
    this.trappers.add(container);
    
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store the currently focused element
    const previouslyFocused = document.activeElement as HTMLElement;
    this.focusStack.push(previouslyFocused);

    // Focus the first element
    firstElement.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        if (event.shiftKey) {
          // Shift + Tab: move backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === KEYBOARD_KEYS.ESCAPE) {
        this.releaseFocus(container);
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.releaseFocus(container);
    };
  }

  releaseFocus(container: HTMLElement): void {
    this.trappers.delete(container);
    
    const previouslyFocused = this.focusStack.pop();
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
  }
}

// React hooks for accessibility
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      const focusManager = FocusManager.getInstance();
      releaseRef.current = focusManager.trapFocus(containerRef.current);
    } else if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }

    return () => {
      if (releaseRef.current) {
        releaseRef.current();
      }
    };
  }, [isActive]);

  return containerRef;
}

export function useKeyboardNavigation(handlers: Record<string, (event: KeyboardEvent) => void>) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        handler(event);
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);

  return elementRef;
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private liveRegion: HTMLDivElement | null = null;

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private ensureLiveRegion(): void {
    if (this.liveRegion || typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.ensureLiveRegion();
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = ScreenReaderAnnouncer.getInstance();
    announcer.announce(message, priority);
  }, []);

  return { announce };
}

// Reduced motion detection
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast mode detection
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Color scheme preference
export function useColorScheme(): 'light' | 'dark' | null {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const updateColorScheme = () => {
      if (darkQuery.matches) {
        setColorScheme('dark');
      } else if (lightQuery.matches) {
        setColorScheme('light');
      } else {
        setColorScheme(null);
      }
    };

    updateColorScheme();

    darkQuery.addEventListener('change', updateColorScheme);
    lightQuery.addEventListener('change', updateColorScheme);

    return () => {
      darkQuery.removeEventListener('change', updateColorScheme);
      lightQuery.removeEventListener('change', updateColorScheme);
    };
  }, []);

  return colorScheme;
}

// Skip link component
export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return React.createElement('a', {
    href: href,
    className: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg ${className}`,
    onFocus: (e: React.FocusEvent) => {
      // Announce skip link to screen readers
      const announcer = ScreenReaderAnnouncer.getInstance();
      announcer.announce('Enlace de salto activado');
    }
  }, children);
}

// ARIA live region component
export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
}

export function LiveRegion({ message, priority = 'polite', clearDelay = 5000 }: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);
    
    if (clearDelay > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearDelay);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearDelay]);

  return React.createElement('div', {
    'aria-live': priority,
    'aria-atomic': 'true',
    className: 'sr-only'
  }, currentMessage);
}

// Accessible button component with proper ARIA support
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  'aria-describedby'?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Cargando...',
  disabled,
  className = '',
  onClick,
  ...props
}: AccessibleButtonProps) {
  const { announce } = useScreenReader();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      announce('La acción está en progreso, por favor espera', 'polite');
      return;
    }

    if (onClick) {
      onClick(event);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };

  return React.createElement('button', {
    className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`,
    disabled: disabled || loading,
    'aria-busy': loading,
    'aria-describedby': loading ? `${props.id}-loading` : props['aria-describedby'],
    onClick: handleClick,
    ...props
  }, loading ? [
    React.createElement('span', { 
      key: 'spinner',
      className: 'animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full' 
    }),
    React.createElement('span', { 
      key: 'loading-text',
      id: `${props.id}-loading`, 
      className: 'sr-only' 
    }, loadingText),
    loadingText
  ] : children);
}

// Accessible form field component
export interface AccessibleFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AccessibleField({ id, label, description, error, required, children }: AccessibleFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return React.createElement('div', { className: 'space-y-2' }, [
    React.createElement('label', {
      key: 'label',
      htmlFor: id,
      className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
    }, [
      label,
      required && React.createElement('span', {
        key: 'required',
        className: 'text-red-500 ml-1',
        'aria-label': 'requerido'
      }, '*')
    ].filter(Boolean)),
    
    React.cloneElement(children as React.ReactElement, {
      key: 'field',
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': error ? 'true' : 'false',
      'aria-required': required
    }),
    
    description && React.createElement('p', {
      key: 'description',
      id: descriptionId,
      className: 'text-sm text-muted-foreground'
    }, description),
    
    error && React.createElement('p', {
      key: 'error',
      id: errorId,
      className: 'text-sm text-destructive',
      role: 'alert'
    }, error)
  ].filter(Boolean));
}

// Initialize accessibility features
export function initializeAccessibility(): void {
  if (typeof window === 'undefined') return;

  // Initialize screen reader announcer
  ScreenReaderAnnouncer.getInstance();

  // Add skip links to page
  const skipLinks = document.createElement('div');
  skipLinks.innerHTML = `
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg">
      Ir al contenido principal
    </a>
    <a href="#navigation" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-20 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg">
      Ir a la navegación
    </a>
  `;
  document.body.insertBefore(skipLinks, document.body.firstChild);

  // Add main content landmark if not exists
  if (!document.querySelector('main, [role="main"]')) {
    const main = document.querySelector('#main-content, .main-content');
    if (main) {
      main.setAttribute('role', 'main');
      main.setAttribute('id', 'main-content');
    }
  }

  // Ensure navigation has proper landmarks
  const nav = document.querySelector('nav, [role="navigation"]');
  if (nav && !nav.getAttribute('id')) {
    nav.setAttribute('id', 'navigation');
  }
}

export default {
  FocusManager,
  ScreenReaderAnnouncer,
  useFocusTrap,
  useKeyboardNavigation,
  useScreenReader,
  useReducedMotion,
  useHighContrast,
  useColorScheme,
  SkipLink,
  LiveRegion,
  AccessibleButton,
  AccessibleField,
  initializeAccessibility,
};