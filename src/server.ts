import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import roleRoutes from "./routes/role.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Conectar a MongoDB
connectDB();

// 2. Middlewares
app.use(cors({ origin: "*" })); // Solo para desarrollo
app.use(express.json()); // Para interpretar JSON en peticiones

// 3. Rutas
app.use("/api/roles", roleRoutes);    // Ej: GET /api/roles
app.use("/api/auth", authRoutes);     // Ej: POST /api/auth/login

app.get("/", (req, res) => {
  res.send("API funcionando ✅");
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
