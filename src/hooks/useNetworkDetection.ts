'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkConditions {
  speed: 'slow' | 'medium' | 'fast' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | 'unknown';
  downlink: number;
  rtt: number;
  isOnline: boolean;
  isSlowConnection: boolean;
  recommendedTimeout: number;
  recommendedRetryCount: number;
}

export const useNetworkDetection = () => {
  // Devolver valores estáticos básicos sin detección activa
  return {
    speed: 'fast' as const,
    effectiveType: '4g' as const,
    downlink: 10,
    rtt: 100,
    isOnline: true,
    isSlowConnection: false,
    recommendedTimeout: 5000,
    recommendedRetryCount: 2
  };
};