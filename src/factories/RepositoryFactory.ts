
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { TaskRepositoryMemory } from '../repositories/TaskRepository.memory';
import { TaskRepositoryMongoose } from '../repositories/TaskRepository.mongoose';
import { TaskRepositoryPrisma } from '../repositories/TaskRepository.prisma';

export class RepositoryFactory {
  static createTaskRepository(): ITaskRepository {
    const dbType = process.env.TODO_API_DB || 'memory';

    switch (dbType.toLowerCase()) {
      case 'memory':
        console.log('📦 Using Memory Repository');
        return new TaskRepositoryMemory();
      
      case 'mongoose':
        console.log('📦 Using Mongoose Repository');
        return new TaskRepositoryMongoose();
      
      case 'prisma':
        console.log('📦 Using Prisma Repository');
        return new TaskRepositoryPrisma();
      
      default:
        console.warn(`⚠️  Unknown database type: ${dbType}, falling back to Memory`);
        return new TaskRepositoryMemory();
    }
  }

  // Método para testing que permite inyectar dependencias
  static createTaskRepositoryForTesting(type: 'memory' | 'mongoose' | 'prisma', options?: any): ITaskRepository {
    switch (type) {
      case 'memory':
        return new TaskRepositoryMemory();
      
      case 'mongoose':
        return new TaskRepositoryMongoose();
      
      case 'prisma':
        return new TaskRepositoryPrisma(options?.prismaClient);
      
      default:
        throw new Error(`Unsupported repository type for testing: ${type}`);
    }
  }
}