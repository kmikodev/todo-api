# TODO API Documentation

## Overview

A comprehensive RESTful API for managing TODO tasks with advanced filtering, analytics, and bulk operations. Built with Node.js, Express, TypeScript, and supports multiple database backends (Memory, MongoDB, PostgreSQL/MySQL via Prisma).

## Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Query Parameters](#query-parameters)
- [Examples](#examples)
- [Database Configuration](#database-configuration)

## Quick Start

1. **Create your first task**
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "My first task", "priority": "medium"}'
   ```

2. **Get all tasks**
   ```bash
   curl http://localhost:3000/api/tasks
   ```

3. **Check daily summary**
   ```bash
   curl http://localhost:3000/api/tasks/daily-summary
   ```

## Authentication

Currently, this API does not require authentication. All endpoints are publicly accessible.

## Base URL

```
http://localhost:3000/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Handling

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Validation failed |
| 500 | INTERNAL_ERROR | Server error |

## Endpoints

### Health & Information

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "TODO API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "memory"
}
```

#### GET /api/
Welcome message and API overview.

#### GET /api/info
Detailed API information including version, features, and statistics.

#### GET /api/ping
Simple ping endpoint that returns "pong".

### Tasks - Basic CRUD

#### GET /api/tasks
Get all tasks with optional filtering, sorting, and pagination.

**Query Parameters:**
- `completed` (boolean): Filter by completion status
- `priority` (string): Filter by priority (low, medium, high)
- `search` (string): Search in title and description
- `dueDateFrom` (string): Filter tasks from this date (ISO format)
- `dueDateTo` (string): Filter tasks until this date (ISO format)
- `sortBy` (string): Sort field (createdAt, updatedAt, title, dueDate, priority)
- `sortOrder` (string): Sort direction (asc, desc)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Example:**
```bash
curl "http://localhost:3000/api/tasks?priority=high&completed=false&page=1&limit=5"
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "dueDate": "2024-01-20T23:59:59.000Z",
  "completed": false
}
```

**Required Fields:**
- `title` (string, 1-200 characters)

**Optional Fields:**
- `description` (string, max 1000 characters)
- `priority` (string): "low", "medium", "high" (default: "medium")
- `dueDate` (string): ISO date string
- `completed` (boolean, default: false)

#### GET /api/tasks/:id
Get a specific task by ID.

#### PUT /api/tasks/:id
Update an entire task (replaces all fields).

#### PATCH /api/tasks/:id
Partially update a task (only provided fields).

#### DELETE /api/tasks/:id
Delete a specific task.

### Task Actions

#### PATCH /api/tasks/:id/complete
Mark a task as completed.

#### PATCH /api/tasks/:id/incomplete
Mark a task as incomplete.

#### PATCH /api/tasks/:id/priority
Update only the priority of a task.

**Request Body:**
```json
{
  "priority": "high"
}
```

#### PATCH /api/tasks/:id/due-date
Update only the due date of a task.

**Request Body:**
```json
{
  "dueDate": "2024-01-25T23:59:59.000Z"
}
```

#### POST /api/tasks/:id/duplicate
Duplicate an existing task.

**Request Body (optional):**
```json
{
  "title": "Custom title for duplicate"
}
```

### Date-based Queries

#### GET /api/tasks/overdue
Get all overdue tasks (due date in the past, not completed).

#### GET /api/tasks/due-today
Get tasks due today.

#### GET /api/tasks/due-this-week
Get tasks due this week (Sunday to Saturday).

#### GET /api/tasks/due-next-week
Get tasks due next week.

#### GET /api/tasks/due-this-month
Get tasks due this month.

#### GET /api/tasks/date-range
Get tasks in a custom date range.

**Required Query Parameters:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)

**Example:**
```bash
curl "http://localhost:3000/api/tasks/date-range?startDate=2024-01-01&endDate=2024-01-31"
```

### Bulk Operations

#### POST /api/tasks/bulk/complete
Mark multiple tasks as completed.

**Request Body:**
```json
{
  "ids": ["task-id-1", "task-id-2", "task-id-3"]
}
```

#### POST /api/tasks/bulk/delete
Delete multiple tasks.

**Request Body:**
```json
{
  "ids": ["task-id-1", "task-id-2", "task-id-3"]
}
```

#### DELETE /api/tasks/bulk/completed
Delete all completed tasks.

### Search & Filter

#### GET /api/tasks/search/:term
Search tasks by a specific term in title and description.

#### GET /api/tasks/priority/:priority
Get tasks by priority level.

**Valid priorities:** `low`, `medium`, `high`

#### GET /api/tasks/completed/:status
Get tasks by completion status.

**Valid statuses:** `true`, `false`

### Analytics & Statistics

#### GET /api/tasks/stats
Get comprehensive task statistics.

**Response:**
```json
{
  "total": 50,
  "completed": 30,
  "pending": 20,
  "byPriority": {
    "low": 15,
    "medium": 25,
    "high": 10
  },
  "overdue": 5,
  "completionRate": 60.0
}
```

#### GET /api/tasks/daily-summary
Get enhanced daily summary with recommendations.

**Response:**
```json
{
  "dueToday": 3,
  "overdue": 2,
  "completed": 30,
  "highPriority": 5,
  "recommendations": [
    "🚨 URGENT: 1 high priority tasks are overdue!",
    "⚡ Focus on 2 high priority tasks due today"
  ],
  "productivity": {
    "completedToday": 2,
    "completedThisWeek": 8,
    "completionRate": 75.5
  },
  "urgentActions": {
    "overdueHighPriority": 1,
    "dueTodayHighPriority": 2
  }
}
```

## Query Parameters

### Pagination
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

### Sorting
- `sortBy` (string): Field to sort by
  - `createdAt` (default)
  - `updatedAt`
  - `title`
  - `dueDate`
  - `priority`
- `sortOrder` (string): Sort direction
  - `desc` (default)
  - `asc`

### Filtering
- `completed` (boolean): Filter by completion status
- `priority` (string): Filter by priority level
- `search` (string): Search in title and description
- `dueDateFrom` (string): Start date for date range filter
- `dueDateTo` (string): End date for date range filter

## Examples

### Create a high priority task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix critical bug",
    "description": "Address the authentication issue in production",
    "priority": "high",
    "dueDate": "2024-01-16T17:00:00.000Z"
  }'
```

