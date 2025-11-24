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
const serviceAccount = {
  "type": "service_account",
  "project_id": "ubsioneplus",
  "private_key_id": "b1e31c8bc0a12e7325da9503993c45585116306e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChBt+PKR193zv0\nLQ+BzRKJwi7UckK9pGV8jyoMBNqF5P8sECn5jACOtGPGGrStAMQROgr66epOTN99\ny4DD/+gDPOgEK7uKC9saAy24IRmN3lhiRevyw1EdCtmfaRxVvzJR25Iw+qOFPWd+\nfbV3fxGSuYJh1FyMdawMsUBGZut3dq5qNxqZhrrWyumhmAz84FjgXgWNIB345Poo\nuxbxjMPWIj74HAngzP8sPegaaN3YYk7pHZ9YZ2PM92/bRSCI4GWoIrIMEA18WEH6\nUsCGwM5mhq/ju0Ji3rWtLF2K/krGQrPRozEdaKSN/fbo3vWqTOlgcHUqmFWXpOAF\nNWw1qzb5AgMBAAECggEAFoUdD+r6nmdxfZEtuYQCIzT+kqSWM+qBbP2irkKhgxdH\nHpT2IdnUHCEbURHcEdPpF9WrwnKjW6cBnJiw3fh0rLtAYZDyLfjBgC5Qnw82ATLG\n3puTx4RMXEjvrY0oMs/GDE+ubt4mr1QqnLSdA+TIAuKh2ue1t8kfMjk52X68UJ0V\n+zRYBZK0duwB6PkiD4dw3Vygx9LZVKyKkwRirYjwFHjyol0YMIBZR2UUgppbCjbi\nLez3eNQnkvXU1OG4GABOxsvp6dJCectIL/iwdcZOxxHXbvUFMMBsLCiEVLauBUom\nF/pQqSd1rD3YX1dDUcm3zjuct3JcgRhbBohiei7kuQKBgQDeJgZ0qePkskvG1sw3\n1mZzEG0LJ68AO2WURofBBw/AXGNV5J+LATi03aPv9wUW0kJKNSEET+5CmF873Qu2\n+lbEI6LmuI2S6KAERIYBErB8G8rDuf+bRj2oujSHKq/SKfWZm+CrElcBCaZhUdtS\n9bGUyureVqtfUT8HVQdTlhaEDQKBgQC5kIB/ALkxrqvUdfDwEjLGWoxac6QdEboE\nkip2TdIzC1WbtoawWaLK4TpvPoAYZf/xWjLyqGbLu+FRXs7CV712eSdqTUpNN0Lu\nne+0iI64kGd5O7jFk6c2IX7eih5htUfTo6RsnPLAiA5xvEi7YYaE8pqGVUHUyYJR\njEqc/+dnnQKBgEm6hxP7OraxcjLpIVg64T+5KOe14QALtpfynKW06UZno1Rjj4v7\n+M0Wbo17B4ZefD/SyEV9Hc+ecKUWpQeyqE9qoGtAv0QNzuX7tBnxEP/v3Wj+d1Ya\nhuZT/pEJ2ta+tFOqB3Pfn16pzD2qhEdRYgHHIxJt42y8M1YEo2zbeFeVAoGAGhVR\nuohjf7RJuueJInWsZW085Unz+5IOT64sAc0Wis5BDk4tyIQQ+euGxzRF1SghPc+r\n8afyKxkRptpovbCPlSOagrqygwANjHTuyLWZOiAyKzxV0I/cpSM4LhfEBX/xxLHv\n3sSA6sc1II+SuaQPwIhJaDB7vGlGxCewJTljUZECgYAmFOGoFNkbP+EmiHHkBngn\nKZ0oIxW7+s9cBOGfDQe7T2hsAA9jOjfAY7Sd2cNlxPJZynVYvGPIGERGg9l7pEte\neCaQOEld3c4VLPYxI8WPv8HLi4kEONA+1VaD10xXHoPseLty3JNLVaNkmMtXkAIi\n0OWxs49soUMk8SiOEeW8xg==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@ubsioneplus.iam.gserviceaccount.com",
  "client_id": "111052243239470638732",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ubsioneplus.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// ===== CORS =====
app.use(cors({
  origin: "https://ubsioneplus.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // <--- sekarang valid
}));

// Jangan lupa handle OPTIONS
app.options("*", (req, res) => {
  res.sendStatus(200);
});

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
