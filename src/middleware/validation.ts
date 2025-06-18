import { Request, Response, NextFunction } from 'express';
import { 
  validateTask, 
  validateTaskId as validateTaskIdUtil, // ← Cambiar nombre para evitar conflicto
  validatePagination, 
  validateEnum,
  sanitizeString
} from '../utils/validators';
import { sendBadRequest } from '../utils/responseHelper';

/**
 * Middleware para validar el ID de una task
 */
export const validateTaskId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id) {
    sendBadRequest(res, 'Task ID is required');
    return;
  }

  // Usar la función renombrada del utils
  const validation = validateTaskIdUtil(id, 'Task ID');

  if (!validation.isValid) {
    sendBadRequest(res, validation.errors[0]);
    return;
  }

  next();
};

/**
 * Middleware para validar arrays de IDs (operaciones en lote)
 */
export const validateBulkIds = (req: Request, res: Response, next: NextFunction): void => {
  const { ids } = req.body;

  if (!ids) {
    sendBadRequest(res, 'ids array is required');
    return;
  }

  if (!Array.isArray(ids)) {
    sendBadRequest(res, 'ids must be an array');
    return;
  }

  if (ids.length === 0) {
    sendBadRequest(res, 'ids array cannot be empty');
    return;
  }

  if (ids.length > 100) {
    sendBadRequest(res, 'Cannot process more than 100 items at once');
    return;
  }

  const errors: string[] = [];

  ids.forEach((id, index) => {
    const validation = validateTaskIdUtil(id, `ID at position ${index}`);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
  });

  if (errors.length > 0) {
    sendBadRequest(res, 'Invalid IDs in array', { errors });
    return;
  }

  next();
};


/**
 * Middleware para validar la creación de una task
 */
export const validateTaskCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, completed, priority, dueDate } = req.body;

  // Validar que el body no esté vacío
  if (!req.body || Object.keys(req.body).length === 0) {
    sendBadRequest(res, 'Request body is required');
    return;
  }

  // Validar que al menos el título esté presente
  if (!title) {
    sendBadRequest(res, 'title is required');
    return;
  }

  // Crear objeto para validar
  const taskToValidate = {
    title,
    description,
    completed,
    priority,
    dueDate
  };

  // Validar usando la función del utils
  const validation = validateTask(taskToValidate);

  if (!validation.isValid) {
    sendBadRequest(res, 'Validation failed', { errors: validation.errors });
    return;
  }

  // Sanitizar strings
  if (title) req.body.title = sanitizeString(title);
  if (description) req.body.description = sanitizeString(description);

  next();
};

/**
 * Middleware para validar la actualización de una task
 */
export const validateTaskUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, completed, priority, dueDate } = req.body;

  // Validar que el body no esté vacío
  if (!req.body || Object.keys(req.body).length === 0) {
    sendBadRequest(res, 'Request body is required - at least one field must be provided');
    return;
  }

  // Crear objeto solo con los campos presentes
  const taskToValidate: any = {};
  if (title !== undefined) taskToValidate.title = title;
  if (description !== undefined) taskToValidate.description = description;
  if (completed !== undefined) taskToValidate.completed = completed;
  if (priority !== undefined) taskToValidate.priority = priority;
  if (dueDate !== undefined) taskToValidate.dueDate = dueDate;

  // Validar usando la función del utils
  const validation = validateTask(taskToValidate);

  if (!validation.isValid) {
    sendBadRequest(res, 'Validation failed', { errors: validation.errors });
    return;
  }

  // Sanitizar strings si están presentes
  if (title) req.body.title = sanitizeString(title);
  if (description) req.body.description = sanitizeString(description);

  next();
};

/**
 * Middleware para validar parámetros de query (filtros, paginación, etc.)
 */
