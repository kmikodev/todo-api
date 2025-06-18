
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: TaskPriority;
  search?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface TaskSortOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface TaskQueryOptions extends TaskFilters, TaskSortOptions, PaginationOptions {}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  overdue: number;
  completionRate: number;
  averageCompletionTime?: number;
}