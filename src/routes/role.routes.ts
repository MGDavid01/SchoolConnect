import { Router } from "express";
import { RoleModel } from "../models/Role";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const roles = await RoleModel.find();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
});

export default router;
