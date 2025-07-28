// src/scripts/insertIoTData.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function insertIoTData() {
  try {
    await client.connect();
    console.log('🟢 Conectado a MongoDB');

    const db = client.db();
    const collection = db.collection('llamadoIoT');

    // Datos de prueba para la colección llamadoIoT
    const iotData = [
      {
        _id: "iot_001",
        grupoID: "dsm_5a_1",
        estudianteID: "juan.perez@escuela.mx",
        tutorID: "carlos.mendoza@escuela.mx",
        fechaHora: new Date("2025-01-15T10:30:00.000Z"),
        leido: false,
        respondido: false,
        mensaje: "Tu tutor te está llamando"
      },
      {
        _id: "iot_002",
        grupoID: "dsm_5a_1",
        estudianteID: "maria.garcia@escuela.mx",
        tutorID: "ana.lopez@escuela.mx",
        fechaHora: new Date("2025-01-15T11:15:00.000Z"),
        leido: true,
        respondido: true,
        mensaje: "Llamada urgente del tutor"
      },
      {
        _id: "iot_003",
        grupoID: "dsm_5b_2",
        estudianteID: "pedro.rodriguez@escuela.mx",
        tutorID: "luis.gonzalez@escuela.mx",
        fechaHora: new Date("2025-01-15T14:20:00.000Z"),
        leido: false,
        respondido: false,
        mensaje: "Tu tutor necesita hablar contigo"
      },
      {
        _id: "iot_004",
        grupoID: "dsm_5a_1",
        estudianteID: "juan.perez@escuela.mx",
        tutorID: "carlos.mendoza@escuela.mx",
        fechaHora: new Date("2025-01-16T09:45:00.000Z"),
        leido: true,
        respondido: false,
        mensaje: "Consulta importante del tutor"
      },
      {
        _id: "iot_005",
        grupoID: "dsm_5c_3",
        estudianteID: "lucia.martinez@escuela.mx",
        tutorID: "roberto.sanchez@escuela.mx",
        fechaHora: new Date("2025-01-16T16:30:00.000Z"),
        leido: false,
        respondido: false,
        mensaje: "Tu tutor te está esperando"
      },
      {
        _id: "iot_006",
        grupoID: "dsm_5a_1",
        estudianteID: "juan.perez@escuela.mx",
        tutorID: "carlos.mendoza@escuela.mx",
        fechaHora: new Date("2025-01-17T08:15:00.000Z"),
        leido: false,
        respondido: false,
        mensaje: "Llamada de emergencia del tutor"
      },
      {
        _id: "iot_007",
        grupoID: "dsm_5b_2",
        estudianteID: "carlos.hernandez@escuela.mx",
        tutorID: "maria.ramirez@escuela.mx",
        fechaHora: new Date("2025-01-17T12:00:00.000Z"),
        leido: true,
        respondido: true,
        mensaje: "Consulta académica urgente"
      },
      {
        _id: "iot_008",
        grupoID: "dsm_5a_1",
        estudianteID: "ana.torres@escuela.mx",
        tutorID: "jorge.vargas@escuela.mx",
        fechaHora: new Date("2025-01-18T10:00:00.000Z"),
        leido: false,
        respondido: false,
        mensaje: "Tu tutor necesita tu atención"
      }
    ];

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await collection.deleteMany({});

    // Insertar nuevos datos
    console.log('📝 Insertando datos de prueba...');
    const result = await collection.insertMany(iotData);

    console.log(`✅ ${result.insertedCount} documentos insertados exitosamente`);
    
    // Verificar los datos insertados
    const count = await collection.countDocuments();
    console.log(`📊 Total de documentos en la colección: ${count}`);

    // Mostrar algunos ejemplos
    const examples = await collection.find({}).limit(3).toArray();
    console.log('📋 Ejemplos de datos insertados:');
    examples.forEach((doc, index) => {
      console.log(`${index + 1}. ID: ${doc._id}, Estudiante: ${doc.estudianteID}, Tutor: ${doc.tutorID}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
insertIoTData().catch(console.error); 