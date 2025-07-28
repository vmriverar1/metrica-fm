import localFont from 'next/font/local';

// Marsek Demi para títulos principales del hero
export const marsekDemi = localFont({
  src: '../fonts/Marsek-Demi.ttf',
  display: 'swap',
  variable: '--font-marsek-demi',
  weight: '600',
});

// Alliance No.2 - Light para información y detalles
export const allianceLight = localFont({
  src: '../fonts/Alliance No.2 Light.otf',
  display: 'swap',
  variable: '--font-alliance-light',
  weight: '300',
});

// Alliance No.2 - Medium para párrafos y texto regular
export const allianceMedium = localFont({
  src: '../fonts/Alliance No.2 Medium.otf',
  display: 'swap',
  variable: '--font-alliance-medium',
  weight: '500',
});

// Alliance No.2 - ExtraBold para títulos secundarios y CTAs
export const allianceExtraBold = localFont({
  src: '../fonts/Alliance No.2 ExtraBold.otf',
  display: 'swap',
  variable: '--font-alliance-extrabold',
  weight: '800',
});