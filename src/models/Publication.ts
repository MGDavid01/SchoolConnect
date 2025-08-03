import mongoose, { Schema, model, Document } from "mongoose";

export interface IPublication extends Document {
  autorID: string;
  contenido: string;
  grupoID?: string;
  tipo: "General" | "Ayuda" | "Pregunta" | "Aviso";
  fecha: Date;
  visibilidad: "grupo" | "todos";
  imagenURL?: string;
  activo: boolean;
}

const publicationSchema = new Schema<IPublication>({
  autorID: {
    type: String,
    required: true,
  },
  contenido: {  
    type: String,
    required: true,
    trim: true,
  },
  grupoID: {
    type: String,
    default: null, // Si no se publica para un grupo específico
  },
  tipo: {
    type: String,
    enum: ["General", "Ayuda", "Pregunta", "Aviso"],
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  visibilidad: {
    type: String,
    enum: ["grupo", "todos"],
    required: true,
  },
  imagenURL: {
    type: String,
    default: null,
  },
  activo: {
    type: Boolean,
    default: true,
  },
},  
    {
        versionKey: false,
        collection: "publicacion",
    }
);

export const PublicacionModel = model<IPublication>("Publicacion", publicationSchema, "publicacion");