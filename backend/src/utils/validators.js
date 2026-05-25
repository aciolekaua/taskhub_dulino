// Utilitários de validação — usados em controllers e testes

/**
 * Valida se um email tem formato correto
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Regex baseado em RFC 5322 simplificado
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida se todos os campos obrigatórios estão presentes e não vazios
 * @param {string[]} fields - Lista de campos obrigatórios
 * @param {object} body - Corpo da requisição
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredFields(fields, body) {
  const missing = fields.filter(
    (field) => !body[field] || String(body[field]).trim() === ''
  );
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Valida força mínima da senha (mínimo 6 caracteres)
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

/**
 * Sanitiza uma string removendo espaços extras
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
}
