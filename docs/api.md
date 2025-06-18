# TODO API Documentation 📖

Documentación completa de la API REST para gestión de tareas.

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Formato de Respuestas](#formato-de-respuestas)
- [Manejo de Errores](#manejo-de-errores)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Información de la API](#información-de-la-api)
  - [Gestión de Tareas](#gestión-de-tareas)
  - [Estadísticas](#estadísticas)
  - [Operaciones en Lote](#operaciones-en-lote)
  - [Búsqueda y Filtros](#búsqueda-y-filtros)
- [Códigos de Error](#códigos-de-error)
- [Rate Limiting](#rate-limiting)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🌐 Información General

**URL Base:** `http://localhost:3000/api`

**Versión:** v1.0.0

**Content-Type:** `application/json`

**Métodos HTTP Soportados:** GET, POST, PUT, PATCH, DELETE

## 🔐 Autenticación

Actualmente la API no requiere autenticación. En futuras versiones se implementará:
- JWT tokens
- API keys
- OAuth 2.0

## 📤 Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    // Datos de la respuesta
  },
  "message": "Operación realizada exitosamente",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": {
      "errors": ["title is required", "priority must be one of: low, medium, high"]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## ❌ Manejo de Errores

### Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Códigos de Error Personalizados

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `NOT_FOUND` | Recurso no encontrado |
| `DUPLICATE_ERROR` | Recurso duplicado |
| `BULK_LIMIT_EXCEEDED` | Límite de operaciones en lote excedido |
| `INTERNAL_ERROR` | Error interno del servidor |

## 🔗 Endpoints

### Health Check

#### GET `/health`

Verifica el estado de la API.

**Respuesta:**
```json
{
  "status": "OK",
  "message": "TODO API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### Información de la API

#### GET `/api/`

Obtiene información general de la API y documentación.

**Respuesta:**
```json
{
  "message": "Welcome to TODO API",
  "version": "1.0.0",
  "documentation": {
    "swagger": "/api/docs",
    "endpoints": {
      "tasks": "/api/tasks",
      "health": "/health"
    }
  },
  "features": [
    "Create, read, update, delete tasks",
    "Filter tasks by completion status and priority",
    "Search tasks by title and description",
    "Sort tasks by various fields",
    "Pagination support",
    "Task statistics",
    "Bulk operations"
  ]
}
```

#### GET `/api/info`

Información técnica detallada de la API.

**Respuesta:**
```json
{
  "name": "TODO API",
  "version": "1.0.0",
  "description": "A RESTful API for managing TODO tasks",
  "technologies": ["Node.js", "Express.js", "TypeScript", "Bun"],
  "patterns": ["Facade Pattern", "Factory Pattern", "Repository Pattern"],
  "uptime": 3600,
  "environment": "development"
}
```

### Gestión de Tareas

#### GET `/api/tasks`

Obtiene todas las tareas con filtros opcionales.

**Parámetros de Query:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `page` | number | Número de página (default: 1) | `?page=2` |
| `limit` | number | Elementos por página (default: 10, max: 100) | `?limit=20` |
| `completed` | boolean | Filtrar por estado de completado | `?completed=true` |
| `priority` | string | Filtrar por prioridad (low, medium, high) | `?priority=high` |
| `search` | string | Búsqueda en título y descripción | `?search=importante` |
| `sortBy` | string | Campo de ordenamiento | `?sortBy=dueDate` |
| `sortOrder` | string | Orden (asc, desc) | `?sortOrder=desc` |

**Ejemplo:**
```bash
GET /api/tasks?completed=false&priority=high&page=1&limit=5
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Completar proyecto",
      "description": "Finalizar el desarrollo de la API",
      "completed": false,
      "priority": "high",
      "dueDate": "2024-01-20T23:59:59.999Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Tasks retrieved successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET `/api/tasks/:id`

Obtiene una tarea específica por ID.

**Parámetros:**
- `id` (string, required): UUID de la tarea

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Completar proyecto",
    "description": "Finalizar el desarrollo de la API",
    "completed": false,
    "priority": "high",
    "dueDate": "2024-01-20T23:59:59.999Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Task retrieved successfully"
}
```

#### POST `/api/tasks`

Crea una nueva tarea.

**Body:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción opcional",
  "priority": "medium",
  "dueDate": "2024-01-20T23:59:59.999Z"
}
```

**Campos:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | ✅ | Título de la tarea (1-200 caracteres) |
| `description` | string | ❌ | Descripción (max 1000 caracteres) |
| `completed` | boolean | ❌ | Estado de completado (default: false) |
| `priority` | string | ❌ | Prioridad: low, medium, high (default: medium) |
| `dueDate` | string | ❌ | Fecha de vencimiento en formato ISO |

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Nueva tarea",
    "description": "Descripción opcional",
    "completed": false,
    "priority": "medium",
    "dueDate": "2024-01-20T23:59:59.999Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Task created successfully"
}
```

#### PUT `/api/tasks/:id`

Actualiza una tarea completa.

**Body:**
```json
{
  "title": "Tarea actualizada",
  "description": "Nueva descripción",
  "completed": true,
  "priority": "high",
  "dueDate": "2024-01-25T23:59:59.999Z"
}
```

#### PATCH `/api/tasks/:id`

Actualiza parcialmente una tarea.

**Body:**
```json
{
  "completed": true
}
```

#### DELETE `/api/tasks/:id`

Elimina una tarea.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Task deleted successfully"
}
```

### Operaciones de Estado

#### PATCH `/api/tasks/:id/complete`

Marca una tarea como completada.

#### PATCH `/api/tasks/:id/incomplete`

Marca una tarea como no completada.

#### PATCH `/api/tasks/:id/priority`

Actualiza solo la prioridad de una tarea.

**Body:**
```json
{
  "priority": "high"
}
```

#### PATCH `/api/tasks/:id/due-date`

Actualiza solo la fecha de vencimiento.

**Body:**
```json
{
  "dueDate": "2024-01-25T23:59:59.999Z"
}
```

### Estadísticas

#### GET `/api/tasks/stats`

Obtiene estadísticas de las tareas.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "completed": 25,
    "pending": 25,
    "overdue": 5,
    "byPriority": {
      "low": 15,
      "medium": 20,
      "high": 15
    },
    "completionRate": 50.0
  },
  "message": "Task statistics retrieved successfully"
}
```

### Operaciones en Lote

#### POST `/api/tasks/bulk/complete`

Marca múltiples tareas como completadas.

**Body:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tarea 1",
      "completed": true,
      // ... otros campos
    }
  ],
  "message": "2 tasks marked as completed"
}
```

#### DELETE `/api/tasks/bulk/completed`

Elimina todas las tareas completadas.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 15
  },
  "message": "15 completed tasks deleted"
}
```

#### POST `/api/tasks/bulk/delete`

Elimina múltiples tareas.

**Body:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

### Búsqueda y Filtros Especializados

#### GET `/api/tasks/search/:term`

Busca tareas por término específico.

**Ejemplo:**
```bash
GET /api/tasks/search/importante?page=1&limit=10
```

#### GET `/api/tasks/priority/:priority`

Obtiene tareas por prioridad específica.

**Ejemplo:**
```bash
GET /api/tasks/priority/high
```

#### GET `/api/tasks/completed/:status`

Obtiene tareas por estado de completado.

**Ejemplo:**
```bash
GET /api/tasks/completed/true
```

#### GET `/api/tasks/overdue`

Obtiene tareas vencidas.

#### GET `/api/tasks/due-today`

Obtiene tareas que vencen hoy.

### Operaciones Especiales

#### POST `/api/tasks/:id/duplicate`

Duplica una tarea existente.

**Body (opcional):**
```json
{
  "title": "Nuevo título para la copia"
}
```

## 🚦 Rate Limiting

- **Límite por IP:** 100 requests por minuto
- **Límite de operaciones en lote:** Máximo 100 elementos por operación
- **Tamaño máximo de body:** 1MB

## 📊 Códigos de Error Detallados

### Errores de Validación (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        "title is required",
        "title must be at least 1 characters long",
        "priority must be one of: low, medium, high"
      ]
    }
  }
}
```

### Recurso No Encontrado (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found"
  }
}
```

### Recurso Duplicado (409)

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ERROR",
    "message": "Task with this title already exists"
  }
}
```

