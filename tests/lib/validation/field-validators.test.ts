import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateCompany,
  validateForm,
} from '@/lib/validation/field-validators';

describe('validateName', () => {
  it('acepta nombres reales, con tildes y compuestos', () => {
    expect(validateName('Juan Pérez').valid).toBe(true);
    expect(validateName('María José').valid).toBe(true);
    expect(validateName('Ana-Lucía Ñuñez').valid).toBe(true);
  });

  it('rechaza vacío o no-string', () => {
    expect(validateName('').valid).toBe(false);
    expect(validateName(null as unknown as string).valid).toBe(false);
  });

  it('exige entre 2 y 50 caracteres', () => {
    expect(validateName('A').valid).toBe(false);
    expect(validateName('A'.repeat(51)).valid).toBe(false);
  });

  it('rechaza números y símbolos', () => {
    expect(validateName('Juan123').valid).toBe(false);
    expect(validateName('Juan@Perez').valid).toBe(false);
  });

  it('rechaza un solo carácter repetido', () => {
    expect(validateName('aaaa').valid).toBe(false);
  });

  it('rechaza nombres de prueba conocidos', () => {
    expect(validateName('test').valid).toBe(false);
    expect(validateName('asdf').valid).toBe(false);
  });

  it('devuelve un mensaje de error cuando falla', () => {
    const r = validateName('');
    expect(r.valid).toBe(false);
    expect(typeof r.error).toBe('string');
    expect(r.error!.length).toBeGreaterThan(0);
  });
});

describe('validateEmail', () => {
  it('acepta emails válidos', () => {
    expect(validateEmail('juan.perez@empresa.com').valid).toBe(true);
    expect(validateEmail('contacto@metrica-dip.com').valid).toBe(true);
  });

  it('normaliza mayúsculas y espacios', () => {
    expect(validateEmail('  JUAN@EMPRESA.COM  ').valid).toBe(true);
  });

  it('rechaza formatos inválidos', () => {
    expect(validateEmail('sin-arroba.com').valid).toBe(false);
    expect(validateEmail('doble@@arroba.com').valid).toBe(false);
    expect(validateEmail('@sinusuario.com').valid).toBe(false);
  });

  it('rechaza vacío', () => {
    expect(validateEmail('').valid).toBe(false);
  });

  it('rechaza emails de más de 254 caracteres', () => {
    expect(validateEmail('a'.repeat(250) + '@x.com').valid).toBe(false);
  });

  it('rechaza dominios con TLD desconocido', () => {
    expect(validateEmail('juan@empresa.noexiste').valid).toBe(false);
  });

  it('rechaza direcciones de prueba', () => {
    expect(validateEmail('test@test.com').valid).toBe(false);
  });
});

describe('validatePhone', () => {
  it('acepta un móvil peruano de 9 dígitos', () => {
    expect(validatePhone('987412563').valid).toBe(true);
  });

  it('acepta formato internacional con separadores', () => {
    expect(validatePhone('+51 987-412-563').valid).toBe(true);
  });

  it('rechaza vacío o sin dígitos', () => {
    expect(validatePhone('').valid).toBe(false);
    expect(validatePhone('abc').valid).toBe(false);
  });

  it('exige entre 9 y 15 dígitos', () => {
    expect(validatePhone('12345678').valid).toBe(false);
    expect(validatePhone('1234567890123456').valid).toBe(false);
  });

  it('rechaza todos los dígitos iguales', () => {
    expect(validatePhone('999999999').valid).toBe(false);
  });

  it('rechaza secuencias consecutivas', () => {
    expect(validatePhone('123456789').valid).toBe(false);
    expect(validatePhone('987654321').valid).toBe(false);
  });

  it('exige al menos 4 dígitos diferentes', () => {
    expect(validatePhone('121212121').valid).toBe(false);
  });
});

describe('validateCompany', () => {
  it('es opcional: acepta vacío', () => {
    expect(validateCompany('').valid).toBe(true);
    expect(validateCompany('   ').valid).toBe(true);
  });

  it('acepta un nombre de empresa real', () => {
    expect(validateCompany('Métrica DIP S.A.C.').valid).toBe(true);
  });

  it('exige al menos 2 caracteres cuando se informa', () => {
    expect(validateCompany('A').valid).toBe(false);
  });

  it('rechaza más de 100 caracteres', () => {
    expect(validateCompany('A'.repeat(101)).valid).toBe(false);
  });
});

describe('validateForm', () => {
  it('no devuelve errores con datos válidos', () => {
    const errores = validateForm({
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      phone: '987412563',
    });
    expect(Object.keys(errores)).toHaveLength(0);
  });

  it('acumula un error por cada campo inválido', () => {
    const errores = validateForm({
      name: '',
      email: 'no-es-email',
      phone: '111111111',
    });
    expect(Object.keys(errores).length).toBeGreaterThanOrEqual(3);
    expect(errores.name).toBeTruthy();
    expect(errores.email).toBeTruthy();
    expect(errores.phone).toBeTruthy();
  });
});
