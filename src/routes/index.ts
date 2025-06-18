import { Router } from 'express';
import { taskRoutes } from './taskRoutes';

// Crear router principal
const router = Router();

/**
 * Ruta de bienvenida de la API
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TODO API',
    version: '2.0.0', // ✅ Actualizada para reflejar nuevas funcionalidades
    documentation: {
      swagger: '/api/docs',
      endpoints: {
        tasks: '/api/tasks',
        health: '/health'
      }
    },
    features: [
      'Create, read, update, delete tasks',
      'Filter tasks by completion status and priority',
      'Search tasks by title and description',
      'Sort tasks by various fields',
      'Pagination support',
      'Task statistics and daily summary', // ✅ Actualizado
      'Bulk operations',
      'Date range filtering', // ✅ NUEVO
      'Smart due date queries', // ✅ NUEVO
      'Task duplication', // ✅ NUEVO
      'Priority and due date quick updates' // ✅ NUEVO
    ],
    newFeatures: [ // ✅ NUEVA SECCIÓN
      'Enhanced daily summary with productivity metrics',
      'Date range filtering (dueDateFrom, dueDateTo)',
      'Weekly and monthly due date queries',
      'Urgent actions tracking',
      'Smart recommendations system'
    ],
    examples: {
      // Básicos
      'Get all tasks': 'GET /api/tasks',
      'Get completed tasks': 'GET /api/tasks?completed=true',
      'Search tasks': 'GET /api/tasks?search=important',
      'Get high priority tasks': 'GET /api/tasks?priority=high',
      'Get tasks with pagination': 'GET /api/tasks?page=1&limit=5',
      'Create task': 'POST /api/tasks',
      'Update task': 'PUT /api/tasks/:id',
      'Delete task': 'DELETE /api/tasks/:id',
      
      // ✅ NUEVOS EJEMPLOS: Filtros de fecha
      'Get tasks in date range': 'GET /api/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-01-31',
      'Get tasks due this week': 'GET /api/tasks/due-this-week',
      'Get overdue tasks': 'GET /api/tasks/overdue',
      'Get daily summary': 'GET /api/tasks/daily-summary',
      
      // ✅ NUEVOS EJEMPLOS: Operaciones avanzadas
      'Bulk complete tasks': 'POST /api/tasks/bulk/complete',
      'Update task priority': 'PATCH /api/tasks/:id/priority',
      'Duplicate task': 'POST /api/tasks/:id/duplicate'
    },
    queryParameters: { // ✅ NUEVA SECCIÓN
      pagination: {
        page: 'Page number (default: 1)',
        limit: 'Items per page (default: 10, max: 100)'
      },
      sorting: {
        sortBy: 'createdAt | updatedAt | title | dueDate | priority',
        sortOrder: 'asc | desc'
      },
      filtering: {
        completed: 'true | false',
        priority: 'low | medium | high',
        search: 'Search in title and description',
        dueDateFrom: 'Start date (ISO format: YYYY-MM-DD)',
        dueDateTo: 'End date (ISO format: YYYY-MM-DD)'
      }
    }
  });
});

/**
 * Montar rutas de tasks
 */
router.use('/tasks', taskRoutes);

/**
 * Ruta para obtener información de la API
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'TODO API',
    version: '2.0.0', // ✅ Actualizada
    description: 'A comprehensive RESTful API for managing TODO tasks with advanced filtering and analytics', // ✅ Mejorada
    author: 'Your Name',
    license: 'MIT',
    repository: 'https://github.com/kmikodev/todo-api',
    technologies: [
      'Node.js',
      'Express.js',
      'TypeScript',
      'Bun',
      'MongoDB/Mongoose', // ✅ Agregado
      'Prisma', // ✅ Agregado
      'Memory Storage' // ✅ Agregado
    ],
    patterns: [
      'Facade Pattern',
      'Factory Pattern',
      'Repository Pattern',
      'Middleware Pattern',
      'Service Layer Pattern' // ✅ Agregado
    ],
    architecture: { // ✅ NUEVA SECCIÓN
      layers: [
        'Controllers (HTTP handling)',
        'Services (Business logic)',
        'Repositories (Data access)',
        'Factories (Object creation)',
        'Facades (Simplified interfaces)'
      ],
      databases: [
        'In-memory (default)',
        'MongoDB with Mongoose',
        'Any SQL database with Prisma'
      ]
    },
    statistics: { // ✅ NUEVA SECCIÓN
      uptime: `${Math.floor(process.uptime())} seconds`,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      environment: process.env.NODE_ENV || 'development',
      database: process.env.TODO_API_DB || 'memory'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Ruta de prueba para verificar que la API funciona
 */
