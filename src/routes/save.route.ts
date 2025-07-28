import express, { Request, Response } from "express";
import { GuardadoModel } from "../models/Save"; // Asegúrate de que el modelo esté exportado como ES Module

const router = express.Router();

// Definimos el tipo del body para las rutas POST y DELETE
interface GuardadoBody {
  usuarioID: string;
  publicacionID: string;
}

// Guardar una publicación
router.post("/", async (req: Request<{}, {}, GuardadoBody>, res: Response) => {
  const { usuarioID, publicacionID } = req.body;

  try {
    const existente = await GuardadoModel.findOne({ usuarioID, publicacionID });
    if (existente) {
      return res.status(400).json({ message: "Ya está guardada." });
    }

    const guardado = new GuardadoModel({ usuarioID, publicacionID });
    await guardado.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar publicación." });
  }
});

// Quitar de guardados
router.delete("/", async (req: Request<{}, {}, GuardadoBody>, res: Response) => {
  const { usuarioID, publicacionID } = req.body;

  try {
    await GuardadoModel.deleteOne({ usuarioID, publicacionID });
    res.json({ message: "Publicación eliminada de guardados." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar guardado." });
  }
});

// Obtener todas las publicaciones guardadas de un usuario
router.get("/:usuarioID", async (req: Request, res: Response) => {
  try {
    const guardados = await GuardadoModel.find({ usuarioID: req.params.usuarioID })
      .populate("publicacionID");

    // Especificamos que g es de tipo any para evitar errores
    res.json(guardados.map((g: any) => g.publicacionID));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener guardados." });
  }
});

export default router;
