// server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";

// ========= ENV CONFIG =========
// lokal pakai .env.backup
// Railway pakai Variables panel (tidak butuh file .env)
dotenv.config({ path: ".env.backup" });

// ========= FIREBASE ADMIN =========
const serviceAccount = {
  type: process.env.FB_TYPE,
  project_id: process.env.FB_PROJECT_ID,
  private_key_id: process.env.FB_PRIVATE_KEY_ID,
  private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FB_CLIENT_EMAIL,
  client_id: process.env.FB_CLIENT_ID,
  auth_uri: process.env.FB_AUTH_URI,
  token_uri: process.env.FB_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_CERT,
  client_x509_cert_url: process.env.FB_CLIENT_CERT,
  universe_domain: process.env.FB_UNIVERSE_DOMAIN,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ========= EXPRESS APP =========
const app = express();
app.use(express.json());

// ========= CORS CONFIG =========
app.use(
  cors({
    origin: [
      "https://ubsioneplus.vercel.app",
      "http://localhost:3000",
      "https://backend-kampus-production.up.railway.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", (req, res) => res.sendStatus(200));

// ========= NODEMAILER =========
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ========================================
//                ROUTES
// ========================================

// -------- REGISTER --------
app.post("/api/auth/register", async (req, res) => {
  const { email, password, nama, nim } = req.body;

  if (!email || !password || !nama || !nim) {
    return res.status(400).json({ message: "Field wajib diisi!" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nama,
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: userRecord,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

// -------- LOGIN --------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email dan password wajib diisi!" });

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
    return res.status(401).json({
      message: "Login gagal, email tidak ditemukan atau salah.",
    });
  }
});

// -------- FORGOT PASSWORD --------
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email wajib diisi!" });

  try {
const link = await admin.auth().generatePasswordResetLink(email, {
  url: "https://ubsioneplus.vercel.app/reset",
  handleCodeInApp: true,
});

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password UBSI",
      html: `<p>Klik link berikut untuk reset password:</p><a href="${link}">${link}</a>`,
    });

    return res.status(200).json({
      message: "Link reset password telah dikirim ke email Anda.",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengirim email reset password.",
    });
  }
});

// -------- RESET PASSWORD --------
app.post("/api/auth/reset-password", async (req, res) => {
  const { uid, newPassword } = req.body;

  if (!uid || !newPassword)
    return res.status(400).json({ message: "Data reset wajib diisi!" });

  try {
    await admin.auth().updateUser(uid, { password: newPassword });

    return res.status(200).json({
      message: "Password berhasil direset!",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "Gagal reset password.",
    });
  }
});

// -------- DEFAULT ROUTE --------
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// ========= START SERVER =========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
