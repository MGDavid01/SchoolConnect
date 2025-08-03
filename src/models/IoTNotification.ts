// src/models/IoTNotification.ts
import { Schema, model, Document } from "mongoose";

export interface IIoTNotification extends Document {
  grupoID: string;
  estudianteID: string;
  tutorID: string;
  fechaHora: Date;
  leido?: boolean;
  respondido?: boolean;
  mensaje?: string;
}

const iotNotificationSchema = new Schema<IIoTNotification>({
  grupoID: {
    type: String,
    required: true,
    trim: true,
  },
  estudianteID: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  tutorID: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  fechaHora: {
    type: Date,
    required: true,
    default: Date.now,
  },
  leido: {
    type: Boolean,
    default: false,
  },
  respondido: {
    type: Boolean,
    default: false,
  },
  mensaje: {
    type: String,
    default: "Tu tutor te está llamando",
  },
}, {
  collection: "llamadoIoT",
  timestamps: true,
});

// Índices para mejorar el rendimiento de las consultas
iotNotificationSchema.index({ estudianteID: 1, fechaHora: -1 });
iotNotificationSchema.index({ grupoID: 1, fechaHora: -1 });
iotNotificationSchema.index({ leido: 1 });

export const IoTNotificationModel = model<IIoTNotification>("IoTNotification", iotNotificationSchema, "llamadoIoT"); 