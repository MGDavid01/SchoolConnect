// src/models/User.ts
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  correo: string;
  password?: string;
  rol: string;      // aquí se guarda el _id del rol
  grupo_id?: string;
  activo: boolean;
  fechaRegistro: Date;
}

const userSchema = new Schema<IUser>({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  password: { type: String, required: false },
  rol: { type: String, required: true },
  grupo_id: { type: String, required: false },
  activo: { type: Boolean, required: true },
  fechaRegistro: { type: Date, required: true },
});

export const UserModel = model<IUser>("users", userSchema);
