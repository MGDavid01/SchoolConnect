import express from "express";
import { UserModel } from "../models/User";

const router = express.Router();

// POST: Cambiar contraseña
router.post("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    user.password = newPassword;
    user.primerInicio = false;
    await user.save();

    return res.status(200).json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
});

router.post("/mark-first-login-complete", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.primerInicio = false;
    await user.save();

    return res.status(200).json({ message: "Primer inicio marcado como completado" });
  } catch (error) {
    console.error("Error al marcar primer inicio:", error);
    return res.status(500).json({ message: "Error al actualizar el estado de primer inicio" });
  }
});


export default router;
