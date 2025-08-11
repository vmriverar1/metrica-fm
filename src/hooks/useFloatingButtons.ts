'use client';

import { useEffect, useState } from 'react';

export function useFloatingButtons() {
  const [isCompareHovered, setIsCompareHovered] = useState(false);

  useEffect(() => {
    const handleCompareHover = (isHovered: boolean) => {
      setIsCompareHovered(isHovered);
      
      // Find presentation button and move it
      const presentationButton = document.querySelector('.presentation-button') as HTMLElement;
      if (presentationButton) {
        if (isHovered) {
          presentationButton.style.transform = 'translateX(-80px)';
          presentationButton.style.transition = 'transform 0.3s ease';
        } else {
          presentationButton.style.transform = 'translateX(0px)';
          presentationButton.style.transition = 'transform 0.3s ease';
        }
      }
    };

    // Listen for custom events from compare button
    window.addEventListener('compare-button-hover', (e) => {
      handleCompareHover((e as CustomEvent).detail.hovered);
    });

    return () => {
      window.removeEventListener('compare-button-hover', () => {});
    };
  }, []);

  const dispatchCompareHover = (hovered: boolean) => {
    window.dispatchEvent(new CustomEvent('compare-button-hover', {
      detail: { hovered }
    }));
  };

  return {
    isCompareHovered,
    dispatchCompareHover
  };
}