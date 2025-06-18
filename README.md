# TODO API 📝

Una API RESTful robusta para gestión de tareas construida con **TypeScript**, **Express.js**, **Bun** y soporte para múltiples bases de datos. Implementa patrones de diseño modernos y mejores prácticas para el desarrollo de APIs escalables.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🚀 Características

- ✅ **CRUD completo** para tareas con validaciones robustas
- ✅ **Múltiples bases de datos**: Soporte para Memory, MongoDB (Mongoose) y PostgreSQL (Prisma)
- ✅ **Filtrado avanzado** por estado, prioridad, fecha y búsqueda de texto
- ✅ **Paginación** con metadatos completos
- ✅ **Ordenamiento** por múltiples campos
- ✅ **Operaciones en lote** (completar/eliminar múltiples tareas)
- ✅ **Estadísticas** y métricas de productividad
- ✅ **Resumen diario** con recomendaciones inteligentes
- ✅ **Manejo de errores** centralizado y detallado
- ✅ **Validaciones** exhaustivas con mensajes descriptivos
- ✅ **Arquitectura escalable** con patrones de diseño
- ✅ **Documentación** autodescriptiva y colección Postman
- ✅ **TypeScript** para type safety completo
- ✅ **Flexible deployment** con configuración por variables de entorno

## 🏗️ Arquitectura

El proyecto implementa varios patrones de diseño para mantener el código limpio y escalable:

### Patrones Implementados

- **🎭 Facade Pattern**: `TaskFacade` centraliza la lógica de negocio compleja
- **🏭 Factory Pattern**: `RepositoryFactory` y `TaskFactory` para creación de objetos
- **📦 Repository Pattern**: Abstracción de almacenamiento con múltiples implementaciones
- **🔧 Service Pattern**: Lógica de negocio en `TaskService`
- **🔧 Middleware Pattern**: Validaciones y manejo de errores modular

### Estructura del Proyecto

```
todo-api/
├── 📦 package.json
├── ⚙️ tsconfig.json
├── 🗄️ prisma/
│   └── schema.prisma         # Schema de Prisma para PostgreSQL
├── 📂 scripts/
│   ├── 🔄 populate-db.ts     # Script para poblar la BD
│   └── 📊 test_data.json     # Datos de prueba
├── 📂 src/
│   ├── 🎯 index.ts              # Punto de entrada
│   ├── ⚡ app.ts                 # Configuración de Express
│   ├── 📂 config/
│   │   └── 🔗 connection.ts     # Configuración de BD
│   ├── 📂 routes/
│   │   ├── 🛣️ index.ts           # Router principal
│   │   └── 🎯 taskRoutes.ts      # Rutas de tareas
│   ├── 📂 controllers/
│   │   └── 🎮 TaskController.ts  # Controladores HTTP
│   ├── 📂 facades/
│   │   └── 🎭 TaskFacade.ts      # Lógica de negocio compleja
│   ├── 📂 services/
│   │   └── 🔧 TaskService.ts     # Lógica de aplicación
│   ├── 📂 repositories/
│   │   ├── 💾 TaskRepository.memory.ts    # Repositorio en memoria
│   │   ├── 🍃 TaskRepository.mongoose.ts  # Repositorio MongoDB
│   │   └── 🐘 TaskRepository.prisma.ts    # Repositorio PostgreSQL
│   ├── 📂 factories/
│   │   ├── 🏭 RepositoryFactory.ts  # Factory para repositorios
│   │   └── 🏭 TaskFactory.ts        # Factory para tareas
│   ├── 📂 interfaces/
│   │   ├── 📋 ITaskRepository.ts    # Interfaz del repositorio
│   │   └── 📋 ITaskService.ts       # Interfaz del servicio
│   ├── 📂 models/
│   │   └── 📊 Task.ts               # Modelos y tipos
│   ├── 📂 middleware/
│   │   ├── ❌ errorHandler.ts       # Manejo global de errores
│   │   └── ✅ validation.ts         # Middlewares de validación
│   └── 📂 utils/
│       ├── 🔍 validators.ts         # Funciones de validación
│       └── 📤 responseHelper.ts     # Helpers para respuestas
├── 📂 tests/                       # Tests unitarios
├── 📂 docs/                        # Documentación
│   ├── 📖 api.md                   # Documentación de API
│   └── 📮 postman_collection.json  # Colección Postman
└── 📄 README.md                    # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Bun** >= 1.0.0 ([Instalar Bun](https://bun.sh/docs/installation))
- **Node.js** >= 18.0.0 (como alternativa)
- **MongoDB** (opcional, para usar con Mongoose)
- **PostgreSQL** (opcional, para usar con Prisma)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/kmikodev/todo-api.git
   cd todo-api
   ```

2. **Instalar dependencias**
   ```bash
   bun install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tu configuración
   ```

