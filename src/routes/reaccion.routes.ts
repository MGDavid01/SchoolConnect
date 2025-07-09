import express from "express";
import { ReaccionModel } from "../models/Reaccion";
import { PublicacionModel } from "../models/Publication";

const router = express.Router();

router.post("/", async (req, res) => {
  const { usuarioID, publicacionID, tipo } = req.body;

  try {
    const reaccionExistente = await ReaccionModel.findOne({ usuarioID, publicacionID });

    if (reaccionExistente) {
      if (reaccionExistente.tipo === tipo) {
        // Toggle → eliminar reacción
        await ReaccionModel.findByIdAndDelete(reaccionExistente._id);
        await PublicacionModel.findByIdAndUpdate(publicacionID, {
          $inc: { [tipo === "like" ? "likes" : "dislikes"]: -1 }
        });
        return res.status(200).json({ message: "Reacción eliminada" });
      } else {
        // Cambiar reacción
        await PublicacionModel.findByIdAndUpdate(publicacionID, {
          $inc: { 
            [reaccionExistente.tipo === "like" ? "likes" : "dislikes"]: -1,
            [tipo === "like" ? "likes" : "dislikes"]: 1
          }
        });
        reaccionExistente.tipo = tipo;
        reaccionExistente.fecha = new Date();
        await reaccionExistente.save();
        return res.status(200).json({ message: "Reacción actualizada" });
      }
    }

    // Nueva reacción
    const nuevaReaccion = new ReaccionModel({ usuarioID, publicacionID, tipo });
    await nuevaReaccion.save();
    await PublicacionModel.findByIdAndUpdate(publicacionID, {
      $inc: { [tipo === "like" ? "likes" : "dislikes"]: 1 }
    });
    res.status(201).json({ message: "Reacción registrada" });

  } catch (error) {
    console.error("Error al registrar reacción", error);
    res.status(500).json({ message: "Error interno al registrar reacción", error });
  }
});


router.get("/conteo", async (req, res) => {
  try {
    const conteos = await ReaccionModel.aggregate([
      {
        $group: {
          _id: { publicacionID: "$publicacionID", tipo: "$tipo" },
          total: { $sum: 1 },
        },
      },
    ]);

    const resultado: Record<string, { like: number; dislike: number }> = {};

    conteos.forEach((doc) => {
      const publicacionID = doc._id.publicacionID?.toString?.(); // ✅ Convierte ObjectId a string
      const tipo = doc._id.tipo as "like" | "dislike";

      if (!publicacionID) return;

      if (!resultado[publicacionID]) {
        resultado[publicacionID] = { like: 0, dislike: 0 };
      }

      if (tipo === "like" || tipo === "dislike") {
        resultado[publicacionID][tipo] = doc.total;
      }
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error en conteo de reacciones:", error);
    res.status(500).json({ message: "Error en conteo de reacciones", error });
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

router.get("/", async (req, res) => {
  try {
    const reacciones = await ReaccionModel.find();
    res.json(reacciones);
  } catch (error) {
    console.error("Error al obtener todas las reacciones", error);
    res.status(500).json({ message: "Error al obtener reacciones", error });
  }
});






export default router;
