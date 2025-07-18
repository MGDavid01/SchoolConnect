// src/models/Role.ts
import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
  _id: string;          // porque usas _id tipo string ("alumno", "maestro", etc.)
  nombreRol: string;
}

const roleSchema = new Schema<IRole>({
  _id: { type: String, required: true },
  nombreRol: { type: String, required: true },
},{versionKey: false});

export const RoleModel = model<IRole>("roles", roleSchema);