### Get overdue high priority tasks
```bash
curl "http://localhost:3000/api/tasks/overdue?priority=high"
```

### Search for tasks containing "meeting"
```bash
curl "http://localhost:3000/api/tasks/search/meeting"
```

### Get tasks due this week, sorted by due date
```bash
curl "http://localhost:3000/api/tasks/due-this-week?sortBy=dueDate&sortOrder=asc"
```

### Get tasks in date range with pagination
```bash
curl "http://localhost:3000/api/tasks/date-range?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20"
```

### Mark multiple tasks as completed
```bash
curl -X POST http://localhost:3000/api/tasks/bulk/complete \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["clr123abc", "clr456def", "clr789ghi"]
  }'
```

### Update task priority
```bash
curl -X PATCH http://localhost:3000/api/tasks/clr123abc/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

### Get daily summary
```bash
curl http://localhost:3000/api/tasks/daily-summary
```

## Database Configuration

The API supports three database backends:

### Memory (Default)
```env
TODO_API_DB=memory
```
Perfect for development and testing. Data is lost when server restarts.

### MongoDB with Mongoose
```env
TODO_API_DB=mongoose
MONGODB_URI=mongodb://localhost:27017/tasks
```

### SQL with Prisma
```env
TODO_API_DB=prisma
DATABASE_URL="postgresql://username:password@localhost:5432/todo_api"
```

## Task Object Schema

```json
{
  "id": "clr123abc456def789",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "completed": false,
  "priority": "high",
  "dueDate": "2024-01-20T23:59:59.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Unique identifier (UUID or ObjectId) |
| title | string | yes | Task title (1-200 characters) |
| description | string\|null | no | Task description (max 1000 characters) |
| completed | boolean | no | Completion status (default: false) |
| priority | enum | no | Priority level: low, medium, high (default: medium) |
| dueDate | string\|null | no | Due date in ISO format |
| createdAt | string | auto | Creation timestamp |
| updatedAt | string | auto | Last update timestamp |

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting based on your requirements.

## Best Practices

1. **Pagination**: Always use pagination for large datasets
2. **Filtering**: Use specific filters to reduce response size
3. **Bulk Operations**: Use bulk endpoints for multiple operations
4. **Date Formats**: Always use ISO 8601 format for dates
5. **Error Handling**: Check the `success` field in responses
6. **Validation**: Validate data before sending requests

## Version

Current API Version: **2.0.0**

## Support

For issues and questions, please refer to the project repository or contact the development team.