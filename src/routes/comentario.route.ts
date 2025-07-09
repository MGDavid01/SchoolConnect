import express from "express";
import {ComentarioModel} from "../models/Comentario"; // ajusta la ruta según tu estructura
import { UserModel } from "../models/User"; // si necesitas obtener autor

const router = express.Router();

// Obtener comentarios de una publicación
router.get("/:publicacionID", async (req, res) => {
  const { publicacionID } = req.params;

  try {
    const comentarios = await ComentarioModel.aggregate([
      { $match: { publicacionID } },
      {
        $lookup: {
          from: "usuarios",
          localField: "usuarioID",
          foreignField: "_id",
          as: "usuario",
        },
      },
      { $unwind: "$usuario" },
      {
        $project: {
          _id: 1,
          contenido: 1,
          fecha: 1,
          usuarioID: 1,
          autorNombre: {
            $concat: [
              "$usuario.nombre",
              " ",
              "$usuario.apellidoPaterno",
              " ",
              "$usuario.apellidoMaterno",
            ],
          },
        },
      },
    ]);

    res.json(comentarios);
  } catch (error) {
    console.error("❌ Error al obtener comentarios:", error);
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
});

// Obtener conteo de comentarios por publicación
router.get("/conteo/todos", async (_req, res) => {
  try {
    const conteo = await ComentarioModel.aggregate([
      {
        $group: {
          _id: "$publicacionID",
          totalComentarios: { $sum: 1 },
        },
      },
    ]);

    const resultado: Record<string, number> = {};
    conteo.forEach((item) => {
      resultado[item._id] = item.totalComentarios;
    });

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al contar comentarios:", error);
    res.status(500).json({ message: "Error al contar comentarios" });
  }
});

// Agregar nuevo comentario
router.post("/", async (req, res) => {
  const { publicacionID, usuarioID, contenido } = req.body;

  if (!publicacionID || !usuarioID || !contenido) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const nuevoComentario = new ComentarioModel({
      publicacionID,
      usuarioID,
      contenido,
      fecha: new Date(),
    });

    await nuevoComentario.save();
    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("❌ Error al agregar comentario:", error);
    res.status(500).json({ message: "Error al agregar comentario" });
  }
});

export default router;
