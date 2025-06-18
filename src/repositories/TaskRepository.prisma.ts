
import { PrismaClient } from '@prisma/client';
import type { ITaskRepository } from '../interfaces/ITaskRepository';
import type { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics, TaskPriority } from '../models/Task';

export class TaskRepositoryPrisma implements ITaskRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async create(taskData: CreateTaskData): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        completed: taskData.completed || false,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      }
    });

    return this.prismaToTask(task);
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id }
      });

      return task ? this.prismaToTask(task) : null;
    } catch (error) {
      return null;
    }
  }

  async update(id: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
      const processedUpdates: any = { ...updates };

      if (updates.dueDate !== undefined) {
        processedUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          ...processedUpdates,
          updatedAt: new Date()
        }
      });

      return this.prismaToTask(updatedTask);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  async existsByTitle(title: string, excludeId?: string): Promise<boolean> {
    const where: any = {
      title: {
        equals: title.trim(),
        mode: 'insensitive'
      }
    };

    if (excludeId) {
      where.id = {
        not: excludeId
      };
    }

    const count = await this.prisma.task.count({ where });
    return count > 0;
  }

  async getStatistics(): Promise<TaskStatistics> {
    const now = new Date();

    const [
      total,
      completed,
      pending,
      lowPriority,
      mediumPriority,
      highPriority,
      overdue
    ] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({ where: { completed: true } }),
      this.prisma.task.count({ where: { completed: false } }),
      this.prisma.task.count({ where: { priority: 'low' } }),
      this.prisma.task.count({ where: { priority: 'medium' } }),
      this.prisma.task.count({ where: { priority: 'high' } }),
      this.prisma.task.count({
        where: {
          completed: false,
          dueDate: {
            lt: now
          }
        }
      })
    ]);

    return {
      total,
      completed,
      pending,
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority
      },
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0
    };
  }

  async markMultipleAsCompleted(ids: string[]): Promise<Task[]> {
    const updatedTasks = await this.prisma.$transaction(async (prisma) => {
      const tasks: any[] = [];

      for (const id of ids) {
        try {
          const task = await prisma.task.update({
            where: { id },
            data: {
              completed: true,
              updatedAt: new Date()
            }
          });
          tasks.push(task);
        } catch (error: any) {
          if (error.code !== 'P2025') {
            throw error;
          }
        }
      }

      return tasks;
    });

    return updatedTasks.map(task => this.prismaToTask(task));
  }

  async deleteCompleted(): Promise<number> {
    const result = await this.prisma.task.deleteMany({
      where: { completed: true }
    });

    return result.count;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const result = await this.prisma.task.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return result.count;
  }

  async findOverdue(): Promise<Task[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const tasks = await this.prisma.task.findMany({
      where: {
        completed: false,
        dueDate: {
          lt: startOfDay
        }
      }
    });

    return tasks.map(task => this.prismaToTask(task));
  }

  async findDueToday(): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const tasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    return tasks.map(task => this.prismaToTask(task));
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { priority }
    });

    return tasks.map(task => this.prismaToTask(task));
  }

  async count(): Promise<number> {
    return this.prisma.task.count();
  }

  async clear(): Promise<void> {
    await this.prisma.task.deleteMany();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private prismaToTask(prismaTask: any): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description,
      completed: prismaTask.completed,
      priority: prismaTask.priority,
      dueDate: prismaTask.dueDate,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt
    };
  }

  async findAll(options: TaskQueryOptions = {}): Promise<PaginatedResult<Task>> {
    const {
      completed,
      priority,
      search,
      dueDateFrom,
      dueDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = options;

    // Construir filtros WHERE
    const where: any = {};

    if (completed !== undefined) {
      where.completed = completed;
    }

    if (priority) {
      where.priority = priority;
    }

    // ✅ MEJORADO: Filtros de fecha más robustos
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};

      if (dueDateFrom) {
        const fromDate = new Date(dueDateFrom);
        fromDate.setHours(0, 0, 0, 0); // Inicio del día
        where.dueDate.gte = fromDate;
      }

      if (dueDateTo) {
        const toDate = new Date(dueDateTo);
        toDate.setHours(23, 59, 59, 999); // Final del día
        where.dueDate.lte = toDate;
      }

      // Excluir tasks sin fecha de vencimiento
      where.dueDate.not = null;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Construir ordenamiento
    const orderBy: any = {};

    if (sortBy === 'dueDate') {
      orderBy[sortBy] = {
        sort: sortOrder,
        nulls: sortOrder === 'asc' ? 'last' : 'first'
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.task.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks.map(task => this.prismaToTask(task)),
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

  // Método para encontrar tasks por rango de fechas
  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
          not: null
        }
      }
    });

    return tasks.map(task => this.prismaToTask(task));
  }
}