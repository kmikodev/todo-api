import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';

// Crear instancia de Express
const app = express();

// Middleware de seguridad
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging de peticiones HTTP
app.use(morgan('combined'));

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true })); 

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TODO API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: process.env.TODO_API_DB || 'memory'
  });
});

// Rutas principales de la API
app.use('/api', router);

// Ruta para manejar endpoints no encontrados
// app.ts - Actualización de la lista de endpoints disponibles

// Ruta para manejar endpoints no encontrados
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      // Health & Info
      'GET /health',
      'GET /api/',
      'GET /api/info',
      'GET /api/ping',
      
      // Basic CRUD
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/tasks/:id',
      'PUT /api/tasks/:id',
      'PATCH /api/tasks/:id',
      'DELETE /api/tasks/:id',
      
      // Statistics & Summary
      'GET /api/tasks/stats',
      'GET /api/tasks/daily-summary',
      
      // Date-based queries
      'GET /api/tasks/overdue',
      'GET /api/tasks/due-today',
      'GET /api/tasks/due-this-week',      // 
      'GET /api/tasks/due-next-week',      // 
      'GET /api/tasks/due-this-month',     // 
      'GET /api/tasks/date-range',         // 
      
      // Task actions
      'PATCH /api/tasks/:id/complete',
      'PATCH /api/tasks/:id/incomplete',
      'PATCH /api/tasks/:id/priority',
      'PATCH /api/tasks/:id/due-date',
      'POST /api/tasks/:id/duplicate',
      
      // Bulk operations
      'POST /api/tasks/bulk/complete',
      'POST /api/tasks/bulk/delete',
      'DELETE /api/tasks/bulk/completed',
      
      // Search & Filter
      'GET /api/tasks/search/:term',
      'GET /api/tasks/priority/:priority',
      'GET /api/tasks/completed/:status'
    ],
    queryParameters: {
      pagination: ['page', 'limit'],
      sorting: ['sortBy', 'sortOrder'],
      filtering: ['completed', 'priority', 'search'],
      dateFilters: ['dueDateFrom', 'dueDateTo']  // 
    },
    examples: {
      'Get tasks with date filter': 'GET /api/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-01-31',
      'Get high priority tasks due this week': 'GET /api/tasks/due-this-week?priority=high',
      'Search completed tasks in date range': 'GET /api/tasks/date-range?startDate=2024-01-01&endDate=2024-01-31&completed=true'
    }
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export { app };