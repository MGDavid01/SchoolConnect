import express from "express";
import { ReaccionModel } from "../models/Reaccion";

const router = express.Router();

router.post("/", async (req, res) => {
  const { usuarioID, publicacionID, tipo } = req.body;

  try {
    // Verificar si ya existe una reacción de este usuario para esta publicación
    const reaccionExistente = await ReaccionModel.findOne({ usuarioID, publicacionID });

    if (reaccionExistente) {
      if (reaccionExistente.tipo === tipo) {
        // Si el usuario vuelve a hacer la misma reacción → la elimina (toggle)
        await ReaccionModel.findByIdAndDelete(reaccionExistente._id);
        return res.status(200).json({ message: "Reacción eliminada" });
      } else {
        // Si es diferente → la actualiza
        reaccionExistente.tipo = tipo;
        reaccionExistente.fecha = new Date();
        await reaccionExistente.save();
        return res.status(200).json({ message: "Reacción actualizada" });
      }
    }

    // Si no existe → se crea
    const nuevaReaccion = new ReaccionModel({
      usuarioID,
      publicacionID,
      tipo,
    });

    await nuevaReaccion.save();
    res.status(201).json({ message: "Reacción registrada" });
  } catch (error) {
    console.error("Error al registrar reacción", error);
    res.status(500).json({ message: "Error interno al registrar reacción", error });
  }
});

// GET /api/reacciones/:usuarioID
router.get("/:usuarioID", async (req, res) => {
  const { usuarioID } = req.params;

  try {
    const reacciones = await ReaccionModel.find({ usuarioID })
      .select("publicacionID tipo -_id") // Solo traemos los campos necesarios
      .lean();

    // Formato: { "publicacionID": "like" }
    const resultado: Record<string, "like" | "dislike"> = {};
    reacciones.forEach((reaccion) => {
      resultado[reaccion.publicacionID.toString()] = reaccion.tipo;
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener reacciones del usuario", error);
    res.status(500).json({ message: "Error al obtener reacciones", error });
  }
});


export default router;
