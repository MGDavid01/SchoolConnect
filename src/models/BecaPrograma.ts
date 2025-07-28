import mongoose, { Schema, Document } from 'mongoose';

export interface BecaProgramaDocument extends Document {
  titulo: string;
  descripcion: string;
  requisitos: string[];
  promedioMinimo?: number;
  sinReprobadas?: boolean;
  documentos?: string[];
  condicionEspecial?: string;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: 'beca' | 'programa';
  activo: boolean;
  autorID: string;
  fechaPublicacion: Date;
  monto?: number;
  institucion?: string;
  url?: string;
}

const BecaProgramaSchema = new Schema<BecaProgramaDocument>({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  requisitos: { type: [String], required: true },
  promedioMinimo: { type: Number, required: false },
  sinReprobadas: { type: Boolean, required: false },
  documentos: { type: [String], required: false },
  condicionEspecial: { type: String, required: false },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  tipo: { type: String, enum: ['beca', 'programa'], required: true },
  activo: { type: Boolean, default: true },
  autorID: { type: String, required: true },
  fechaPublicacion: { type: Date, required: true },
  monto: { type: Number, required: false },
  institucion: { type: String, required: false },
  url: { type: String, required: false },
});

export const BecaProgramaModel = mongoose.model<BecaProgramaDocument>('becaPrograma', BecaProgramaSchema, 'becaPrograma'); 