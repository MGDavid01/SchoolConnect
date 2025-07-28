import mongoose, { Schema, model, Document } from "mongoose";

export interface ICalendarioEvento {
  nombreEvento: string;
  tipoEvento: "evento" | "periodo";
  fecha?: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  descripcion?: string;
  activo: boolean;
  imported_at?: Date;
}

export interface ICalendarioEscolar extends Document {
  _id: string;
  año: number;
  eventos: ICalendarioEvento[];
  activo: boolean;
  updated_at?: Date;
}

const calendarioEventoSchema = new Schema<ICalendarioEvento>({
  nombreEvento: {
    type: String,
    required: true,
    trim: true,
  },
  tipoEvento: {
    type: String,
    enum: ["evento", "periodo"],
    required: true,
  },
  fecha: {
    type: Date,
    required: function() {
      return this.tipoEvento === "evento";
    },
  },
  fechaInicio: {
    type: Date,
    required: function() {
      return this.tipoEvento === "periodo";
    },
  },
  fechaFin: {
    type: Date,
    required: function() {
      return this.tipoEvento === "periodo";
    },
  },
  descripcion: {
    type: String,
    trim: true,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  imported_at: {
    type: Date,
    default: Date.now,
  },
});

const calendarioEscolarSchema = new Schema<ICalendarioEscolar>({
  _id: {
    type: String,
    required: true,
  },
  año: {
    type: Number,
    required: true,
    unique: true,
  },
  eventos: [calendarioEventoSchema],
  activo: {
    type: Boolean,
    default: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "calendarioEscolar",
});

export const CalendarioEscolarModel = model<ICalendarioEscolar>("CalendarioEscolar", calendarioEscolarSchema, "calendarioEscolar");

// Interfaces para TypeScript (sin Mongoose)
export interface CalendarioEvento {
  nombreEvento: string;
  tipoEvento: "evento" | "periodo";
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  descripcion?: string;
  activo: boolean;
  imported_at?: string;
}

export interface CalendarioEscolar {
  _id: string;
  año: number;
  eventos: CalendarioEvento[];
  activo: boolean;
  updated_at?: string;
}

export interface CalendarioEscolarCreate {
  año: number;
  eventos: CalendarioEvento[];
  activo: boolean;
}

export interface CalendarioEscolarUpdate {
  año?: number;
  eventos?: CalendarioEvento[];
  activo?: boolean;
} 