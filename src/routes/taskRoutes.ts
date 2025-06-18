// routes/taskRoutes.ts - Rutas actualizadas

import { Router } from 'express';
import { taskController } from '../controllers/TaskController';
import { 
  validateTaskCreation, 
  validateTaskUpdate, 
  validateTaskId, 
  validateQueryParams,
  validateUrlParams,
  validateBulkIds,
  validatePriorityUpdate,
  validateDueDateUpdate
} from '../middleware/validation';

const taskRoutes = Router();

/**
 * ⚠️ IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
 * para evitar conflictos de routing
 */

// Rutas específicas primero (sin parámetros)
taskRoutes.get('/stats', taskController.getTaskStats);
taskRoutes.get('/daily-summary', taskController.getDailySummary);
taskRoutes.get('/overdue', validateQueryParams, taskController.getOverdueTasks);
taskRoutes.get('/due-today', validateQueryParams, taskController.getTasksDueToday);

// ✅ NUEVAS RUTAS: Filtros de fecha específicos
taskRoutes.get('/due-this-week', validateQueryParams, taskController.getTasksDueThisWeek);
taskRoutes.get('/due-next-week', validateQueryParams, taskController.getTasksDueNextWeek);
taskRoutes.get('/due-this-month', validateQueryParams, taskController.getTasksDueThisMonth);
taskRoutes.get('/date-range', validateQueryParams, taskController.getTasksByDateRange);

// Rutas de operaciones en lote
taskRoutes.post('/bulk/complete', validateBulkIds, taskController.bulkCompleteTask);
taskRoutes.post('/bulk/delete', validateBulkIds, taskController.bulkDeleteTasks);
taskRoutes.delete('/bulk/completed', taskController.deleteCompletedTasks);

// Rutas de búsqueda con parámetros
taskRoutes.get('/search/:term', validateUrlParams, validateQueryParams, taskController.searchTasks);
taskRoutes.get('/priority/:priority', validateUrlParams, validateQueryParams, taskController.getTasksByPriority);
taskRoutes.get('/completed/:status', validateUrlParams, validateQueryParams, taskController.getTasksByStatus);

// Rutas básicas CRUD
taskRoutes.get('/', validateQueryParams, taskController.getTasks);
taskRoutes.post('/', validateTaskCreation, taskController.createTask);

// Rutas con ID específico (deben ir al final)
taskRoutes.get('/:id', validateTaskId, taskController.getTaskById);
taskRoutes.put('/:id', validateTaskId, validateTaskUpdate, taskController.updateTask);
taskRoutes.patch('/:id', validateTaskId, validateTaskUpdate, taskController.updateTask);
taskRoutes.delete('/:id', validateTaskId, taskController.deleteTask);

// Rutas de acciones específicas con ID
taskRoutes.patch('/:id/complete', validateTaskId, taskController.completeTask);
taskRoutes.patch('/:id/incomplete', validateTaskId, taskController.incompleteTask);
taskRoutes.patch('/:id/priority', validateTaskId, validatePriorityUpdate, taskController.updateTaskPriority);
taskRoutes.patch('/:id/due-date', validateTaskId, validateDueDateUpdate, taskController.updateTaskDueDate);
taskRoutes.post('/:id/duplicate', validateTaskId, taskController.duplicateTask);

export { taskRoutes };