router.get('/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'healthy', // ✅ NUEVO
    version: '2.0.0' // ✅ NUEVO
  });
});

/**
 * ✅ NUEVA RUTA: Endpoints disponibles
 */
router.get('/endpoints', (req, res) => {
  res.json({
    message: 'Available API endpoints',
    baseUrl: '/api',
    endpoints: {
      // Health & Info
      general: [
        'GET /api/ - API welcome message',
        'GET /api/info - Detailed API information',
        'GET /api/ping - Health check',
        'GET /api/endpoints - This list'
      ],
      
      // Basic CRUD
      crud: [
        'GET /api/tasks - Get all tasks (with filters)',
        'POST /api/tasks - Create new task',
        'GET /api/tasks/:id - Get specific task',
        'PUT /api/tasks/:id - Update entire task',
        'PATCH /api/tasks/:id - Partially update task',
        'DELETE /api/tasks/:id - Delete task'
      ],
      
      // Statistics & Analytics
      analytics: [
        'GET /api/tasks/stats - Task statistics',
        'GET /api/tasks/daily-summary - Enhanced daily summary'
      ],
      
      // Date-based queries
      dateQueries: [
        'GET /api/tasks/overdue - Overdue tasks',
        'GET /api/tasks/due-today - Tasks due today',
        'GET /api/tasks/due-this-week - Tasks due this week',
        'GET /api/tasks/due-next-week - Tasks due next week',
        'GET /api/tasks/due-this-month - Tasks due this month',
        'GET /api/tasks/date-range - Tasks in custom date range'
      ],
      
      // Task actions
      actions: [
        'PATCH /api/tasks/:id/complete - Mark task as completed',
        'PATCH /api/tasks/:id/incomplete - Mark task as incomplete',
        'PATCH /api/tasks/:id/priority - Update task priority',
        'PATCH /api/tasks/:id/due-date - Update task due date',
        'POST /api/tasks/:id/duplicate - Duplicate task'
      ],
      
      // Bulk operations
      bulk: [
        'POST /api/tasks/bulk/complete - Complete multiple tasks',
        'POST /api/tasks/bulk/delete - Delete multiple tasks',
        'DELETE /api/tasks/bulk/completed - Delete all completed tasks'
      ],
      
      // Search & Filter
      search: [
        'GET /api/tasks/search/:term - Search tasks by term',
        'GET /api/tasks/priority/:priority - Get tasks by priority',
        'GET /api/tasks/completed/:status - Get tasks by completion status'
      ]
    },
    
    parameterExamples: {
      dateRange: 'GET /api/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-01-31',
      pagination: 'GET /api/tasks?page=2&limit=20',
      sorting: 'GET /api/tasks?sortBy=dueDate&sortOrder=asc',
      filtering: 'GET /api/tasks?priority=high&completed=false',
      combined: 'GET /api/tasks?priority=high&dueDateFrom=2024-01-01&sortBy=dueDate&page=1&limit=10'
    }
  });
});

/**
 * ✅ NUEVA RUTA: Guía rápida de uso
 */
router.get('/quick-start', (req, res) => {
  res.json({
    message: 'TODO API Quick Start Guide',
    steps: [
      {
        step: 1,
        action: 'Create your first task',
        method: 'POST /api/tasks',
        body: {
          title: 'My first task',
          description: 'This is a sample task',
          priority: 'medium',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        step: 2,
        action: 'Get all your tasks',
        method: 'GET /api/tasks'
      },
      {
        step: 3,
        action: 'Check your daily summary',
        method: 'GET /api/tasks/daily-summary'
      },
      {
        step: 4,
        action: 'Filter tasks by priority',
        method: 'GET /api/tasks?priority=high'
      },
      {
        step: 5,
        action: 'Mark a task as completed',
        method: 'PATCH /api/tasks/:id/complete'
      }
    ],
    tips: [
      'Use dueDateFrom and dueDateTo to filter tasks by date range',
      'The daily-summary endpoint gives you insights about your productivity',
      'Bulk operations help you manage multiple tasks efficiently',
      'Use pagination (page & limit) for better performance with large datasets',
      'Search functionality works on both title and description fields'
    ],
    commonUse_cases: [
      'GET /api/tasks/overdue - Find tasks that need immediate attention',
      'GET /api/tasks/due-today - Plan your day',
      'GET /api/tasks?priority=high&completed=false - Focus on important tasks',
      'POST /api/tasks/bulk/complete - Complete multiple tasks at once'
    ]
  });
});

export { router };