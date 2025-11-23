import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://web-kampus.vercel.app"
      "https://backend-kampus.vercel.app/"
      "https://ubsioneplus.vercel.app/"
    ],
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes);

// ❌ Hapus ini (Vercel nggak butuh):
// app.listen(5000);

// ✅ Export sebagai serverless function:
export default app;
