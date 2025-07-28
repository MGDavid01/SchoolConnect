import express from "express";
import { BecaProgramaModel } from "../models/BecaPrograma";

const router = express.Router();

// Obtener todas las becas/programas activas, con filtro opcional por tipo
router.get("/", async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro: any = { activo: true };
    if (tipo) filtro.tipo = tipo;
    const becas = await BecaProgramaModel.find(filtro).sort({ fechaPublicacion: -1 }).lean();
    res.json(becas);
  } catch (error) {
    console.error("Error al obtener becas/programas:", error);
    res.status(500).json({ message: "Error al obtener becas/programas" });
  }
});

// Obtener beca/programa por ID
router.get("/:id", async (req, res) => {
  try {
    const beca = await BecaProgramaModel.findById(req.params.id).lean();
    if (!beca) return res.status(404).json({ message: "No encontrada" });
    res.json(beca);
  } catch (error) {
    console.error("Error al obtener beca/programa:", error);
    res.status(500).json({ message: "Error al obtener beca/programa" });
  }
});

export default router; 