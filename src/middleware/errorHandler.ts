import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';

/**
 * Interfaz para errores personalizados
 */
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Tipos de errores conocidos
 */
export enum ErrorTypes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}

/**
 * Crear un error personalizado
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  error.isOperational = true;
  return error;
};

/**
 * Crear error de validación
 */
export const createValidationError = (message: string, details?: any): CustomError => {
  return createError(message, 400, ErrorTypes.VALIDATION_ERROR, details);
};

/**
 * Crear error de recurso no encontrado
 */
export const createNotFoundError = (resource: string, id?: string): CustomError => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return createError(message, 404, ErrorTypes.NOT_FOUND);
};

/**
 * Crear error de duplicado
 */
export const createDuplicateError = (resource: string, field?: string): CustomError => {
  const message = field 
    ? `${resource} with this ${field} already exists` 
    : `${resource} already exists`;
  return createError(message, 409, ErrorTypes.DUPLICATE_ERROR);
};

/**
 * Determinar si es un error de desarrollo o producción
 */
const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Registrar error en consola/logs
 */
const logError = (error: CustomError | Error, req: Request): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';

  console.error(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════
║ ERROR OCCURRED
╠══════════════════════════════════════════════════════════════════════════════════════════════════
║ Timestamp: ${timestamp}
║ Method:    ${method}
║ URL:       ${url}
║ IP:        ${ip}
║ User-Agent: ${userAgent}
║ Message:   ${error.message}
║ Stack:     ${error.stack}
╚══════════════════════════════════════════════════════════════════════════════════════════════════
  `);
};

/**
 * Manejar errores específicos de Bun/Node.js
 */
const handleSystemErrors = (error: any): CustomError => {
  // Error de parsing JSON
  if (error.type === 'entity.parse.failed' || error.name === 'SyntaxError') {
    return createError('Invalid JSON format', 400, ErrorTypes.BAD_REQUEST);
  }

  // Error de payload muy grande
  if (error.type === 'entity.too.large') {
    return createError('Request payload too large', 413, 'PAYLOAD_TOO_LARGE');
  }

  // Error de timeout
  if (error.code === 'ETIMEDOUT') {
    return createError('Request timeout', 408, 'REQUEST_TIMEOUT');
  }

  // Error de conexión
  if (error.code === 'ECONNREFUSED') {
    return createError('Service unavailable', 503, 'SERVICE_UNAVAILABLE');
  }

  return error;
};

/**
 * Middleware de manejo global de errores
 */
export const errorHandler = (
  error: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si ya se envió una respuesta, delegar al manejador de errores por defecto de Express
  if (res.headersSent) {
    next(error);
    return;
  }

  // Procesar errores del sistema
  const processedError = handleSystemErrors(error) as CustomError;

  // Determinar código de estado
  const statusCode = processedError.statusCode || 500;
  
  // Determinar código de error
  const errorCode = processedError.code || (statusCode >= 500 ? ErrorTypes.INTERNAL_ERROR : ErrorTypes.BAD_REQUEST);

  // Registrar error
  logError(processedError, req);

  // Preparar mensaje de error
  let errorMessage = processedError.message;
  let errorDetails = processedError.details;

  // En producción, ocultar detalles de errores internos
  if (!isDevelopment() && statusCode >= 500) {
    errorMessage = 'Internal server error';
    errorDetails = undefined;
  }

  // Agregar información adicional en desarrollo
  if (isDevelopment()) {
    errorDetails = {
      ...errorDetails,
      stack: processedError.stack,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  // Enviar respuesta de error
  sendError(res, errorMessage, statusCode, errorCode, errorDetails);
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = createNotFoundError('Route', req.originalUrl);
  next(error);
};

/**
 * Manejador de errores no capturados
 */
export const setupGlobalErrorHandlers = (): void => {
  // Manejar promesas rechazadas no capturadas
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // En producción, podrías querer cerrar el proceso gracefully
    if (!isDevelopment()) {
      process.exit(1);
    }
  });

  // Manejar excepciones no capturadas
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // En producción, cerrar el proceso
    if (!isDevelopment()) {
      process.exit(1);
    }
  });

  // Manejar señales de terminación
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
  });
};