export const validateQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  const { 
    completed, 
    priority, 
    sortBy, 
    sortOrder, 
    page, 
    limit, 
    search,
    dueDateFrom,  // 
    dueDateTo     // 
  } = req.query;
  
  const errors: string[] = [];

  // Validar completed
  if (completed !== undefined && !['true', 'false'].includes(completed as string)) {
    errors.push('completed must be true or false');
  }

  // Validar priority
  if (priority !== undefined) {
    const priorityValidation = validateEnum(priority, 'priority', ['low', 'medium', 'high']);
    if (!priorityValidation.isValid) {
      errors.push(...priorityValidation.errors);
    }
  }

  // Validar sortBy
  if (sortBy !== undefined) {
    const sortByValidation = validateEnum(sortBy, 'sortBy', ['createdAt', 'updatedAt', 'title', 'dueDate']);
    if (!sortByValidation.isValid) {
      errors.push(...sortByValidation.errors);
    }
  }

  // Validar sortOrder
  if (sortOrder !== undefined) {
    const sortOrderValidation = validateEnum(sortOrder, 'sortOrder', ['asc', 'desc']);
    if (!sortOrderValidation.isValid) {
      errors.push(...sortOrderValidation.errors);
    }
  }

  // Validar paginación
  const paginationValidation = validatePagination(page, limit);
  if (!paginationValidation.isValid) {
    errors.push(...paginationValidation.errors);
  }

  // Validar search term
  if (search !== undefined) {
    if (typeof search !== 'string') {
      errors.push('search must be a string');
    } else if ((search as string).trim().length === 0) {
      errors.push('search cannot be empty');
    } else if ((search as string).length > 100) {
      errors.push('search term cannot exceed 100 characters');
    }
  }

  // : Validar dueDateFrom
  if (dueDateFrom !== undefined) {
    if (typeof dueDateFrom !== 'string') {
      errors.push('dueDateFrom must be a valid date string');
    } else {
      const fromDate = new Date(dueDateFrom as string);
      if (isNaN(fromDate.getTime())) {
        errors.push('dueDateFrom must be a valid date format (ISO 8601)');
      }
    }
  }

  // : Validar dueDateTo
  if (dueDateTo !== undefined) {
    if (typeof dueDateTo !== 'string') {
      errors.push('dueDateTo must be a valid date string');
    } else {
      const toDate = new Date(dueDateTo as string);
      if (isNaN(toDate.getTime())) {
        errors.push('dueDateTo must be a valid date format (ISO 8601)');
      }
    }
  }

  // : Validar que dueDateFrom no sea posterior a dueDateTo
  if (dueDateFrom && dueDateTo) {
    const fromDate = new Date(dueDateFrom as string);
    const toDate = new Date(dueDateTo as string);
    
    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      if (fromDate > toDate) {
        errors.push('dueDateFrom cannot be later than dueDateTo');
      }
    }
  }

  if (errors.length > 0) {
    sendBadRequest(res, 'Query parameter validation failed', { errors });
    return;
  }

  // Sanitizar search si está presente
  if (search && typeof search === 'string') {
    req.query.search = sanitizeString(search);
  }

  next();
};
/**
 * Middleware para validar parámetros de URL específicos
 */
export const validateUrlParams = (req: Request, res: Response, next: NextFunction): void => {
  const { priority, status, term } = req.params;
  const errors: string[] = [];

  // Validar priority en la URL
  if (priority !== undefined) {
    const priorityValidation = validateEnum(priority, 'priority', ['low', 'medium', 'high']);
    if (!priorityValidation.isValid) {
      errors.push(...priorityValidation.errors);
    }
  }

  // Validar status en la URL
  if (status !== undefined) {
    if (!['true', 'false'].includes(status)) {
      errors.push('status must be true or false');
    }
  }

  // Validar term en la URL
  if (term !== undefined) {
    if (typeof term !== 'string' || term.trim().length === 0) {
      errors.push('search term cannot be empty');
    } else if (term.length > 100) {
      errors.push('search term cannot exceed 100 characters');
    }
  }

  if (errors.length > 0) {
    sendBadRequest(res, 'URL parameter validation failed', { errors });
    return;
  }

  // Sanitizar term si está presente
  if (term) {
    req.params.term = sanitizeString(term);
  }

  next();
};

/**
 * Middleware para validar datos específicos de prioridad
 */
export const validatePriorityUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { priority } = req.body;

  if (!priority) {
    sendBadRequest(res, 'priority is required');
    return;
  }

  const validation = validateEnum(priority, 'priority', ['low', 'medium', 'high']);

  if (!validation.isValid) {
    sendBadRequest(res, validation.errors[0]);
    return;
  }

  next();
};

/**
 * Middleware para validar fecha de vencimiento
 */
export const validateDueDateUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { dueDate } = req.body;

  // dueDate puede ser null para remover la fecha
  if (dueDate === null || dueDate === undefined) {
    next();
    return;
  }

  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    sendBadRequest(res, 'dueDate must be a valid date or null');
    return;
  }

  next();
};

/**
 * Middleware general para sanitizar todos los strings del body
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

/**
 * Middleware para limitar el tamaño del body de la request
 */
export const validateBodySize = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.get('content-length');
  
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
    sendBadRequest(res, 'Request body too large (max 1MB)');
    return;
  }

  next();
};

/**
 * Middleware para validar Content-Type en requests POST/PUT/PATCH
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      sendBadRequest(res, 'Content-Type must be application/json');
      return;
    }
  }

  next();
};