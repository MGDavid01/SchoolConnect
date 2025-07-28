import express from "express";
import { NoticiaModel } from "../models/Noticia";

const router = express.Router();

// Obtener todas las noticias activas
router.get("/", async (req, res) => {
  try {
    const noticias = await NoticiaModel.find({ activo: true })
      .sort({ fechaPublicacion: -1 })
      .lean();
    
    res.json(noticias);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ message: "Error al obtener noticias" });
  }
});

// Obtener noticia por ID
router.get("/:id", async (req, res) => {
  try {
    const noticia = await NoticiaModel.findById(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: "Noticia no encontrada" });
    }
    res.json(noticia);
  } catch (error) {
    console.error("Error al obtener noticia:", error);
    res.status(500).json({ message: "Error al obtener noticia" });
  }
});

// Crear una nueva noticia
router.post("/", async (req, res) => {
  try {
    const nuevaNoticia = new NoticiaModel(req.body);
    await nuevaNoticia.save();
    res.status(201).json(nuevaNoticia);
  } catch (error) {
    console.error("Error al crear noticia:", error);
    res.status(400).json({ message: "Error al crear noticia" });
  }
});

// Actualizar una noticia
router.put("/:id", async (req, res) => {
  try {
    const noticia = await NoticiaModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!noticia) {
      return res.status(404).json({ message: "Noticia no encontrada" });
    }
    res.json(noticia);
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    res.status(400).json({ message: "Error al actualizar noticia" });
  }
});

// Eliminar una noticia (marcar como inactiva)
router.delete("/:id", async (req, res) => {
  try {
    const noticia = await NoticiaModel.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!noticia) {
      return res.status(404).json({ message: "Noticia no encontrada" });
    }
    res.json({ message: "Noticia eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    res.status(500).json({ message: "Error al eliminar noticia" });
  }
});

// Obtener noticias por autor
router.get("/autor/:autorID", async (req, res) => {
  try {
    const noticias = await NoticiaModel.find({
      autorID: req.params.autorID,
      activo: true
    })
      .sort({ fechaPublicacion: -1 })
      .lean();
    
    res.json(noticias);
  } catch (error) {
    console.error("Error al obtener noticias por autor:", error);
    res.status(500).json({ message: "Error al obtener noticias por autor" });
  }
});

export default router; 