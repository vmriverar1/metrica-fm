'use client';

import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MobileOptimizer({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set viewport meta for mobile optimization
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && isMobile) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }

    // Add mobile-specific CSS classes to body
    if (isMobile) {
      document.body.classList.add('mobile-device');
      document.body.classList.add('touch-device');
    }

    // Mobile performance optimizations
    if (isMobile) {
      // Reduce motion for better battery life
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
      }

      // Optimize touch events
      const touchElements = document.querySelectorAll('[data-touch-optimize]');
      touchElements.forEach(element => {
        element.setAttribute('style', 'touch-action: manipulation; cursor: pointer;');
      });

      // Preload critical mobile resources
      const mobileResources = [
        '/css/mobile-optimized.css',
        '/js/mobile-interactions.js'
      ];
      
      mobileResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    }

    // Cleanup function
    return () => {
      document.body.classList.remove(
        'mobile-device', 
        'touch-device',
        'reduce-motion'
      );
    };
  }, [isMobile]);

  // Inject mobile-specific CSS
  useEffect(() => {
    if (!isMobile) return;

    const mobileCSS = `
      .mobile-device {
        -webkit-overflow-scrolling: touch;
        -webkit-tap-highlight-color: transparent;
      }
      
      .mobile-device .service-card {
        min-height: 280px;
        padding: 1.5rem 1rem;
      }
      
      .mobile-device .form-step {
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .touch-device button,
      .touch-device .interactive-element {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
      }
      
      .landscape-orientation .hero-section {
        height: 80vh;
        min-height: 500px;
      }
      
      .portrait-orientation .hero-section {
        height: 70vh;
        min-height: 600px;
      }
      
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      @media (max-width: 768px) {
        .service-matrix {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .project-showcase {
          grid-template-columns: 1fr;
        }
        
        .knowledge-cards {
          grid-template-columns: 1fr;
        }
        
        .value-props-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .contact-form-grid {
          grid-template-columns: 1fr;
        }
      }
      
      @media (max-width: 480px) {
        .container {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .section-padding {
          padding-top: 3rem;
          padding-bottom: 3rem;
        }
        
        .text-4xl, .text-5xl {
          font-size: 2rem !important;
          line-height: 2.5rem !important;
        }
        
        .value-props-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = mobileCSS;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isMobile]);

  return (
    <div className={isMobile ? 'mobile-device services-page-wrapper' : 'services-page-wrapper'}>
      {children}
    </div>
  );
}