import { Schema, model, Document } from "mongoose";

export interface IInicioSesion extends Document {
  usuarioID: string;
  fechaHora: Date;
  intentoExitoso: boolean;
}

const inicioSesionSchema: Schema = new Schema({
  usuarioID: { type: String, required: true },
  fechaHora: { type: Date, default: Date.now },
  intentoExitoso: { type: Boolean, required: true },
},
  {
  versionKey: false,
  collection: "inicioSesiones",
  }
);

export const InicioSesionModel = model<IInicioSesion>("inicioSesiones",inicioSesionSchema, "inicioSesiones");