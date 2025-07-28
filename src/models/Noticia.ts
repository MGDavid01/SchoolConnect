import mongoose, { Schema, model, Document } from "mongoose";

export interface INoticia extends Document {
  titulo: string;
  contenido: string;
  autorID: string;
  fechaCreacion: Date;
  fechaPublicacion: Date;
  imagenURL?: string;
  activo: boolean;
}

const noticiaSchema = new Schema<INoticia>({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
  },
  autorID: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaPublicacion: {
    type: Date,
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
  collection: "noticia",
}
);

export const NoticiaModel = model<INoticia>("Noticia", noticiaSchema, "noticia"); 