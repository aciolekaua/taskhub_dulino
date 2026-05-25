// Testes unitários dos utilitários (validators.js e helpers.js)

import { validateEmail, validateRequiredFields, validatePassword, sanitizeString } from '../src/utils/validators.js';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../src/utils/helpers.js';

// ═══════════════════════════════════════════════
// Testes de validators.js
// ═══════════════════════════════════════════════

describe('validateEmail', () => {
  test('deve aceitar email válido', () => {
    expect(validateEmail('usuario@example.com')).toBe(true);
    expect(validateEmail('nome.sobrenome@dominio.com.br')).toBe(true);
    expect(validateEmail('user+tag@email.org')).toBe(true);
  });

  test('deve rejeitar email inválido', () => {
    expect(validateEmail('nao-e-email')).toBe(false);
    expect(validateEmail('@dominio.com')).toBe(false);
    expect(validateEmail('usuario@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

describe('validateRequiredFields', () => {
  test('deve retornar valid:true quando todos os campos estão presentes', () => {
    const result = validateRequiredFields(['name', 'email'], { name: 'João', email: 'j@j.com' });
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('deve retornar valid:false com campos faltando', () => {
    const result = validateRequiredFields(['name', 'email', 'password'], { name: 'João' });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('email');
    expect(result.missing).toContain('password');
  });

  test('deve rejeitar campos com string vazia', () => {
    const result = validateRequiredFields(['title'], { title: '   ' });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('title');
  });

  test('deve retornar valid:true com todos os campos presentes', () => {
    const result = validateRequiredFields([], {});
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
});

describe('validatePassword', () => {
  test('deve aceitar senha com 6 ou mais caracteres', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('senhaForte123!')).toBe(true);
  });

  test('deve rejeitar senha com menos de 6 caracteres', () => {
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
  });
});

describe('sanitizeString', () => {
  test('deve remover espaços extras', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('texto normal')).toBe('texto normal');
  });

  test('deve retornar string vazia para valores inválidos', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });
});

// ═══════════════════════════════════════════════
// Testes de helpers.js (JWT e bcrypt)
// ═══════════════════════════════════════════════

describe('generateToken e verifyToken', () => {
  test('deve gerar e verificar token válido', () => {
    const payload = { id: 1, email: 'test@test.com' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT tem 3 partes

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  test('deve lançar erro para token inválido', () => {
    expect(() => verifyToken('token.invalido.aqui')).toThrow();
  });

  test('deve lançar erro para token vazio', () => {
    expect(() => verifyToken('')).toThrow();
  });
});

describe('hashPassword e comparePassword', () => {
  test('deve gerar hash diferente da senha original', async () => {
    const senha = 'minhasenha123';
    const hash = await hashPassword(senha);

    expect(hash).not.toBe(senha);
    expect(hash).toMatch(/^\$2[ab]\$/); // Formato bcrypt
  });

  test('deve validar senha corretamente com o hash', async () => {
    const senha = 'senhaCorreta123';
    const hash = await hashPassword(senha);

    const correto = await comparePassword(senha, hash);
    const incorreto = await comparePassword('senhaErrada', hash);

    expect(correto).toBe(true);
    expect(incorreto).toBe(false);
  });
});
