import { Router } from "express";
import { UserModel } from "../models/User";
import mongoose from "mongoose";

const router: Router = Router();

router.get("/debug/users", async (req, res) => {
  // Solo permitir en desarroll
  try {
    const users = await UserModel.find({})
      .select('-password -__v') // Excluye campos sensibles
      .lean();

    // Formatea fechas para mejor visualización
    const formattedUsers = users.map(user => ({
      ...user,
      fechaRegistro: user.fechaRegistro.toISOString(),
      fechaNacimiento: user.fechaNacimiento.toISOString(),
      activo: Boolean(user.activo) // Asegura valor booleano
    }));

    res.json({
      success: true,
      data: Array.isArray(users) ? users : [users] // ← Conversión segura
    });

  } catch (error) {
    console.error("Error en debug/users:", {
      error,
      timestamp: new Date()
    });
    
    return res.status(500).json({ 
      code: "DEBUG_ERROR",
      message: "Error al obtener usuarios",
    });
  }
});

router.get("/test", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = 
    dbStatus === 0 ? "Disconnected" :
    dbStatus === 1 ? "Connected" :
    dbStatus === 2 ? "Connecting" :
    dbStatus === 3 ? "Disconnecting" : "Unknown";

  res.json({ 
    status: "API operativa",
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatusText,
      connection: process.env.MONGODB_URI ? "Remote" : "Local",
      dbName: mongoose.connection.name || "Not connected"
    },
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  });
});

router.post("/login", async (req, res) => {
  console.log("Entrando a /login");
  const { _id, password } = req.body;
   console.log("Login request received:", { _id, password });

  try {
     const user = await UserModel.findOne({ _id: _id.trim().toLowerCase() })
                              .select('+password');
    console.log("User found:", user);
    console.log("Usuario encontrado:", user);

    if (!user || !user.password) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    }

    const { password: _, ...userData } = user.toObject(); // Eliminar password
    res.json(userData);

  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
