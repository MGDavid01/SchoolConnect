import express from "express";
import {ComentarioModel} from "../models/Comentario"; // ajusta la ruta según tu estructura
import { UserModel } from "../models/User"; // si necesitas obtener autor
import mongoose from "mongoose";
import {PublicacionModel} from "../models/Publication";


const router = express.Router();

// Obtener comentarios de una publicación
router.get("/:publicacionID", async (req, res) => {
  const { publicacionID } = req.params;

  try {
    const comentarios = await ComentarioModel.aggregate([
      { $match: { publicacionID: new mongoose.Types.ObjectId(publicacionID) } },
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

    // 🔧 Conversión segura de ObjectId a string como clave
    const resultado: Record<string, number> = {};
    conteo.forEach((item) => {
      resultado[item._id.toString()] = item.totalComentarios;
    });

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al contar comentarios:", error);
    res.status(500).json({ message: "Error al contar comentarios" });
  }
});

// Agregar nuevo comentario
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
      fecha: new Date()
    });

    await nuevoComentario.save();

    res.status(201).json(nuevoComentario); // ← devolver el comentario guardado
  } catch (error) {
    console.error("❌ Error al agregar comentario:", error);
    res.status(500).json({ message: "Error al agregar comentario" });
  }
});

//Obtener los comentarios que ha realizado un usuario con detalles, esto para la seccion de Comentarios que tiene la seccion de perfil
router.get("/usuario/:usuarioID/detallados", async (req, res) => {
  const { usuarioID } = req.params;
  try {
    // Buscamos todos los comentarios hechos por el usuario
    const comentarios = await ComentarioModel.find({ usuarioID }).lean();

    // Obtenemos los IDs de publicaciones relacionadas
    const postIds = [...new Set(comentarios.map((c) => c.publicacionID.toString()))];
    const publicaciones = await PublicacionModel.find({ _id: { $in: postIds } }).lean();

    // Creamos un map para obtener detalles rápidos de cada publicación
    const publicacionesMap = publicaciones.reduce((acc, pub) => {
      acc[pub._id.toString()] = {
        titulo: pub.tipo || "Publicación",
        autor: pub.autorID || "Desconocido",
        fecha: pub.fecha,
      };
      return acc;
    }, {} as Record<string, any>);

    // Combinamos los datos
    const comentariosDetallados = comentarios.map((c) => ({
      id: c._id,
      contenido: c.contenido,
      fecha: c.fecha,
      publicacion: publicacionesMap[c.publicacionID.toString()] || null,
    }));

    res.json(comentariosDetallados);
  } catch (error) {
    console.error("Error al obtener comentarios del usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;
