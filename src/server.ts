// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import roleRoutes from "./routes/role.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Conectar a MongoDB
connectDB();

// 2. Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// 3. Middleware para log de todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. Rutas
app.use("/api/roles", roleRoutes);    // GET /api/roles
app.use("/api/auth", authRoutes);     // POST /api/auth/login

app.get("/", (req, res) => {
  res.send("API funcionando ✅");
});

// 5. Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
