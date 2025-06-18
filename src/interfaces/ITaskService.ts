import { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics } from '../models/Task';

export interface ITaskService {
  // Operaciones principales con lógica de negocio
  getAllTasks(options?: TaskQueryOptions): Promise<PaginatedResult<Task>>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(taskData: CreateTaskData): Promise<Task>;
  updateTask(id: string, updates: UpdateTaskData): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  
  // Operaciones avanzadas
  getTaskStatistics(): Promise<TaskStatistics>;
  bulkCompleteTask(ids: string[]): Promise<Task[]>;
  deleteCompletedTasks(): Promise<number>;
  bulkDeleteTasks(ids: string[]): Promise<number>;
  
  // Consultas especializadas
  getOverdueTasks(options?: TaskQueryOptions): Promise<PaginatedResult<Task>>;
  getTasksDueToday(options?: TaskQueryOptions): Promise<PaginatedResult<Task>>;
  duplicateTask(id: string, newTitle?: string): Promise<Task | null>;
  
  // Métodos de análisis
  getDailySummary(): Promise<{
    dueToday: number;
    overdue: number;
    completed: number;
    highPriority: number;
    recommendations: string[];
  }>;
}