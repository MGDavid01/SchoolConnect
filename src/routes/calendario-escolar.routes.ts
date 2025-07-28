import express from 'express';
import { CalendarioEscolarModel } from '../models/CalendarioEscolar';

const router = express.Router();

// Obtener el calendario escolar activo actualmente
router.get('/api/calendario', async (req, res) => {
  try {
    const calendario = await CalendarioEscolarModel.findOne({ activo: true }).lean();
    
    if (!calendario) {
      return res.status(404).json({ 
        error: 'Calendario no encontrado',
        message: 'No hay un calendario escolar activo actualmente' 
      });
    }
    
    res.json(calendario);
  } catch (error) {
    console.error('Error al obtener calendario escolar activo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el calendario escolar' 
    });
  }
});

export default router; 