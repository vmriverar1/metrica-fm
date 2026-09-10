/**
 * Constantes de la sesión de desarrollo.
 *
 * El navegador produce estos valores y el servidor los acepta, así que tienen que ser el mismo
 * literal a ambos lados de la frontera. Vivían copiados en cuatro módulos: cambiar uno y olvidar
 * otro no rompe la compilación, solo deja de autenticar en desarrollo sin decir por qué.
 *
 * El middleware solo los honra cuando NODE_ENV === 'development'.
 */
export const DEV_SESSION_TOKEN = 'mock-token';
export const DEV_SESSION_ID = 'mock-session';
