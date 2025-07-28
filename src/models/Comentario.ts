import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComentario extends Document {
  publicacionID: Types.ObjectId;
  usuarioID: string;
  contenido: string;
  fecha: Date;
}

const comentarioSchema = new Schema<IComentario>({
  publicacionID: {
    type: Schema.Types.ObjectId,
    ref: "Publicacion",
    required: true,
  },
  usuarioID: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
},
{
    versionKey: false,
    collection: "comentario",
});

export const ComentarioModel = mongoose.model<IComentario>("Comentario", comentarioSchema, "comentario");