## 🔧 Ejemplos de Uso

### Crear una Tarea Urgente

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea urgente",
    "description": "Esto es muy importante",
    "priority": "high",
    "dueDate": "2024-01-16T17:00:00.000Z"
  }'
```

### Obtener Tareas Pendientes de Alta Prioridad

```bash
curl "http://localhost:3000/api/tasks?completed=false&priority=high&sortBy=dueDate&sortOrder=asc"
```

### Buscar Tareas

```bash
curl "http://localhost:3000/api/tasks/search/importante"
```

### Completar Múltiples Tareas

```bash
curl -X POST http://localhost:3000/api/tasks/bulk/complete \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### Obtener Estadísticas

```bash
curl http://localhost:3000/api/tasks/stats
```

### Filtrar por Fecha

```bash
curl "http://localhost:3000/api/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-01-31"
```

## 🔄 Paginación Avanzada

### Navegación por Páginas

```bash
# Primera página
GET /api/tasks?page=1&limit=10

# Página siguiente
GET /api/tasks?page=2&limit=10

# Última página (basada en totalPages del meta)
GET /api/tasks?page=5&limit=10
```

### Metadatos de Paginación

```json
{
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true,
      "nextPage": 3,
      "prevPage": 1
    }
  }
}
```

## 📈 Mejores Prácticas

### Headers Recomendados

```bash
# Siempre incluir Content-Type para POST/PUT/PATCH
Content-Type: application/json

# Para debugging
X-Correlation-ID: unique-request-id

# Información del cliente
X-Client-Version: 1.0.0
```

### Manejo de Errores en Cliente

```javascript
try {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('Error:', result.error.message);
    if (result.error.details) {
      console.error('Details:', result.error.details);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Validación de Datos

Siempre validar datos antes de enviar:

```javascript
const isValidTask = (task) => {
  return task.title && 
         task.title.length >= 1 && 
         task.title.length <= 200 &&
         ['low', 'medium', 'high'].includes(task.priority);
};
```

---

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades:
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/todo-api/issues)
- **Discusiones:** [GitHub Discussions](https://github.com/tu-usuario/todo-api/discussions)
- **Email:** tu-email@ejemplo.com

---

**Última actualización:** Enero 2024  
**Versión de la API:** 1.0.0