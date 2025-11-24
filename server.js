// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ===== INIT FIREBASE ADMIN =====
import serviceAccount from "./serviceAccountKey.json"; // sesuaikan path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// ===== CORS =====
app.use(cors({
  origin: ["https://ubsioneplus.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(bodyParser.json());

// ===== NODEMAILER TRANSPORT =====
const transporter = nodemailer.createTransport({
  service: 'gmail', // bisa diganti SMTP lain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===== ROUTES =====

// -------- REGISTER --------
app.post("/api/auth/register", async (req, res) => {
  const { nim, nama, email, password, phone, jurusan, jenjang } = req.body;
  if (!email || !password || !nama || !nim) {
    return res.status(400).json({ message: "Field wajib diisi!" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nama,
    });

    // opsional: simpan data tambahan ke Firestore
    return res.status(201).json({ message: "Registrasi berhasil!", user: userRecord });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Registrasi gagal." });
  }
});

// -------- LOGIN --------
// Backend hanya generate custom token, validasi password tetap frontend
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email dan password wajib diisi!" });

  try {
    // frontend handle password via Firebase Auth SDK
    const user = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(user.uid);

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Login gagal, email tidak ditemukan." });
  }
});

// -------- FORGOT PASSWORD --------
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email wajib diisi!" });

  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: "https://ubsioneplus.vercel.app/login",
      handleCodeInApp: true,
    });

    // kirim email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password UBSI",
      html: `<p>Klik link berikut untuk reset password:</p><a href="${link}">${link}</a>`,
    });

    return res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengirim email reset password." });
  }
});

// -------- RESET PASSWORD (optional) --------
// biasanya frontend handle confirmPasswordReset
app.post("/api/auth/reset-password", async (req, res) => {
  const { uid, newPassword } = req.body;
  if (!uid || !newPassword) return res.status(400).json({ message: "Data reset wajib diisi!" });

  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    return res.status(200).json({ message: "Password berhasil direset!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal reset password." });
  }
});

// -------- DEFAULT ROUTE --------
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// ===== START SERVER =====
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
