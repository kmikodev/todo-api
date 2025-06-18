
import { v4 as uuidv4 } from 'uuid';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics } from '../models/Task';

export class TaskRepositoryMemory implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();

  async create(taskData: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || null,
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    return { ...task };
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    return task ? { ...task } : null;
  }

  async findAll(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    let filteredTasks = Array.from(this.tasks.values());

    // Aplicar filtros
    filteredTasks = this.applyFilters(filteredTasks, options);

    // Aplicar ordenamiento
    filteredTasks = this.applySorting(filteredTasks, options);

    // Aplicar paginación
    return this.applyPagination(filteredTasks, options);
  }

  async update(id: string, updates: UpdateTaskData): Promise<Task | null> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return null;

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      id: existingTask.id,
      createdAt: existingTask.createdAt,
      updatedAt: new Date(),
      dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate === null ? null : existingTask.dueDate
    };

    this.tasks.set(id, updatedTask);
    return { ...updatedTask };
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async existsByTitle(title: string, excludeId?: string): Promise<boolean> {
    const normalizedTitle = title.toLowerCase().trim();

    for (const task of this.tasks.values()) {
      if (task.id !== excludeId && task.title.toLowerCase().trim() === normalizedTitle) {
        return true;
      }
    }

    return false;
  }

  async getStatistics(): Promise<TaskStatistics> {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();

    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;

    return {
      total,
      completed,
      pending: total - completed,
      byPriority: {
        low: tasks.filter(task => task.priority === 'low').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        high: tasks.filter(task => task.priority === 'high').length
      },
      overdue: tasks.filter(task =>
        !task.completed &&
        task.dueDate &&
        task.dueDate < now
      ).length,
      completionRate: total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0
    };
  }

  async markMultipleAsCompleted(ids: string[]): Promise<Task[]> {
    const updatedTasks: Task[] = [];

    for (const id of ids) {
      const task = await this.update(id, { completed: true });
      if (task) updatedTasks.push(task);
    }

    return updatedTasks;
  }

  async deleteCompleted(): Promise<number> {
    const completedTasks = Array.from(this.tasks.values()).filter(task => task.completed);
    let deletedCount = 0;

    for (const task of completedTasks) {
      if (this.tasks.delete(task.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    let deletedCount = 0;
    for (const id of ids) {
      if (this.tasks.delete(id)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async findOverdue(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(task =>
      !task.completed &&
      task.dueDate &&
      task.dueDate < now
    );
  }

  async findDueToday(): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return Array.from(this.tasks.values()).filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= startOfDay && task.dueDate <= endOfDay;
    });
  }

  async findByPriority(priority: Task['priority']): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  async count(): Promise<number> {
    return this.tasks.size;
  }

  async clear(): Promise<void> {
    this.tasks.clear();
  }


  private applySorting(tasks: Task[], options: TaskQueryOptions): Task[] {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    return tasks.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Manejar valores nulos
      if (sortBy === 'dueDate') {
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortOrder === 'asc' ? 1 : -1;
        if (!bValue) return sortOrder === 'asc' ? -1 : 1;
      }

      // Convertir fechas a timestamps
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      // Comparación de strings (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private applyPagination(tasks: Task[], options: TaskQueryOptions): PaginatedResult<Task> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTasks = tasks.slice(startIndex, endIndex);
    const total = tasks.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedTasks.map(task => ({ ...task })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  private applyFilters(tasks: Task[], options: TaskQueryOptions): Task[] {
    let filtered = [...tasks];

    if (options.completed !== undefined) {
      filtered = filtered.filter(task => task.completed === options.completed);
    }

    if (options.priority) {
      filtered = filtered.filter(task => task.priority === options.priority);
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }

    // : Filtro dueDateFrom
    if (options.dueDateFrom) {
      const fromDate = new Date(options.dueDateFrom);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) >= fromDate;
      });
    }

    // : Filtro dueDateTo
    if (options.dueDateTo) {
      const toDate = new Date(options.dueDateTo);
      // Incluir todo el día final
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) <= toDate;
      });
    }

    return filtered;
  }

  // Método auxiliar para obtener tasks por rango de fechas
  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= startDate && dueDate <= endDate;
    });
  }
}