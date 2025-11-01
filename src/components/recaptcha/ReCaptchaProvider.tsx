'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';
import RECAPTCHA_CONFIG from '@/lib/recaptcha-config';

interface ReCaptchaProviderProps {
  children: ReactNode;
}

export default function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_CONFIG.SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
