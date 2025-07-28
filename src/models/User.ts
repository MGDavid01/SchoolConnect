import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  _id: string; // correo electrónico
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: "alumno" | "docente" | "personal" | "administrador";
  grupoID?: string;
  password: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaNacimiento: Date;
}

const usuarioSchema = new Schema<IUser>({
  _id: {
    type: String,
    required: true,
    lowercase: true, // para evitar mayúsculas en correos
    trim: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  apellidoPaterno: {
    type: String,
    required: true,
  },
  apellidoMaterno: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ["alumno", "docente", "personal", "administrador"],
    required: true,
  },
  grupoID: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: true, // excluye la contraseña por defecto al hacer queries
  },
  activo: {
    type: Boolean,
    default: true,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
  fechaNacimiento: {
    type: Date,
    required: true,
  },
},
  {
  versionKey: false,
  collection: "usuarios",
  }
);

export const UserModel = model<IUser>("User", usuarioSchema, "usuarios");

