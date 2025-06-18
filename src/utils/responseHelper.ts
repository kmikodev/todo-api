import { Response } from 'express';

/**
 * Interfaz para respuestas exitosas
 */
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

/**
 * Interfaz para respuestas de error
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
  };
}

/**
 * Helper para respuestas exitosas
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: Partial<SuccessResponse['meta']>
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Helper para respuestas de error
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: code || getErrorCodeFromStatus(statusCode),
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Helper para respuesta de recurso creado
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Helper para respuesta de recurso no encontrado
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return sendError(res, message, 404, 'NOT_FOUND');
};

/**
 * Helper para respuesta de datos inválidos
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Invalid request data',
  details?: any
): Response => {
  return sendError(res, message, 400, 'BAD_REQUEST', details);
};

/**
 * Helper para respuesta de conflicto
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): Response => {
  return sendError(res, message, 409, 'CONFLICT');
};

/**
 * Helper para respuesta de error interno del servidor
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error',
  details?: any
): Response => {
  return sendError(res, message, 500, 'INTERNAL_ERROR', details);
};

/**
 * Helper para respuestas paginadas
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
  message?: string
): Response => {
  return sendSuccess(res, data, message, 200, {
    total,
    page,
    limit
  });
};

/**
 * Obtener código de error basado en el status HTTP
 */
const getErrorCodeFromStatus = (statusCode: number): string => {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    500: 'INTERNAL_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE'
  };

  return codes[statusCode] || 'UNKNOWN_ERROR';
};