4. **Elegir tipo de base de datos**
   
   **Opción A: Usar almacenamiento en memoria (default)**
   ```bash
   export TODO_API_DB=memory
   bun run dev
   ```

   **Opción B: Usar MongoDB con Mongoose**
   ```bash
   export TODO_API_DB=mongoose
   export MONGODB_URI=mongodb://localhost:27017/tasks
   bun run dev
   ```

   **Opción C: Usar PostgreSQL con Prisma**
   ```bash
   export TODO_API_DB=prisma
   export DATABASE_URL="postgresql://user:password@localhost:5432/tasks"
   bunx prisma generate
   bunx prisma db push
   bun run dev
   ```

5. **Poblar la base de datos (opcional)**
   ```bash
   bun run scripts/populate-db.ts
   ```

¡La API estará disponible en `http://localhost:3000`! 🎉

## 🗄️ Configuración de Base de Datos

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Tipo de base de datos: memory | mongoose | prisma
TODO_API_DB=memory

# MongoDB (para Mongoose)
MONGODB_URI=mongodb://localhost:27017/tasks

# PostgreSQL (para Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/tasks"

# Configuración CORS
CORS_ORIGIN=*

# Logs
LOG_LEVEL=info
```

### Configuración de Prisma

Si usas PostgreSQL, el archivo `prisma/schema.prisma` está configurado:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("tasks")
}

enum Priority {
  LOW
  MEDIUM
  HIGH

  @@map("priority")
}
```

## 📚 Uso de la API

### Endpoints Principales

#### 📋 Gestión de Tareas

```bash
# Obtener todas las tareas
GET /api/tasks

# Obtener tarea específica
GET /api/tasks/:id

# Crear nueva tarea
POST /api/tasks

# Actualizar tarea
PUT /api/tasks/:id
PATCH /api/tasks/:id

# Eliminar tarea
DELETE /api/tasks/:id
```

#### 🔍 Filtrado y Búsqueda

```bash
# Filtrar por estado
GET /api/tasks?completed=true

# Filtrar por prioridad
GET /api/tasks?priority=high

# Búsqueda de texto
GET /api/tasks?search=importante

# Filtrar por rango de fechas
GET /api/tasks?dueDateFrom=2024-01-01&dueDateTo=2024-01-31

# Paginación
GET /api/tasks?page=1&limit=10

# Ordenamiento
GET /api/tasks?sortBy=dueDate&sortOrder=asc
```

#### 📊 Estadísticas y Análisis

```bash
# Estadísticas generales
GET /api/tasks/stats

# Resumen diario con recomendaciones
GET /api/tasks/daily-summary

# Tareas vencidas
GET /api/tasks/overdue

# Tareas que vencen hoy
GET /api/tasks/due-today
```

#### ⚡ Acciones Rápidas

```bash
# Marcar como completada
PATCH /api/tasks/:id/complete

# Marcar como pendiente
PATCH /api/tasks/:id/incomplete

# Cambiar prioridad
PATCH /api/tasks/:id/priority

# Actualizar fecha de vencimiento
PATCH /api/tasks/:id/due-date

# Duplicar tarea
POST /api/tasks/:id/duplicate
```

#### 🔄 Operaciones en Lote

```bash
# Completar múltiples tareas
POST /api/tasks/bulk/complete

# Eliminar múltiples tareas
POST /api/tasks/bulk/delete

# Eliminar todas las completadas
DELETE /api/tasks/bulk/completed
```

### Ejemplo de Uso Completo

```bash
# 1. Crear una tarea urgente
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completar presentación",
    "description": "Preparar slides para reunión ejecutiva",
    "priority": "high",
    "dueDate": "2024-12-31T17:00:00.000Z"
  }'

# 2. Buscar tareas urgentes pendientes
curl "http://localhost:3000/api/tasks?completed=false&priority=high&sortBy=dueDate&sortOrder=asc"

# 3. Obtener resumen diario
curl http://localhost:3000/api/tasks/daily-summary

# 4. Ver estadísticas
curl http://localhost:3000/api/tasks/stats
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
bun test

# Tests en modo watch
bun run test:watch

# Tests con coverage
bun test --coverage

# Linting
bun run lint

# Formateo de código
bun run format
```

## 📮 Colección Postman

Importa la colección completa desde `docs/postman_collection.json` que incluye:

- ✅ Todos los endpoints documentados
- ✅ Ejemplos de datos de prueba
- ✅ Tests de validación de errores
- ✅ Variables de entorno configuradas
- ✅ Scripts de automatización

## 🚀 Despliegue

### Desarrollo Local

```bash
# Modo desarrollo con hot reload
bun run dev

# Modo producción
bun run start
```

### Docker

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copiar código fuente
COPY . .

