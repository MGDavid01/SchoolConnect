import express from "express";
import { HorarioClaseModel } from "../models/HorarioClase";
import { MateriaModel } from "../models/Materia";

const router = express.Router();

// Obtener el horario de un grupo, enriquecido con nombre y horasSemana de cada materia
router.get("/:grupoID", async (req, res) => {
  const { grupoID } = req.params;
  try {
    // 1. Obtener todos los horarios activos del grupo
    const horarios = await HorarioClaseModel.find({ grupoID, activo: true }).lean();
    // 2. Obtener todos los materiaID únicos
    const materiaIDs = Array.from(new Set(horarios.flatMap(h => h.clases.map(c => c.materiaID))));
    // 3. Consultar las materias
    const materias = await MateriaModel.find({ _id: { $in: materiaIDs } }).lean();
    const materiaMap = Object.fromEntries(materias.map(m => [m._id, m]));
    // 4. Enriquecer las clases con nombre y horasSemana
    const horariosEnriquecidos = horarios.map(h => ({
      ...h,
      clases: h.clases.map(c => ({
        ...c,
        nombre: materiaMap[c.materiaID]?.nombre || c.materiaID,
        horasSemana: materiaMap[c.materiaID]?.horasSemana || null
      }))
    }));
    res.json(horariosEnriquecidos);
  } catch (error) {
    console.error("Error al obtener horario de clase:", error);
    res.status(500).json({ message: "Error al obtener horario de clase" });
  }
});

export default router; 