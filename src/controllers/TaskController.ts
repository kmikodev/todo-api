import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendPaginated,
  sendInternalError
} from '../utils/responseHelper';
import { TaskQueryOptions } from '../models/Task';

/**
 * Controlador para operaciones con tasks
 * Actualizado para usar la nueva arquitectura Repository + Service
 */
class TaskController {
  /**
   * GET /api/tasks
   * Obtener todas las tasks con filtros y paginación
   */
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: TaskQueryOptions = {
        completed: req.query.completed ? req.query.completed === 'true' : undefined,
        priority: req.query.priority as 'low' | 'medium' | 'high' | undefined,
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);
      console.log('Tasks retrieved:', result.data.length, 'Total:', result.meta.total);
      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Tasks retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   * Obtener una task específica por ID
   */
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      if (!task) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, task, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks
   * Crear una nueva task
   */
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData = req.body;
      const newTask = await taskService.createTask(taskData);

      sendCreated(res, newTask, 'Task created successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        sendBadRequest(res, error.message);
        return;
      }
      next(error);
    }
  }

  /**
   * PUT/PATCH /api/tasks/:id
   * Actualizar una task
   */
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedTask = await taskService.updateTask(id, updates);

      if (!updatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, updatedTask, 'Task updated successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        sendBadRequest(res, error.message);
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Eliminar una task
   */
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await taskService.deleteTask(id);

      if (!deleted) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, { id }, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/stats
   * Obtener estadísticas de las tasks
   */
  async getTaskStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await taskService.getTaskStatistics();
      sendSuccess(res, stats, 'Task statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/complete
   * Marcar una task como completada
   */
  async completeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updatedTask = await taskService.updateTask(id, { completed: true });

      if (!updatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, updatedTask, 'Task marked as completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/incomplete
   * Marcar una task como no completada
   */
  async incompleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updatedTask = await taskService.updateTask(id, { completed: false });

      if (!updatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, updatedTask, 'Task marked as incomplete');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/bulk/complete
   * Marcar múltiples tasks como completadas
   */
  async bulkCompleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        sendBadRequest(res, 'ids must be a non-empty array of task IDs');
        return;
      }

      const updatedTasks = await taskService.bulkCompleteTask(ids);
      sendSuccess(res, updatedTasks, `${updatedTasks.length} tasks marked as completed`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/bulk/completed
   * Eliminar todas las tasks completadas
   */
  async deleteCompletedTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deletedCount = await taskService.deleteCompletedTasks();
      sendSuccess(res, { deletedCount }, `${deletedCount} completed tasks deleted`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/bulk/delete
   * Eliminar múltiples tasks
   */
  async bulkDeleteTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        sendBadRequest(res, 'ids must be a non-empty array of task IDs');
        return;
      }

      const deletedCount = await taskService.bulkDeleteTasks(ids);
      sendSuccess(res, { deletedCount }, `${deletedCount} tasks deleted`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/search/:term
   * Buscar tasks por término específico
   */
  async searchTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { term } = req.params;
      const options: TaskQueryOptions = {
        search: term,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        `Search results for "${term}"`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/priority/:priority
   * Obtener tasks por prioridad específica
   */
  async getTasksByPriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priority } = req.params;
      const options: TaskQueryOptions = {
        priority: priority as 'low' | 'medium' | 'high',
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        `Tasks with ${priority} priority`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/completed/:status
   * Obtener tasks por estado de completado
   */
  async getTasksByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const completed = status === 'true';

      const options: TaskQueryOptions = {
        completed,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        `${completed ? 'Completed' : 'Pending'} tasks`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/overdue
   * Obtener tasks vencidas
   */
  async getOverdueTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: TaskQueryOptions = {
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getOverdueTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Overdue tasks'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/due-today
   * Obtener tasks que vencen hoy
   */
  async getTasksDueToday(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: TaskQueryOptions = {
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getTasksDueToday(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Tasks due today'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/:id/duplicate
   * Duplicar una task existente
   */
  async duplicateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const duplicatedTask = await taskService.duplicateTask(id, title);

      if (!duplicatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendCreated(res, duplicatedTask, 'Task duplicated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/priority
   * Actualizar solo la prioridad de una task
   */
  async updateTaskPriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      if (!['low', 'medium', 'high'].includes(priority)) {
        sendBadRequest(res, 'priority must be one of: low, medium, high');
        return;
      }

      const updatedTask = await taskService.updateTask(id, { priority });

      if (!updatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, updatedTask, 'Task priority updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/due-date
   * Actualizar solo la fecha de vencimiento de una task
   */
  async updateTaskDueDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { dueDate } = req.body;

      const updatedTask = await taskService.updateTask(id, { dueDate });

      if (!updatedTask) {
        sendNotFound(res, `Task with ID ${id} not found`);
        return;
      }

      sendSuccess(res, updatedTask, 'Task due date updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/daily-summary
   * Obtener resumen diario de tasks
   */
  async getDailySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await taskService.getDailySummary();
      sendSuccess(res, summary, 'Daily summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
 * GET /api/tasks/due-this-week
 * Obtener tasks que vencen esta semana
 */
  async getTasksDueThisWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
      endOfWeek.setHours(23, 59, 59, 999);

      const options: TaskQueryOptions = {
        dueDateFrom: startOfWeek,
        dueDateTo: endOfWeek,
        completed: false,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Tasks due this week'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/due-next-week
   * Obtener tasks que vencen la próxima semana
   */
  async getTasksDueNextWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + (7 - today.getDay())); // Próximo domingo
      nextWeekStart.setHours(0, 0, 0, 0);

      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Próximo sábado
      nextWeekEnd.setHours(23, 59, 59, 999);

      const options: TaskQueryOptions = {
        dueDateFrom: nextWeekStart,
        dueDateTo: nextWeekEnd,
        completed: false,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Tasks due next week'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/due-this-month
   * Obtener tasks que vencen este mes
   */
  async getTasksDueThisMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      const options: TaskQueryOptions = {
        dueDateFrom: startOfMonth,
        dueDateTo: endOfMonth,
        completed: false,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        'Tasks due this month'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/date-range
   * Obtener tasks en un rango de fechas específico
   */
  async getTasksByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        sendBadRequest(res, 'startDate and endDate are required');
        return;
      }

      const options: TaskQueryOptions = {
        dueDateFrom: new Date(startDate as string),
        dueDateTo: new Date(endDate as string),
        completed: req.query.completed ? req.query.completed === 'true' : undefined,
        priority: req.query.priority as 'low' | 'medium' | 'high' | undefined,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await taskService.getAllTasks(options);

      sendPaginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        `Tasks between ${startDate} and ${endDate}`
      );
    } catch (error) {
      next(error);
    }
  }
}

// Exportar una instancia singleton
export const taskController = new TaskController();