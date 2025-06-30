//archivo para la conexion a la base de datos de MongoDB en la nube

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("🟢 Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("🔴 Error de conexión:", error);
    process.exit(1);
  }
};
