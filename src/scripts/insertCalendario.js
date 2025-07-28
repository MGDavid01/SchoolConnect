const mongoose = require('mongoose');
require('dotenv').config();

// Definir el esquema para CalendarioEscolar
const calendarioEventoSchema = new mongoose.Schema({
  nombreEvento: { type: String, required: true },
  descripcion: String,
  tipoEvento: { type: String, enum: ['evento', 'periodo'], required: true },
  fecha: Date, // Para eventos de un solo día
  fechaInicio: Date, // Para períodos
  fechaFin: Date, // Para períodos
  activo: { type: Boolean, default: true }
});

const calendarioEscolarSchema = new mongoose.Schema({
  año: { type: String, required: true },
  activo: { type: Boolean, default: true },
  eventos: [calendarioEventoSchema]
});

const CalendarioEscolar = mongoose.model('CalendarioEscolar', calendarioEscolarSchema);

async function insertCalendarioData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolconnect');
    console.log('Conectado a MongoDB');

    // Eliminar calendarios existentes
    await CalendarioEscolar.deleteMany({});
    console.log('Calendarios existentes eliminados');

    // Crear calendario de prueba
    const calendarioPrueba = new CalendarioEscolar({
      año: '2025',
      activo: true,
      eventos: [
        {
          nombreEvento: 'Inicio de Clases',
          descripcion: 'Comienzo del semestre académico',
          tipoEvento: 'evento',
          fecha: new Date('2025-08-05'),
          activo: true
        },
        {
          nombreEvento: 'Vacaciones de Invierno',
          descripcion: 'Receso por fiestas patrias y descanso',
          tipoEvento: 'periodo',
          fechaInicio: new Date('2025-09-15'),
          fechaFin: new Date('2025-09-20'),
          activo: true
        },
        {
          nombreEvento: 'Día del Estudiante',
          descripcion: 'Celebración del día del estudiante universitario',
          tipoEvento: 'evento',
          fecha: new Date('2025-05-23'),
          activo: true
        },
        {
          nombreEvento: 'Exámenes Finales',
          descripcion: 'Período de exámenes finales del semestre',
          tipoEvento: 'periodo',
          fechaInicio: new Date('2025-12-15'),
          fechaFin: new Date('2025-12-20'),
          activo: true
        },
        {
          nombreEvento: 'Ceremonia de Graduación',
          descripcion: 'Ceremonia de graduación de la promoción 2025',
          tipoEvento: 'evento',
          fecha: new Date('2025-12-10'),
          activo: true
        }
      ]
    });

    await calendarioPrueba.save();
    console.log('✅ Calendario de prueba insertado correctamente');
    console.log('Eventos insertados:', calendarioPrueba.eventos.length);

    // Verificar que se guardó correctamente
    const calendarioGuardado = await CalendarioEscolar.findOne({ activo: true });
    console.log('Calendario guardado:', calendarioGuardado);

  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

insertCalendarioData(); 