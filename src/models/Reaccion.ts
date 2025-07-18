import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReaccion extends Document {
  usuarioID: string;
  publicacionID: Types.ObjectId;
  tipo: "like" | "dislike";
  fecha: Date;
}

const reaccionSchema = new Schema<IReaccion>({
  usuarioID: {
    type: String,
    required: true,
  },
  publicacionID: {
    type: Schema.Types.ObjectId,
    ref: "Publicacion",
    required: true,
  },
  tipo: {
    type: String,
    enum: ["like", "dislike"],
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
},
{
    versionKey: false,
    collection: "reaccion",
}

);

export const ReaccionModel = mongoose.model<IReaccion>("Reaccion", reaccionSchema, "reaccion");
