import mongoose, { Schema, Document } from 'mongoose';

export interface MateriaDocument extends Document {
  _id: string; // Ahora string
  nombre: string;
  horasSemana: number;
}

const MateriaSchema = new Schema<MateriaDocument>({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  horasSemana: { type: Number, required: true },
});

export const MateriaModel = mongoose.model<MateriaDocument>('materia', MateriaSchema, 'materias'); 