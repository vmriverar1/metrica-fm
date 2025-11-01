/**
 * Google reCAPTCHA v3 Configuration
 * Lee las credenciales desde las variables de entorno (apphosting.yaml)
 */

export const RECAPTCHA_CONFIG = {
  // Site Key (pública) - Se usa en el frontend
  // Viene de apphosting.yaml: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc13_0rAAAAAGtNImO3exEbFVFpJfnopbGM-sp3',

  // Secret Key (privada) - Solo se usa en el backend
  // Viene de apphosting.yaml: RECAPTCHA_SECRET_KEY
  SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '6Lc13_0rAAAAAPDUaL3hu4pOfscis5btWkyDbQLd',

  // Score mínimo para considerar una interacción como humana (0.0 a 1.0)
  // Valores recomendados: 0.5 (permisivo) a 0.7 (restrictivo)
  MIN_SCORE: 0.5,

  // URL de verificación de Google
  VERIFY_URL: 'https://www.google.com/recaptcha/api/siteverify'
} as const;

export default RECAPTCHA_CONFIG;
