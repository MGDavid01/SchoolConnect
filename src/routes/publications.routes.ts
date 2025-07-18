import express from "express";
import { PublicacionModel } from "../models/Publication";
import { ReaccionModel } from "../models/Reaccion";
import { UserModel } from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

// Obtener todas las publicaciones activas
router.get("/", async (req, res) => {
  try {
    const publicaciones = await PublicacionModel.aggregate([
      {
        $lookup: {
          from: "usuarios", // nombre real de la colección de usuarios en tu base
          localField: "autorID",
          foreignField: "_id",
          as: "autor",
        },
      },
      {
        $unwind: "$autor",
      },
      {
        $match: { activo: true },
      },
      {
        $project: {
          _id: 1,
          contenido: 1,
          tipo: 1,
          fecha: 1,
          visibilidad: 1,
          imagenURL: 1,
          autorID: 1,
          autorNombre: {
            $concat: [
                "$autor.nombre"," ",
                "$autor.apellidoPaterno"," ",
                "$autor.apellidoMaterno"
            ]
          }
        },
      },
    ]);
    res.json(publicaciones);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
});


// Crear una nueva publicación
router.post("/", async (req, res) => {
  const { autorID, contenido, grupoID, tipo, visibilidad, imagenURL } = req.body;

  if (!autorID || !contenido || !tipo || !visibilidad) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const nuevaPublicacion = new PublicacionModel({
      autorID,
      contenido,
      grupoID,
      tipo,
      visibilidad,
      imagenURL,
    });

    await nuevaPublicacion.save();

    res.status(201).json(nuevaPublicacion);
  } catch (error) {
    console.error("❌ Error al crear publicación:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/conteo", async (req, res) => {
  try {
    const conteo = await ReaccionModel.aggregate([
      {
        $group: {
          _id: {
            publicacionID: "$publicacionID",
            tipo: "$tipo",
          },
          total: { $sum: 1 },
        },
      },
    ]);

    // Formatear resultado: { publicacionID: { like: x, dislike: y } }
    const resultado: Record<string, { like: number; dislike: number }> = {};

    conteo.forEach((item) => {
      const id = item._id.publicacionID.toString();
      const tipo = item._id.tipo as "like" | "dislike";

      if (!resultado[id]) {
        resultado[id] = { like: 0, dislike: 0 };
      }

      resultado[id][tipo] = item.total;
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener conteo de reacciones", error);
    res.status(500).json({ message: "Error al obtener conteo", error });
  }
});

router.post("/bulk", async (req, res) => {
  console.log("🟢 POST /api/publicaciones/bulk");
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Ids debe ser un array" });
  }

  try {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const publicaciones = await PublicacionModel.aggregate([
      {
        $match: {
          _id: { $in: objectIds },
          activo: true,
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "autorID",
          foreignField: "_id",
          as: "autor",
        },
      },
      {
        $unwind: "$autor",
      },
      {
        $project: {
          _id: 1,
          contenido: 1,
          tipo: 1,
          fecha: 1,
          visibilidad: 1,
          imagenURL: 1,
          autorID: 1,
          autorNombre: {
            $concat: [
              "$autor.nombre", " ",
              "$autor.apellidoPaterno", " ",
              "$autor.apellidoMaterno"
            ]
          }
        },
      },
    ]);

    res.json(publicaciones);
  } catch (error) {
    console.error("❌ Error en POST /bulk:", error);
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
});



export default router;