# Si usas Prisma, generar cliente
RUN if [ "$TODO_API_DB" = "prisma" ]; then bunx prisma generate; fi

EXPOSE 3000

CMD ["bun", "src/index.ts"]
```

### Variables de Entorno para Producción

```bash
NODE_ENV=production
PORT=3000
TODO_API_DB=prisma
DATABASE_URL="postgresql://user:password@db:5432/tasks"
CORS_ORIGIN="https://tu-frontend.com"
```

## 🏛️ Arquitectura Detallada

### Flujo de Datos

```
Request → Routes → Validation → Controller → Facade → Service → Repository → Database
                     ↓                                           ↓
                 Error Handler ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### Capas de la Aplicación

1. **🌐 Capa de Presentación** (`routes/`, `controllers/`)
   - Manejo de HTTP requests/responses
   - Validación de entrada
   - Serialización de datos

2. **🎯 Capa de Lógica de Negocio** (`facades/`)
   - Reglas de negocio complejas
   - Coordinación entre servicios
   - Validaciones avanzadas

3. **🔧 Capa de Servicios** (`services/`)
   - Lógica de aplicación
   - Orquestación de operaciones
   - Validaciones de negocio

4. **🏭 Capa de Acceso a Datos** (`repositories/`)
   - Abstracción de almacenamiento
   - Múltiples implementaciones
   - Operaciones CRUD

5. **🔧 Capa de Utilidades** (`utils/`, `middleware/`)
   - Funciones auxiliares
   - Middleware compartido
   - Manejo de errores

## 🛡️ Seguridad y Mejores Prácticas

- **🔒 Helmet.js**: Headers de seguridad HTTP
- **🌐 CORS**: Configuración flexible de CORS
- **✅ Validación**: Sanitización exhaustiva de entrada
- **❌ Manejo de Errores**: Sin exposición de información sensible
- **📏 Rate Limiting**: Preparado para implementar
- **🔐 TypeScript**: Tipado fuerte para prevenir errores
- **🏗️ Arquitectura**: Separación clara de responsabilidades

## 🔄 Próximas Funcionalidades

- [ ] 🔐 Sistema de autenticación JWT
- [ ] 👥 Gestión de usuarios y equipos
- [ ] 🔄 Tareas recurrentes y plantillas
- [ ] 📎 Sistema de adjuntos y comentarios
- [ ] 🔔 Sistema de notificaciones
- [ ] 📊 Dashboard analytics avanzado
- [ ] 🌐 API GraphQL como alternativa
- [ ] 📱 WebSocket para actualizaciones en tiempo real
- [ ] 🤖 IA para sugerencias de productividad
- [ ] 📈 Métricas de rendimiento con Prometheus

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **ESLint** y **Prettier** configurados
- **Conventional Commits** para mensajes
- **TypeScript strict mode** habilitado
- **Tests unitarios** requeridos para nuevas funcionalidades
- **Documentación** actualizada para cambios en API

## 📝 Scripts Disponibles

```bash
# Desarrollo
bun run dev          # Servidor con hot reload
bun run start        # Servidor de producción

# Testing
bun test             # Ejecutar tests
bun run test:watch   # Tests en modo watch
bun run test:coverage # Tests con coverage

# Base de datos
bun run db:generate  # Generar cliente Prisma
bun run db:push      # Aplicar cambios al schema
bun run db:studio    # Abrir Prisma Studio
bun run db:seed      # Poblar base de datos

# Calidad de código
bun run lint         # Linting
bun run format       # Formatear código
bun run typecheck    # Verificar tipos
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**Jaime Cardona**
- GitHub: [@kmikodev](https://github.com/kmikodev)
- LinkedIn: [Jaime Cardona](https://www.linkedin.com/in/jaime-cardona-villegas/)
- Email: jcardonavillegas@gmail.com

## 🙏 Agradecimientos

- [Bun](https://bun.sh/) por el runtime ultrarrápido de JavaScript
- [Express.js](https://expressjs.com/) por el framework web robusto
- [TypeScript](https://www.typescriptlang.org/) por el tipado estático
- [Prisma](https://www.prisma.io/) por el ORM moderno
- [Mongoose](https://mongoosejs.com/) por el ODM de MongoDB
- La comunidad open source por las herramientas increíbles

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!

## 📊 Estado del Proyecto

![GitHub last commit](https://img.shields.io/github/last-commit/kmikodev/todo-api)
![GitHub issues](https://img.shields.io/github/issues/kmikodev/todo-api)
![GitHub stars](https://img.shields.io/github/stars/kmikodev/todo-api)
![GitHub forks](https://img.shields.io/github/forks/kmikodev/todo-api)

**Versión Actual:** 1.0.0  
**Estado:** Estable y listo para producción  
**Última Actualización:** 18 de Junio del 2025