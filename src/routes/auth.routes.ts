import { Router } from "express";
import { UserModel } from "../models/User";
import mongoose from "mongoose";
import { InicioSesionModel } from "../models/inicioSesion";

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
  const { _id, password } = req.body;

  try {
    const user = await UserModel.findOne({ _id: _id.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ahora = new Date();

    // 🔒 Revisar si está inactiva
    if (!user.activo) {
      return res.status(403).json({ message: "Cuenta inactiva. Contacta al administrador." });
    }

    // 🔒 Revisar si está bloqueado
    if (user.bloqueadoHasta && user.bloqueadoHasta > ahora) {
      const minutosRestantes = Math.ceil((user.bloqueadoHasta.getTime() - ahora.getTime()) / 60000);
      return res.status(403).json({ 
        message: `Cuenta bloqueada. Inténtalo en ${minutosRestantes} minuto(s).`,
        bloqueado: true,
        bloqueadoHasta: user.bloqueadoHasta,
        intentosFallidos: user.intentosFallidos
      });
    }

    // ✅ Reactivar si ya pasó el bloqueo
    if (user.bloqueadoHasta && user.bloqueadoHasta <= ahora) {
      user.bloqueadoHasta = null;
      user.intentosFallidos = 0;
    }

    // ❌ Contraseña incorrecta
    if (user.password !== password) {
      user.intentosFallidos = (user.intentosFallidos || 0) + 1;

      // 🔐 Si pasa el límite, bloquear temporalmente
      if (user.intentosFallidos >= 5) {
        user.bloqueadoHasta = new Date(ahora.getTime() + 5 * 60 * 1000); // Bloquear 5 minutos
        await user.save();
        return res.status(403).json({ message: "Cuenta bloqueada por intentos fallidos." });
      }

      await user.save(); // Guardar intentosFallidos actualizados
      return res.status(401).json({
        message: "Contraseña incorrecta.",
        bloqueadoHasta: user.bloqueadoHasta, 
        intentosFallidos: user.intentosFallidos // 👈 Agrega esto
      });
    }

    // ✅ Login exitoso
    user.intentosFallidos = 0;
    user.bloqueadoHasta = null;
    await user.save();

    const { password: _, ...userData } = user.toObject(); // Eliminar contraseña antes de responder
    return res.json({
      ...userData,
      primerInicio: user.primerInicio || false, // 👈 Incluye esta línea
    });

  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});



export default router;
