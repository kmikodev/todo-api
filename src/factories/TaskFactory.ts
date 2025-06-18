
import { Task, CreateTaskData, UpdateTaskData, TaskPriority } from '../models/Task';

/**
 * Factory para crear y procesar tasks
 * Actualizado para trabajar con la nueva arquitectura
 */
class TaskFactory {
  /**
   * Crear datos de task con validaciones y transformaciones
   */
  createTaskData(input: CreateTaskData): CreateTaskData {
    return {
      title: this.processTitle(input.title),
      description: this.processDescription(input.description),
      completed: input.completed || false,
      priority: this.processPriority(input.priority),
      dueDate: this.processDueDate(input.dueDate)
    };
  }

  /**
   * Procesar actualizaciones de task
   */
  processTaskUpdates(input: UpdateTaskData): UpdateTaskData {
    const updates: UpdateTaskData = {};

    if (input.title !== undefined) {
      updates.title = this.processTitle(input.title);
    }

    if (input.description !== undefined) {
      updates.description = this.processDescription(input.description);
    }

    if (input.completed !== undefined) {
      updates.completed = input.completed;
    }

    if (input.priority !== undefined) {
      updates.priority = this.processPriority(input.priority);
    }

    if (input.dueDate !== undefined) {
      updates.dueDate = this.processDueDate(input.dueDate);
    }

    return updates;
  }

  /**
   * Crear task urgente
   */
  createUrgentTask(title: string, description?: string, dueDate?: Date | string): CreateTaskData {
    return this.createTaskData({
      title,
      description,
      priority: 'high',
      dueDate: dueDate || this.getEndOfToday(),
      completed: false
    });
  }

  /**
   * Crear task de proyecto
   */
  createProjectTask(title: string, description?: string, dueDate?: Date | string): CreateTaskData {
    return this.createTaskData({
      title: `[PROJECT] ${title}`,
      description,
      priority: 'medium',
      dueDate,
      completed: false
    });
  }

  /**
   * Crear recordatorio
   */
  createReminder(title: string, dueDate: Date | string): CreateTaskData {
    return this.createTaskData({
      title: `🔔 ${title}`,
      description: 'Reminder task',
      priority: 'low',
      dueDate,
      completed: false
    });
  }

  /**
   * Crear múltiples subtasks a partir de una task principal
   */
  createSubtasks(mainTask: string, subtasks: string[], priority: TaskPriority = 'medium'): CreateTaskData[] {
    return subtasks.map((subtask, index) => this.createTaskData({
      title: `${mainTask} - ${subtask}`,
      description: `Subtask ${index + 1} of ${subtasks.length}`,
      priority,
      completed: false
    }));
  }

  /**
   * Procesar título con validaciones y transformaciones
   */
  private processTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a string');
    }

    let processed = title.trim();
    processed = processed.replace(/\s+/g, ' ');
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    
    if (processed.length < 1) {
      throw new Error('Title cannot be empty');
    }
    
    if (processed.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }

    return processed;
  }

  /**
   * Procesar descripción
   */
  private processDescription(description?: string | null): string | null {
    if (!description) return null;
    
    if (typeof description !== 'string') {
      throw new Error('Description must be a string');
    }

    let processed = description.trim();
    processed = processed.replace(/\s+/g, ' ');
    
    if (processed.length === 0) return null;
    
    if (processed.length > 1000) {
      throw new Error('Description cannot exceed 1000 characters');
    }

    return processed;
  }

  /**
   * Procesar prioridad
   */
  private processPriority(priority?: TaskPriority): TaskPriority {
    if (!priority) return 'medium';
    
    const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
    
    if (!validPriorities.includes(priority)) {
      throw new Error('Priority must be one of: low, medium, high');
    }

    return priority;
  }

  /**
   * Procesar fecha de vencimiento
   */
  private processDueDate(dueDate?: Date | string | null): Date | null {
    if (!dueDate || dueDate === null) return null;

    let processedDate: Date;

    if (typeof dueDate === 'string') {
      processedDate = new Date(dueDate);
    } else if (dueDate instanceof Date) {
      processedDate = new Date(dueDate);
    } else {
      throw new Error('Due date must be a valid Date object or ISO string');
    }

    if (isNaN(processedDate.getTime())) {
      throw new Error('Due date must be a valid date');
    }

    return processedDate;
  }

  /**
   * Obtener fecha de final del día actual
   */
  private getEndOfToday(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  }

  /**
   * Validar datos de entrada
   */
  validateInput(input: CreateTaskData | UpdateTaskData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if ('title' in input && input.title !== undefined) {
        this.processTitle(input.title);
      }

      if ('description' in input && input.description !== undefined) {
        this.processDescription(input.description);
      }

      if ('priority' in input && input.priority !== undefined) {
        this.processPriority(input.priority);
      }

      if ('dueDate' in input && input.dueDate !== undefined) {
        this.processDueDate(input.dueDate);
      }
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exportar una instancia singleton
export const taskFactory = new TaskFactory();