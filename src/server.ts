import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import roleRoutes from "./routes/role.routes";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  origin: "*"  // Permite cualquier origen (solo para desarrollo)
}));

app.use(express.json());
app.use(roleRoutes);

// Esta linea es para mostrar el acerca de que el backend esta corriendo y disponible para que envie datos al frontend
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
