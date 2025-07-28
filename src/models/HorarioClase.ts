import mongoose, { Schema, Document } from 'mongoose';

export interface Clase {
  horaInicio: string;
  horaFin: string;
  materiaID: string;
  docenteID: string;
}

export interface HorarioClaseDocument extends Document {
  grupoID: string;
  cicloID: string;
  diaSemana: string;
  clases: Clase[];
  activo: boolean;
}

const ClaseSchema = new Schema<Clase>({
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  materiaID: { type: String, required: true },
  docenteID: { type: String, required: true },
}, { _id: false });

const HorarioClaseSchema = new Schema<HorarioClaseDocument>({
  grupoID: { type: String, required: true },
  cicloID: { type: String, required: true },
  diaSemana: { type: String, required: true },
  clases: { type: [ClaseSchema], required: true },
  activo: { type: Boolean, default: true },
});

export const HorarioClaseModel = mongoose.model<HorarioClaseDocument>('horarioClase', HorarioClaseSchema, 'horarioClase'); 