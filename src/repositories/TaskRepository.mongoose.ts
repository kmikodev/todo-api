
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { Task, CreateTaskData, UpdateTaskData, TaskQueryOptions, PaginatedResult, TaskStatistics, TaskPriority } from '../models/Task';

// Schema de Mongoose
const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Índices para optimización
TaskSchema.index({ title: 1 });
TaskSchema.index({ completed: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ title: 'text', description: 'text' });

interface ITaskDocument extends Document {
  title: string;
  description?: string | null;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskRepositoryMongoose implements ITaskRepository {
  private model: Model<ITaskDocument>;

  constructor() {
    this.model = mongoose.model<ITaskDocument>('Task', TaskSchema);
  }

  async create(taskData: CreateTaskData): Promise<Task> {
    const task = new this.model({
      title: taskData.title,
      description: taskData.description || null,
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    });

    await task.save();
    return this.documentToTask(task);
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const task = await this.model.findById(id).lean();
      return task ? this.documentToTask(task) : null;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return null;
      }
      throw error;
    }
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

    // Construir filtros
    const filter: any = {};

    if (completed !== undefined) {
      filter.completed = completed;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = dueDateFrom;
      if (dueDateTo) filter.dueDate.$lte = dueDateTo;
    }

    if (search) {
      if (search.length > 2) {
        filter.$text = { $search: search };
      } else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
    }

    // Construir ordenamiento
    const sort: any = {};
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = sortDirection;

    // Calcular skip
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [tasks, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks.map(task => this.documentToTask(task)),
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

  async update(id: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
      const processedUpdates: any = { ...updates };
      
      if (updates.dueDate !== undefined) {
        processedUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }

      const updatedTask = await this.model
        .findByIdAndUpdate(
          id,
          { ...processedUpdates, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .lean();

      return updatedTask ? this.documentToTask(updatedTask) : null;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return false;
      }
      throw error;
    }
  }

  async existsByTitle(title: string, excludeId?: string): Promise<boolean> {
    const filter: any = {
      title: { $regex: `^${title.trim()}$`, $options: 'i' }
    };

    if (excludeId) {
      try {
        filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
      } catch (error) {
        // Si excludeId no es válido, continúa sin el filtro de exclusión
      }
    }

    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  async getStatistics(): Promise<TaskStatistics> {
    const now = new Date();

    const pipeline = [
      {
        $facet: {
          total: [{ $count: 'count' }],
          completed: [
            { $match: { completed: true } },
            { $count: 'count' }
          ],
          pending: [
            { $match: { completed: false } },
            { $count: 'count' }
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          overdue: [
            {
              $match: {
                completed: false,
                dueDate: { $lt: now, $ne: null }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await this.model.aggregate(pipeline);

    const total = result.total[0]?.count || 0;
    const completed = result.completed[0]?.count || 0;
    const pending = result.pending[0]?.count || 0;
    const overdue = result.overdue[0]?.count || 0;

    const priorityMap = result.byPriority.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      byPriority: {
        low: priorityMap.low || 0,
        medium: priorityMap.medium || 0,
        high: priorityMap.high || 0
      },
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0
    };
  }

  async markMultipleAsCompleted(ids: string[]): Promise<Task[]> {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return [];
    }

    const operations = validIds.map(id => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { completed: true, updatedAt: new Date() }
      }
    }));

    await this.model.bulkWrite(operations);

    const updatedTasks = await this.model
      .find({ _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .lean();

    return updatedTasks.map(task => this.documentToTask(task));
  }

  async deleteCompleted(): Promise<number> {
    const result = await this.model.deleteMany({ completed: true });
    return result.deletedCount || 0;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return 0;
    }

    const result = await this.model.deleteMany({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    return result.deletedCount || 0;
  }

  async findOverdue(): Promise<Task[]> {
    const now = new Date();
    const tasks = await this.model
      .find({
        completed: false,
        dueDate: { $lt: now, $ne: null }
      })
      .lean();

    return tasks.map(task => this.documentToTask(task));
  }

  async findDueToday(): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const tasks = await this.model
      .find({
        dueDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
      .lean();

    return tasks.map(task => this.documentToTask(task));
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    const tasks = await this.model.find({ priority }).lean();
    return tasks.map(task => this.documentToTask(task));
  }

  async count(): Promise<number> {
    return this.model.countDocuments();
  }

  async clear(): Promise<void> {
    await this.model.deleteMany({});
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  private documentToTask(doc: any): Task {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      priority: doc.priority,
      dueDate: doc.dueDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}