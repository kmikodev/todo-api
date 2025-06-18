/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validar que un valor no esté vacío
 */
export const isRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que un string tenga una longitud mínima y máxima
 */
export const validateStringLength = (
  value: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { isValid: false, errors };
  }
  
  const trimmedValue = value.trim();
  
  if (trimmedValue.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (trimmedValue.length > maxLength) {
    errors.push(`${fieldName} must not exceed ${maxLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que un valor sea un booleano
 */
export const validateBoolean = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof value !== 'boolean') {
    errors.push(`${fieldName} must be a boolean value`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que un valor sea un número
 */
export const validateNumber = (
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
    return { isValid: false, errors };
  }
  
  if (min !== undefined && value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && value > max) {
    errors.push(`${fieldName} must not exceed ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que una fecha sea válida
 */
export const validateDate = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} must be a valid date`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


/**
 * Validar que un ID sea válido (UUID o MongoDB ObjectId)
 */
export const validateTaskId = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${fieldName} must be a valid ID`);
    return { isValid: false, errors };
  }

  // Regex para UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Regex para MongoDB ObjectId
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  // Validar si es UUID o ObjectId
  if (!uuidRegex.test(value) && !objectIdRegex.test(value)) {
    errors.push(`${fieldName} must be a valid UUID or ObjectId`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Mantener la función original para casos específicos
export const validateUUID = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    errors.push(`${fieldName} must be a valid UUID`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que un email sea válido
 */
export const validateEmail = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (typeof value !== 'string' || !emailRegex.test(value)) {
    errors.push(`${fieldName} must be a valid email address`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar que un valor esté en una lista de opciones válidas
 */
export const validateEnum = <T>(
  value: any,
  fieldName: string,
  validOptions: T[]
): ValidationResult => {
  const errors: string[] = [];
  
  if (!validOptions.includes(value)) {
    errors.push(`${fieldName} must be one of: ${validOptions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar múltiples campos y combinar errores
 */
export const validateFields = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(validation => validation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

/**
 * Validar un objeto task completo
 */
export const validateTask = (task: any): ValidationResult => {
  const validations: ValidationResult[] = [];
  
  // Validar título
  if (task.title !== undefined) {
    validations.push(isRequired(task.title, 'title'));
    if (task.title) {
      validations.push(validateStringLength(task.title, 'title', 1, 200));
    }
  }
  
  // Validar descripción (opcional)
  if (task.description !== undefined && task.description !== null) {
    validations.push(validateStringLength(task.description, 'description', 0, 1000));
  }
  
  // Validar completed (opcional)
  if (task.completed !== undefined) {
    validations.push(validateBoolean(task.completed, 'completed'));
  }
  
  // Validar priority (opcional)
  if (task.priority !== undefined) {
    validations.push(validateEnum(task.priority, 'priority', ['low', 'medium', 'high']));
  }
  
  // Validar dueDate (opcional)
  if (task.dueDate !== undefined && task.dueDate !== null) {
    validations.push(validateDate(task.dueDate, 'dueDate'));
  }
  
  return validateFields(...validations);
};

/**
 * Sanitizar string (remover espacios y caracteres peligrosos)
 */
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') return '';
  
  return value
    .trim()
    .replace(/[<>]/g, '') // Remover < y > para evitar XSS básico
    .slice(0, 1000); // Limitar longitud máxima
};

/**
 * Validar parámetros de paginación
 */
export const validatePagination = (
  page: any,
  limit: any
): ValidationResult & { page: number; limit: number } => {
  const errors: string[] = [];
  let validPage = 1;
  let validLimit = 10;
  
  // Validar page
  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('page must be a positive integer');
    } else {
      validPage = pageNum;
    }
  }
  
  // Validar limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('limit must be a positive integer between 1 and 100');
    } else {
      validLimit = limitNum;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    page: validPage,
    limit: validLimit
  };
};