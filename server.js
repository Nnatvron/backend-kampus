// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// ======= CORS =======
app.use(cors({
  origin: "https://ubsioneplus.vercel.app", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(bodyParser.json());

// ======= ROUTES =======
app.post("/api/auth/register", (req, res) => {
  // contoh response
  res.json({ message: "Registrasi berhasil!" });
});

// tambahkan route login, reset password, dsb

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://ubsioneplus.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // contoh register route
  if (req.method === "POST") {
    // handle register
    return res.json({ message: "Registrasi berhasil!" });
  }

  res.status(404).json({ message: "Route tidak ditemukan" });
}
