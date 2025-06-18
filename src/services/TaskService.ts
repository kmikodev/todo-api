
import type { ITaskService } from '../interfaces/ITaskService';
import type { ITaskRepository } from '../interfaces/ITaskRepository';
import { RepositoryFactory } from '../factories/RepositoryFactory';
import { taskFactory } from '../factories/TaskFactory';
import type { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics } from '../models/Task';
import { createError, createNotFoundError, createDuplicateError } from '../middleware/errorHandler';

export class TaskService implements ITaskService {
  private repository: ITaskRepository;

  constructor(repository?: ITaskRepository) {
    this.repository = repository || RepositoryFactory.createTaskRepository();
  }

  async getAllTasks(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      // Aplicar valores por defecto y validaciones
      const queryOptions: TaskQueryOptions = {
        page: options.page || 1,
        limit: Math.min(options.limit || 10, 100),
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc',
        ...options
      };

      return await this.repository.findAll(queryOptions);
    } catch (error) {
      throw createError('Failed to retrieve tasks', 500, 'GET_TASKS_ERROR', error);
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw createError(`Failed to retrieve task with ID ${id}`, 500, 'GET_TASK_ERROR', error);
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      // Verificar duplicados
      if (await this.repository.existsByTitle(taskData.title)) {
        throw createDuplicateError('Task', 'title');
      }

      // Usar factory para procesar y validar datos
      const processedData = taskFactory.createTaskData(taskData);

      // Validaciones de negocio
      await this.validateBusinessRules(processedData);

      return await this.repository.create(processedData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError('Failed to create task', 500, 'CREATE_TASK_ERROR', error);
    }
  }

  async updateTask(id: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
      const existingTask = await this.repository.findById(id);
      if (!existingTask) return null;

      // Verificar duplicados de título si se está actualizando
      if (updates.title && updates.title !== existingTask.title) {
        if (await this.repository.existsByTitle(updates.title, id)) {
          throw createDuplicateError('Task', 'title');
        }
      }

      // Procesar actualizaciones
      const processedUpdates = taskFactory.processTaskUpdates(updates);

      // Validaciones de negocio
      const updatedTaskData = { ...existingTask, ...processedUpdates };
      await this.validateBusinessRules(updatedTaskData);

      return await this.repository.update(id, processedUpdates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError(`Failed to update task with ID ${id}`, 500, 'UPDATE_TASK_ERROR', error);
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw createError(`Failed to delete task with ID ${id}`, 500, 'DELETE_TASK_ERROR', error);
    }
  }

  async getTaskStatistics(): Promise<TaskStatistics> {
    try {
      return await this.repository.getStatistics();
    } catch (error) {
      throw createError('Failed to retrieve task statistics', 500, 'GET_STATS_ERROR', error);
    }
  }

