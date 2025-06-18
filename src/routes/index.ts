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
    version: '1.0.0',
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
      'Task statistics',
      'Bulk operations'
    ],
    examples: {
      'Get all tasks': 'GET /api/tasks',
      'Get completed tasks': 'GET /api/tasks?completed=true',
      'Search tasks': 'GET /api/tasks?search=important',
      'Get high priority tasks': 'GET /api/tasks?priority=high',
      'Get tasks with pagination': 'GET /api/tasks?page=1&limit=5',
      'Create task': 'POST /api/tasks',
      'Update task': 'PUT /api/tasks/:id',
      'Delete task': 'DELETE /api/tasks/:id'
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
    version: '1.0.0',
    description: 'A RESTful API for managing TODO tasks',
    author: 'Your Name',
    license: 'MIT',
    repository: 'https://github.com/kmikodev/todo-api',
    technologies: [
      'Node.js',
      'Express.js',
      'TypeScript',
      'Bun'
    ],
    patterns: [
      'Facade Pattern',
      'Factory Pattern',
      'Repository Pattern',
      'Middleware Pattern'
    ],
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
    uptime: process.uptime()
  });
});

export { router };