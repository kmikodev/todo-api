
import { app } from './app';
import { connectDB, disconnectDB } from './config/connection';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Conectar a la base de datos según configuración
    await connectDB();

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 API TODO lista para recibir peticiones`);
      console.log(`🗄️  Database: ${process.env.TODO_API_DB || 'memory'}`);
    });

    // Manejo graceful de cierre del servidor
    const gracefulShutdown = async (signal: string) => {
      console.log(`👋 Received ${signal}. Closing server gracefully...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        try {
          await disconnectDB();
          console.log('✅ All connections closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

start();