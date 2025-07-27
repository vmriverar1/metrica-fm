'use client';

import { useEffect } from 'react';

export default function TestGSAP() {
  useEffect(() => {
    console.log('TestGSAP component mounted');
  }, []);
  
  return <div>Test GSAP Component</div>;
}