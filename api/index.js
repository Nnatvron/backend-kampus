import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

// ================= ENV VARIABEL =================
const {
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PROJECT_ID,
  EMAIL_USER,
  EMAIL_PASS
} = process.env;

// ================= FIREBASE ADMIN =================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// ================= EXPRESS APP =================
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://ubsioneplus.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle OPTIONS
app.options("*", (req, res) => res.sendStatus(200));

// ================= NODEMAILER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// ================== ROUTES ======================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { nim, nama, email, password, phone, jurusan, jenjang } = req.body;

  if (!email || !password || !nama || !nim)
    return res.status(400).json({ message: "Field wajib diisi!" });

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nama,
    });

    return res.status(201).json({
      message: "Registrasi berhasil!",
      user: userRecord,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: err.message || "Registrasi gagal." });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & Password wajib diisi" });

  try {
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
    console.error("LOGIN ERROR:", err);
    return res.status(401).json({ message: "Email tidak terdaftar" });
  }
});

// FORGOT PASSWORD
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email wajib diisi!" });

  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: "https://ubsioneplus.vercel.app/login",
      handleCodeInApp: true,
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Reset Password UBSI",
      html: `<p>Klik link berikut untuk reset password:</p><a href="${link}">${link}</a>`,
    });

    return res.status(200).json({ message: "Link reset password terkirim!" });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    return res.status(500).json({ message: "Gagal kirim email." });
  }
});

// 404 Handler
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// ============== EXPORT UNTUK VERCEL ==============
export default app;
