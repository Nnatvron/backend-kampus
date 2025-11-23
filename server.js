import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ====== Allowed Origins ======
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost",
  "https://ubsioneplus.vercel.app",
  "https://web-kampus-9i8ega164-natars-projects.vercel.app",
];

// ====== Required for Vercel Serverless ======
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Fix preflight CORS for browser
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ====== Additional CORS middleware (safe fallback) ======
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

// ====== Routes ======
app.use("/api/auth", authRoutes);

// ====== 404 Handler ======
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ====== Error Handler ======
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ====== Server Start ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app; // Required for Vercel Deployment
