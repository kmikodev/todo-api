import { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics } from '../models/Task';

export interface ITaskRepository {
  // Operaciones CRUD básicas
  create(taskData: CreateTaskData): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(options?: TaskQueryOptions): Promise<PaginatedResult<Task>>;
  update(id: string, updates: UpdateTaskData): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  
  // Operaciones específicas
  existsByTitle(title: string, excludeId?: string): Promise<boolean>;
  getStatistics(): Promise<TaskStatistics>;
  markMultipleAsCompleted(ids: string[]): Promise<Task[]>;
  deleteCompleted(): Promise<number>;
  bulkDelete(ids: string[]): Promise<number>;
  
  // Consultas específicas
  findOverdue(): Promise<Task[]>;
  findDueToday(): Promise<Task[]>;
  findByPriority(priority: Task['priority']): Promise<Task[]>;
  
  // Métodos de utilidad
  count(): Promise<number>;
  clear(): Promise<void>;
  
  // Opcional para repositorios que requieren desconexión
  disconnect?(): Promise<void>;
}