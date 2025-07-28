'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  scrambleChars?: string;
}

export default function ScrambleText({ 
  text, 
  className = '',
  duration = 1500,
  scrambleChars = '0123456789'
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startScramble();
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const startScramble = () => {
    const chars = scrambleChars.split('');
    const originalText = text;
    let iteration = 0;
    const totalIterations = 20;
    
    intervalRef.current = setInterval(() => {
      const scrambled = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration * (originalText.length / totalIterations)) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      setDisplayText(scrambled);
      
      iteration++;
      
      if (iteration > totalIterations) {
        setDisplayText(originalText);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, duration / totalIterations);
  };

  return (
    <span ref={elementRef} className={className}>
      {displayText}
    </span>
  );
}