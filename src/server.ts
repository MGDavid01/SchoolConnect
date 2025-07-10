// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import roleRoutes from "./routes/role.routes";
import authRoutes from "./routes/auth.routes";
import publicacionesRoutes from "./routes/publications.routes"
import reaccionRoutes from "./routes/reaccion.routes";
import comentarioRoutes from "./routes/comentario.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//Esto de abajo se hace en caso de que haya problemas con el navegador o la red y se ocupen hacer pruebas en
//el mismo dispositivo,

//const PORT = Number(process.env.PORT) || 4000;

// 1. Conectar a MongoDB
connectDB();

// 2. Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// 3. Middleware para log de todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. Rutas
app.use("/api/roles", roleRoutes);    // GET /api/roles
app.use("/api/auth", authRoutes);   // POST /api/auth/login
app.use("/api/publicaciones", publicacionesRoutes); 
app.use("/api/reacciones", reaccionRoutes);   
app.use("/api/comentarios", comentarioRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando ✅");
});

// 5. Iniciar servidor 
//app.listen(PORT, "0.0.0.0", () => {
  //console.log(`🚀 Backend corriendo en http://0.0.0.0:${PORT}`);
//});

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
