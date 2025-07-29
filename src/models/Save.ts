import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface IGuardado extends Document {
    usuarioID: string,
    publicacionID: Types.ObjectId;
}

const GuardadoSchema = new Schema<IGuardado>({
  usuarioID: { 
    type: String,
    required: true,
  },
  publicacionID: { 
    type: Schema.Types.ObjectId,
    ref: "Publicacion",
    required: true,
  }
},
{
    versionKey: false,
    collection: "guardado",
}
);

export const GuardadoModel = model<IGuardado>("Guardado", GuardadoSchema, "guardado");