  async bulkCompleteTask(ids: string[]): Promise<Task[]> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createError('IDs array is required and cannot be empty', 400, 'INVALID_INPUT');
      }

      if (ids.length > 100) {
        throw createError('Cannot process more than 100 tasks at once', 400, 'BULK_LIMIT_EXCEEDED');
      }

      return await this.repository.markMultipleAsCompleted(ids);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot process')) {
        throw error;
      }
      throw createError('Failed to complete tasks in bulk', 500, 'BULK_COMPLETE_ERROR', error);
    }
  }

  async deleteCompletedTasks(): Promise<number> {
    try {
      return await this.repository.deleteCompleted();
    } catch (error) {
      throw createError('Failed to delete completed tasks', 500, 'DELETE_COMPLETED_ERROR', error);
    }
  }

  async bulkDeleteTasks(ids: string[]): Promise<number> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createError('IDs array is required and cannot be empty', 400, 'INVALID_INPUT');
      }

      if (ids.length > 100) {
        throw createError('Cannot process more than 100 tasks at once', 400, 'BULK_LIMIT_EXCEEDED');
      }

      return await this.repository.bulkDelete(ids);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot process')) {
        throw error;
      }
      throw createError('Failed to delete tasks in bulk', 500, 'BULK_DELETE_ERROR', error);
    }
  }

  async getOverdueTasks(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      const overdueTasks = await this.repository.findOverdue();

      // Aplicar filtros adicionales y paginación
      const filteredOptions = { ...options, completed: false };
      const allTasks = await this.repository.findAll(filteredOptions);

      const now = new Date();
      const filteredOverdue = allTasks.data.filter(task =>
        task.dueDate && new Date(task.dueDate) < now
      );

      return {
        data: filteredOverdue,
        meta: {
          ...allTasks.meta,
          total: filteredOverdue.length
        }
      };
    } catch (error) {
      throw createError('Failed to retrieve overdue tasks', 500, 'GET_OVERDUE_ERROR', error);
    }
  }

  async getTasksDueToday(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    try {
      const todayTasks = await this.repository.findDueToday();

      // Aplicar paginación si es necesario
      const page = options.page || 1;
      const limit = options.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedTasks = todayTasks.slice(startIndex, endIndex);
      const total = todayTasks.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: paginatedTasks,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw createError('Failed to retrieve tasks due today', 500, 'GET_DUE_TODAY_ERROR', error);
    }
  }

  async duplicateTask(id: string, newTitle?: string): Promise<Task | null> {
    try {
      const originalTask = await this.repository.findById(id);
      if (!originalTask) return null;

      const duplicateTitle = newTitle || `${originalTask.title} (Copy)`;

      if (await this.repository.existsByTitle(duplicateTitle)) {
        throw createDuplicateError('Task', 'title');
      }

      const duplicateData: CreateTaskData = {
        title: duplicateTitle,
        description: originalTask.description,
        completed: false,
        priority: originalTask.priority,
        dueDate: originalTask.dueDate
      };

      return await this.createTask(duplicateData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError(`Failed to duplicate task with ID ${id}`, 500, 'DUPLICATE_TASK_ERROR', error);
    }
  }

  async getDailySummary(): Promise<{
    dueToday: number;
    overdue: number;
    completed: number;
    highPriority: number;
    recommendations: string[];
    productivity: {
      completedToday: number;
      completedThisWeek: number;
      completionRate: number;
    };
    urgentActions: {
      overdueHighPriority: number;
      dueTodayHighPriority: number;
    };
  }> {
    try {
      const [stats, dueToday, overdue, highPriority] = await Promise.all([
        this.getTaskStatistics(),
        this.repository.findDueToday(),
        this.repository.findOverdue(),
        this.repository.findByPriority('high')
      ]);

      const highPriorityPending = highPriority.filter(task => !task.completed);
      const overdueHighPriority = overdue.filter(task => task.priority === 'high');
      const dueTodayHighPriority = dueToday.filter(task => task.priority === 'high');

      // Calcular tareas completadas hoy (aproximación basada en updatedAt)
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const allTasks = await this.repository.findAll({ limit: 1000 });
      const completedToday = allTasks.data.filter(task =>
        task.completed && task.updatedAt >= startOfToday
      ).length;

      // Calcular tareas completadas esta semana
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const completedThisWeek = allTasks.data.filter(task =>
        task.completed && task.updatedAt >= startOfWeek
      ).length;

      const recommendations: string[] = [];

      // Generar recomendaciones inteligentes
      if (overdueHighPriority.length > 0) {
        recommendations.push(`🚨 URGENT: ${overdueHighPriority.length} high priority tasks are overdue!`);
      }

      if (dueTodayHighPriority.length > 0) {
        recommendations.push(`⚡ Focus on ${dueTodayHighPriority.length} high priority tasks due today`);
      }

      if (overdue.length > 5) {
        recommendations.push(`📋 Consider rescheduling ${overdue.length} overdue tasks`);
      } else if (overdue.length > 0) {
        recommendations.push(`⏰ Address ${overdue.length} overdue tasks when possible`);
      }

      if (dueToday.length > 0) {
        recommendations.push(`🎯 Today's focus: ${dueToday.length} tasks due`);
      }

      if (highPriorityPending.length > 3) {
        recommendations.push(`📈 High workload: ${highPriorityPending.length} high priority tasks pending`);
      }

      if (stats.completionRate < 30) {
        recommendations.push('💡 Tip: Break large tasks into smaller, manageable chunks');
      } else if (stats.completionRate > 80) {
        recommendations.push('🎉 Great job! You\'re maintaining a high completion rate');
      }

      if (completedToday === 0 && dueToday.length > 0) {
        recommendations.push('🌅 Start your day by completing one small task');
      } else if (completedToday > 0) {
        recommendations.push(`✅ Good progress: ${completedToday} tasks completed today`);
      }

      // Si no hay recomendaciones específicas, dar consejos generales
      if (recommendations.length === 0) {
        if (stats.pending === 0) {
          recommendations.push('🎊 All caught up! Great work!');
        } else {
          recommendations.push('📝 Review your task list and prioritize your next actions');
        }
      }

      return {
        dueToday: dueToday.length,
        overdue: overdue.length,
        completed: stats.completed,
        highPriority: highPriorityPending.length,
        recommendations,
        productivity: {
          completedToday,
          completedThisWeek,
          completionRate: stats.completionRate
        },
        urgentActions: {
          overdueHighPriority: overdueHighPriority.length,
          dueTodayHighPriority: dueTodayHighPriority.length
        }
      };
    } catch (error) {
      throw createError('Failed to generate daily summary', 500, 'DAILY_SUMMARY_ERROR', error);
    }
  }

  private async validateBusinessRules(taskData: any): Promise<void> {
    // Validar que las tasks de alta prioridad tengan fecha de vencimiento
    if (taskData.priority === 'high' && !taskData.dueDate) {
      console.warn(`High priority task "${taskData.title}" created without due date`);
    }

    // Validar que la fecha de vencimiento no sea en el pasado (solo para nuevas tasks)
    if (taskData.dueDate && !taskData.id) {
      const dueDate = new Date(taskData.dueDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dueDate < today) {
        throw createError('Due date cannot be in the past', 400, 'INVALID_DUE_DATE');
      }
    }

    // Validar longitud del título
    if (taskData.title && taskData.title.length > 200) {
      throw createError('Task title is too long for optimal display', 400, 'TITLE_TOO_LONG');
    }
  }
}

// Crear instancia única del servicio con el repositorio apropiado
const repository = RepositoryFactory.createTaskRepository();
export const taskService = new TaskService(repository);
