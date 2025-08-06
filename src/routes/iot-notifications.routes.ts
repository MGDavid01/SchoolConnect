// src/routes/iot-notifications.routes.ts
import { Router } from "express";
import { IoTNotificationModel } from "../models/IoTNotification";
import { UserModel } from "../models/User";
import { io } from "../server";

const router: Router = Router();

// Obtener notificaciones de un estudiante específico
router.get("/student/:estudianteID", async (req, res) => {
  try {
    const { estudianteID } = req.params;
    const { limit = 10, unreadOnly = false } = req.query;

    let query: any = { estudianteID: estudianteID.toLowerCase() };
    
    if (unreadOnly === 'true') {
      query.leido = false;
    }

    const notifications = await IoTNotificationModel.find(query)
      .sort({ fechaHora: -1 })
      .limit(Number(limit))
      .lean();

    // Si se solicita solo no leídas, contar solo esas
    let count = notifications.length;
    if (unreadOnly === 'true') {
      count = notifications.filter(n => !n.leido).length;
    }

    res.json({
      success: true,
      data: notifications,
      count: count
    });

  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones"
    });
  }
});

// Obtener notificaciones por grupo
router.get("/group/:grupoID", async (req, res) => {
  try {
    const { grupoID } = req.params;
    const { limit = 20 } = req.query;

    const notifications = await IoTNotificationModel.find({ grupoID })
      .sort({ fechaHora: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error("Error obteniendo notificaciones por grupo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones del grupo"
    });
  }
});

// Marcar notificación como leída
router.patch("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await IoTNotificationModel.findByIdAndUpdate(
      notificationId,
      { leido: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
    res.status(500).json({
      success: false,
      message: "Error al marcar notificación como leída"
    });
  }
});

// Marcar notificación como respondida
router.patch("/:notificationId/respond", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await IoTNotificationModel.findByIdAndUpdate(
      notificationId,
      { respondido: true, leido: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error("Error marcando notificación como respondida:", error);
    res.status(500).json({
      success: false,
      message: "Error al marcar notificación como respondida"
    });
  }
});

// Crear nueva notificación IoT (para cuando el dispositivo IoT envía datos)
router.post("/create", async (req, res) => {
  try {
    const { grupoID, estudianteID, tutorID, mensaje } = req.body;

    // Validar que el estudiante existe
    const estudiante = await UserModel.findOne({ 
      _id: estudianteID.toLowerCase(),
      rol: "alumno"
    });

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        message: "Estudiante no encontrado"
      });
    }

    // Validar que el tutor existe
    const tutor = await UserModel.findOne({ 
      _id: tutorID.toLowerCase(),
      rol: "docente"
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor no encontrado"
      });
    }

    // Crear la notificación
    const newNotification = new IoTNotificationModel({
      grupoID,
      estudianteID: estudianteID.toLowerCase(),
      tutorID: tutorID.toLowerCase(),
      fechaHora: new Date(),
      mensaje: mensaje || "Tu tutor te está llamando",
      leido: false,
      respondido: false
    });

    await newNotification.save();

    // Emitir evento a través de Socket.io
    io.to(`student-${estudianteID.toLowerCase()}`).emit("new-iot-notification", {
      notification: newNotification,
      message: "Nueva notificación IoT recibida"
    });

    // También emitir al grupo si es necesario
    io.to(`group-${grupoID}`).emit("new-iot-notification", {
      notification: newNotification,
      message: "Nueva notificación IoT en el grupo"
    });

    res.status(201).json({
      success: true,
      data: newNotification,
      message: "Notificación creada exitosamente"
    });

  } catch (error) {
    console.error("Error creando notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear notificación"
    });
  }
});

// Obtener estadísticas de notificaciones para un estudiante
router.get("/stats/:estudianteID", async (req, res) => {
  try {
    const { estudianteID } = req.params;

    const stats = await IoTNotificationModel.aggregate([
      { $match: { estudianteID: estudianteID.toLowerCase() } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          leidas: { $sum: { $cond: ["$leido", 1, 0] } },
          respondidas: { $sum: { $cond: ["$respondido", 1, 0] } },
          noLeidas: { $sum: { $cond: ["$leido", 0, 1] } }
        }
      }
    ]);

    const result = stats[0] || { total: 0, leidas: 0, respondidas: 0, noLeidas: 0 };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas"
    });
  }
});

// Eliminar notificación (solo para administradores)
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await IoTNotificationModel.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }

    res.json({
      success: true,
      message: "Notificación eliminada exitosamente"
    });

  } catch (error) {
    console.error("Error eliminando notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar notificación"
    });
  }
});

export default router; 