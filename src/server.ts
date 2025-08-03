// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/database";
import roleRoutes from "./routes/role.routes";
import authRoutes from "./routes/auth.routes";
import publicacionesRoutes from "./routes/publications.routes"
import reaccionRoutes from "./routes/reaccion.routes";
import noticiaRoutes from "./routes/noticia.routes";
import horarioRoutes from "./routes/horario.routes";
import becaRoutes from "./routes/beca.routes";
import calendarioEscolarRoutes from "./routes/calendario-escolar.routes";
import iotNotificationsRoutes from "./routes/iot-notifications.routes";
import comentarioRoutes from "./routes/comentario.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// 1. Conectar a MongoDB
connectDB();

// 2. Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// 3. Middleware para log de todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. Configurar Socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Unirse a una sala específica para un estudiante
  socket.on("join-student", (estudianteID) => {
    socket.join(`student-${estudianteID}`);
    console.log(`Estudiante ${estudianteID} se unió a su sala`);
  });

  // Unirse a una sala específica para un grupo
  socket.on("join-group", (grupoID) => {
    socket.join(`group-${grupoID}`);
    console.log(`Grupo ${grupoID} se unió a su sala`);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Exportar io para usarlo en las rutas
export { io };

// 5. Rutas
app.use("/api/roles", roleRoutes);    // GET /api/roles
app.use("/api/auth", authRoutes);   // POST /api/auth/login
app.use("/api/publicaciones", publicacionesRoutes); 
app.use("/api/reacciones", reaccionRoutes);
app.use("/api/noticias", noticiaRoutes);   
app.use("/api/horario", horarioRoutes); // GET /api/horario/:grupoID
app.use("/api/becas", becaRoutes); // GET /api/becas
app.use("/", calendarioEscolarRoutes); // GET /api/calendario
app.use("/api/iot-notifications", iotNotificationsRoutes); // IoT notifications routes
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando ✅");
});

// 6. Iniciar servidor 
server.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📡 Socket.io disponible en ws://localhost:${PORT}`);
});
