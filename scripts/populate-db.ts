import testData from './test_data.json';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3010/api';

async function populateDatabase() {
  console.log('🚀 Iniciando población de la base de datos...');
  
  let created = 0;
  let errors = 0;

  for (const task of testData.testTasks) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Creada: ${task.title}`);
        created++;
      } else {
        const error = await response.json();
        console.log(`❌ Error creando "${task.title}": ${error.error.message}`);
        errors++;
      }
    } catch (error) {
      console.log(`❌ Error de red: ${error.message}`);
      errors++;
    }

    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Resumen:`);
  console.log(`✅ Tareas creadas: ${created}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📈 Total procesadas: ${testData.testTasks.length}`);
}

populateDatabase().catch(console.error);
