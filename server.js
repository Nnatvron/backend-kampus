import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

// Allowed origins (tanpa slash)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost",
  "https://web-kampus.vercel.app",
  "https://backend-kampus.vercel.app",
  "https://ubsioneplus.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS Blocked Origin:", origin);
        callback(new Error("CORS: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle OPTIONS preflight request
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// Routes
app.use("/api/auth", authRoutes);

// Vercel uses export — no listen()
export default app;
