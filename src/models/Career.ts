// src/models/Career.ts
import { Schema, model, Document } from "mongoose";

export interface ICareer extends Document {
  _id: string;
  nombreCarrera: string;
  descripcion: string;
  duracion: string;
  activo: boolean;
}

const careerSchema = new Schema<ICareer>({
  _id: { type: String, required: true },
  nombreCarrera: { type: String, required: true },
  descripcion: { type: String, required: true },
  duracion: { type: String, required: true },
  activo: { type: Boolean, required: true },
});

export const CareerModel = model<ICareer>("career", careerSchema);
