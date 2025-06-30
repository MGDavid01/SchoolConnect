import { Router } from "express";
import { RoleModel } from "../models/Role"; // El modelo de MongoDB

const router = Router();

router.get("/roles", async (req, res) => {
  try {
    const roles = await RoleModel.find();
    res.json(roles); // enviar JSON correctamente
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
});


export default router;
