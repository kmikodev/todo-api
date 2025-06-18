
import { taskService } from '../services';
import { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics } from '../models/Task';
import { createError, createNotFoundError, createDuplicateError } from '../middleware/errorHandler';

/**
 * Facade para operaciones de tasks
 * Actúa como una capa adicional sobre el servicio para casos específicos
 * y mantiene compatibilidad con código existente
 */
class TaskFacade {
  /**
   * Obtener todas las tasks con filtros y paginación
   */
  async getAllTasks(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      // Aplicar valores por defecto y límites
      const queryOptions: TaskQueryOptions = {
        page: options.page || 1,
        limit: Math.min(options.limit || 10, 100), // Máximo 100 por página
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc',
        ...options
      };

      return await taskService.getAllTasks(queryOptions);
    } catch (error) {
      throw createError('Failed to retrieve tasks', 500, 'GET_TASKS_ERROR', error);
    }
  }

  /**
   * Obtener una task por ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await taskService.getTaskById(id);
    } catch (error) {
      throw createError(`Failed to retrieve task with ID ${id}`, 500, 'GET_TASK_ERROR', error);
    }
  }

  /**
   * Crear una nueva task
   */
  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      return await taskService.createTask(taskData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error; // Re-lanzar errores de duplicado
      }
      throw createError('Failed to create task', 500, 'CREATE_TASK_ERROR', error);
    }
  }

  /**
   * Actualizar una task existente
   */
  async updateTask(id: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
      return await taskService.updateTask(id, updates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error; // Re-lanzar errores de duplicado
      }
      throw createError(`Failed to update task with ID ${id}`, 500, 'UPDATE_TASK_ERROR', error);
    }
  }

  /**
   * Eliminar una task
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      return await taskService.deleteTask(id);
    } catch (error) {
      throw createError(`Failed to delete task with ID ${id}`, 500, 'DELETE_TASK_ERROR', error);
    }
  }

  /**
   * Obtener estadísticas de las tasks
   */
  async getTaskStats(): Promise<TaskStatistics> {
    try {
      return await taskService.getTaskStatistics();
    } catch (error) {
      throw createError('Failed to retrieve task statistics', 500, 'GET_STATS_ERROR', error);
    }
  }

  /**
   * Marcar múltiples tasks como completadas
   */
  async bulkCompleteTask(ids: string[]): Promise<Task[]> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createError('IDs array is required and cannot be empty', 400, 'INVALID_INPUT');
      }

      if (ids.length > 100) {
        throw createError('Cannot process more than 100 tasks at once', 400, 'BULK_LIMIT_EXCEEDED');
      }

      return await taskService.bulkCompleteTask(ids);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot process')) {
        throw error;
      }
      throw createError('Failed to complete tasks in bulk', 500, 'BULK_COMPLETE_ERROR', error);
    }
  }

  /**
   * Eliminar todas las tasks completadas
   */
  async deleteCompletedTasks(): Promise<number> {
    try {
      return await taskService.deleteCompletedTasks();
    } catch (error) {
      throw createError('Failed to delete completed tasks', 500, 'DELETE_COMPLETED_ERROR', error);
    }
  }

  /**
   * Eliminar múltiples tasks
   */
  async bulkDeleteTasks(ids: string[]): Promise<number> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createError('IDs array is required and cannot be empty', 400, 'INVALID_INPUT');
      }

      if (ids.length > 100) {
        throw createError('Cannot process more than 100 tasks at once', 400, 'BULK_LIMIT_EXCEEDED');
      }

      return await taskService.bulkDeleteTasks(ids);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot process')) {
        throw error;
      }
      throw createError('Failed to delete tasks in bulk', 500, 'BULK_DELETE_ERROR', error);
    }
  }

  /**
   * Obtener tasks vencidas
   */
  async getOverdueTasks(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      return await taskService.getOverdueTasks(options);
    } catch (error) {
      throw createError('Failed to retrieve overdue tasks', 500, 'GET_OVERDUE_ERROR', error);
    }
  }

  /**
   * Obtener tasks que vencen hoy
   */
  async getTasksDueToday(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      return await taskService.getTasksDueToday(options);
    } catch (error) {
      throw createError('Failed to retrieve tasks due today', 500, 'GET_DUE_TODAY_ERROR', error);
    }
  }

  /**
   * Duplicar una task existente
   */
  async duplicateTask(id: string, newTitle?: string): Promise<Task | null> {
    try {
      return await taskService.duplicateTask(id, newTitle);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError(`Failed to duplicate task with ID ${id}`, 500, 'DUPLICATE_TASK_ERROR', error);
    }
  }

  /**
   * Obtener resumen del día
   */
  async getDailySummary(): Promise<{
    dueToday: number;
    overdue: number;
    completed: number;
    highPriority: number;
    recommendations: string[];
  }> {
    try {
      return await taskService.getDailySummary();
    } catch (error) {
      throw createError('Failed to generate daily summary', 500, 'DAILY_SUMMARY_ERROR', error);
    }
  }

  /**
   * Métodos de conveniencia adicionales para casos específicos
   */

  /**
   * Buscar tasks por título exacto
   */
  async findByExactTitle(title: string): Promise<Task | null> {
    try {
      const result = await this.getAllTasks({ search: title, limit: 1 });
      const exactMatch = result.data.find(task => 
        task.title.toLowerCase() === title.toLowerCase()
      );
      return exactMatch || null;
    } catch (error) {
      throw createError('Failed to find task by exact title', 500, 'FIND_BY_TITLE_ERROR', error);
    }
  }

  /**
   * Obtener tasks próximas a vencer (en los próximos N días)
   */
  async getTasksDueSoon(days: number = 3): Promise<Task[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const result = await this.getAllTasks({
        completed: false,
        dueDateFrom: now,
        dueDateTo: futureDate,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        limit: 100
      });

      return result.data;
    } catch (error) {
      throw createError('Failed to retrieve tasks due soon', 500, 'GET_DUE_SOON_ERROR', error);
    }
  }

  /**
   * Obtener tasks por rango de fechas
   */
  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const result = await this.getAllTasks({
        dueDateFrom: startDate,
        dueDateTo: endDate,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        limit: 100
      });

      return result.data;
    } catch (error) {
      throw createError('Failed to retrieve tasks by date range', 500, 'GET_DATE_RANGE_ERROR', error);
    }
  }

  /**
   * Archivar task (marcar como completada y mover al final)
   */
  async archiveTask(id: string): Promise<Task | null> {
    try {
      return await this.updateTask(id, { 
        completed: true,
        // Se podría agregar un campo 'archived' en el futuro
      });
    } catch (error) {
      throw createError(`Failed to archive task with ID ${id}`, 500, 'ARCHIVE_TASK_ERROR', error);
    }
  }

  /**
   * Cambiar prioridad de múltiples tasks
   */
  async bulkUpdatePriority(ids: string[], priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createError('IDs array is required and cannot be empty', 400, 'INVALID_INPUT');
      }

      if (ids.length > 50) {
        throw createError('Cannot process more than 50 tasks at once for priority update', 400, 'BULK_LIMIT_EXCEEDED');
      }

      const updatedTasks: Task[] = [];
      for (const id of ids) {
        const task = await this.updateTask(id, { priority });
        if (task) updatedTasks.push(task);
      }

      return updatedTasks;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot process')) {
        throw error;
      }
      throw createError('Failed to update priorities in bulk', 500, 'BULK_PRIORITY_ERROR', error);
    }
  }

  /**
   * Obtener métricas avanzadas
   */
  async getAdvancedMetrics(): Promise<{
    productivity: {
      tasksCompletedToday: number;
      tasksCompletedThisWeek: number;
      averageCompletionTime: number;
    };
    workload: {
      totalPending: number;
      highPriorityPending: number;
      overdueCount: number;
      dueTodayCount: number;
    };
    trends: {
      completionRate: number;
      priorityDistribution: { low: number; medium: number; high: number };
    };
  }> {
    try {
      const [stats, dueToday, overdue] = await Promise.all([
        this.getTaskStats(),
        this.getTasksDueToday(),
        this.getOverdueTasks()
      ]);

      // Obtener tasks completadas hoy
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const completedTodayResult = await this.getAllTasks({
        completed: true,
        // Nota: necesitaríamos agregar completedAt al modelo para ser más precisos
        limit: 100
      });

      return {
        productivity: {
          tasksCompletedToday: completedTodayResult.meta.total, // Aproximación
          tasksCompletedThisWeek: stats.completed, // Aproximación
          averageCompletionTime: stats.averageCompletionTime || 0
        },
        workload: {
          totalPending: stats.pending,
          highPriorityPending: stats.byPriority.high,
          overdueCount: overdue.meta.total,
          dueTodayCount: dueToday.meta.total
        },
        trends: {
          completionRate: stats.completionRate,
          priorityDistribution: stats.byPriority
        }
      };
    } catch (error) {
      throw createError('Failed to generate advanced metrics', 500, 'ADVANCED_METRICS_ERROR', error);
    }
  }
}

// Exportar una instancia singleton
export const taskFacade = new TaskFacade();