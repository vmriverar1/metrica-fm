/**
 * Blacklists para validación de formularios
 */

/**
 * Palabras prohibidas en nombres (palabras de prueba/spam comunes)
 */
export const SPAM_NAMES: string[] = [
  'test',
  'testing',
  'prueba',
  'asdf',
  'qwerty',
  'admin',
  'administrator',
  'null',
  'undefined',
  'none',
  'n/a',
  'na',
  'ejemplo',
  'example',
  'sample',
  'demo',
  'user',
  'usuario',
  'aaa',
  'bbb',
  'ccc',
  'xxx',
  'zzz',
  'fake',
  'falso',
  'random',
  'temp',
  'temporal',
  'delete',
  'borrar',
  'remove',
  '123',
  '456',
  '789',
  'abc',
  'xyz',
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet'
];

/**
 * Dominios de email temporal/desechable prohibidos
 */
export const TEMP_EMAIL_DOMAINS: string[] = [
  // Servicios populares de email temporal
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'throwaway.email',
  'maildrop.cc',
  'temp-mail.org',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'yopmail.com',
  'sharklasers.com',
  'spam4.me',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'tmails.net',
  'discard.email',
  'discardmail.com',
  'spamgourmet.com',
  'mailnesia.com',
  'mintemail.com',
  'mytemp.email',
  'mohmal.com',
  'emailondeck.com',
  'fakemailgenerator.com',
  'tempmailaddress.com',
  'throwemail.com',
  'zeroe.ml',
  'tempinbox.com',
  'mailcatch.com',
  'moakt.com',
  'mailnull.com',
  'mailsac.com',
  'emailsensei.com',
  'harakirimail.com',
  'binkmail.com',
  'email60.com',
  'jetable.com',
  'maileater.com',
  'mailexpire.com',
  'mailfreeonline.com',
  'mailmoat.com',
  'mailzi.ru',
  'receiveee.com',
  'spambox.us',
  'tempsky.com',
  'trash-mail.com',
  'trillianpro.com',
  // Dominios claramente de prueba
  'test.com',
  'testing.com',
  'example.com',
  'ejemplo.com',
  'prueba.com',
  'fake.com',
  'spam.com'
];

/**
 * Palabras de spam comunes en mensajes
 */
export const SPAM_MESSAGE_WORDS: string[] = [
  'viagra',
  'cialis',
  'casino',
  'poker',
  'lottery',
  'lotería',
  'pills',
  'pharmacy',
  'farmacia',
  'weight loss',
  'perder peso',
  'click here',
  'haz clic aquí',
  'free money',
  'dinero gratis',
  'earn money',
  'ganar dinero',
  'make money fast',
  'work from home',
  'trabaja desde casa',
  'limited time offer',
  'oferta limitada',
  'act now',
  'actúa ahora',
  'congratulations',
  'felicidades has ganado',
  'you won',
  'ganaste',
  'prize',
  'premio',
  'inheritance',
  'herencia',
  'nigerian prince',
  'príncipe nigeriano',
  'bitcoin investment',
  'inversión bitcoin',
  'crypto',
  'cryptocurrency',
  'binary options',
  'opciones binarias',
  'forex trading',
  'click below',
  'haz clic abajo',
  'no credit check',
  'sin verificación de crédito'
];

/**
 * Palabras prohibidas en nombres de empresa
 */
export const SPAM_COMPANY_NAMES: string[] = [
  'test',
  'testing',
  'prueba',
  'ejemplo',
  'example',
  'sample',
  'demo',
  'empresa test',
  'test company',
  'company test',
  'n/a',
  'na',
  'ninguna',
  'none',
  'null',
  'undefined',
  'xxx',
  'asdf',
  'qwerty',
  'temp',
  'temporal',
  'fake company',
  'empresa falsa'
];

/**
 * Patrones de URLs prohibidas
 */
export const FORBIDDEN_URL_PATTERNS: string[] = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'file://',
  '192.168.',
  '10.0.',
  '172.16.',
  'javascript:',
  'data:',
  'vbscript:'
];

/**
 * TLDs (Top Level Domains) válidos más comunes
 * Para validación de dominios en emails
 */
export const VALID_TLDS: string[] = [
  // Genéricos
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
  'info', 'biz', 'name', 'pro', 'aero', 'coop', 'museum',

  // Latinoamérica
  'pe', 'ar', 'cl', 'co', 'mx', 'br', 'ec', 've', 'bo',
  'py', 'uy', 'gt', 'hn', 'sv', 'ni', 'cr', 'pa',

  // Europa
  'es', 'fr', 'de', 'it', 'uk', 'pt', 'nl', 'be', 'ch',

  // Otros comunes
  'us', 'ca', 'au', 'nz', 'jp', 'cn', 'in', 'ru',

  // Nuevos TLDs populares
  'io', 'ai', 'app', 'dev', 'tech', 'online', 'site', 'website',
  'store', 'shop', 'cloud', 'digital', 'global', 'world'
];
