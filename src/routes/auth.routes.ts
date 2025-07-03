import { Router } from "express";
import { UserModel } from "../models/User";

const router = Router();

router.post("/login", async (req, res) => {
  const { correo, password } = req.body;

  try {
    const user = await UserModel.findOne({
      correo: correo.trim().toLowerCase(),
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    }

    res.json({
      _id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      activo: user.activo,
      fechaRegistro: user.fechaRegistro
    });
  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
