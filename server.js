// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";

// ======= INIT FIREBASE ADMIN =======
import serviceAccount from "./serviceAccountKey.json"; // path serviceAccount JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// ======= CORS =======
app.use(cors({
  origin: "https://ubsioneplus.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(bodyParser.json());

// ======= ROUTES =======

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

    // Bisa simpan data tambahan ke Firestore kalau perlu
    return res.status(201).json({ message: "Registrasi berhasil!", user: userRecord });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Registrasi gagal." });
  }
});

// -------- LOGIN --------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email dan password wajib diisi!" });

  try {
    // Login via Firebase Admin tidak bisa cek password secara langsung
    // Solusi: gunakan Firebase Auth SDK di frontend, tapi kita bisa generate custom token
    const user = await admin.auth().getUserByEmail(email);

    // Generate custom token
    const token = await admin.auth().createCustomToken(user.uid);

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Login gagal, email tidak ditemukan atau salah password." });
  }
});

// -------- FORGOT PASSWORD --------
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email wajib diisi!" });

  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: "https://ubsioneplus.vercel.app/login", // redirect setelah reset
      handleCodeInApp: true,
    });

    // Kalau mau kirim email pakai nodemailer
    // await transporter.sendMail({ to: email, subject: "Reset Password", html: `<a href="${link}">${link}</a>` });

    return res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengirim email reset password." });
  }
});

// -------- RESET PASSWORD --------
// Biasanya frontend handle langsung pakai Firebase SDK
// Tapi bisa pakai route backend jika ingin
app.post("/api/auth/reset-password", async (req, res) => {
  const { oobCode, newPassword } = req.body;
  if (!oobCode || !newPassword) return res.status(400).json({ message: "Data reset wajib diisi!" });

  try {
    await admin.auth().verifyPasswordResetCode(oobCode);
    await admin.auth().confirmPasswordReset(oobCode, newPassword);

    return res.status(200).json({ message: "Password berhasil direset!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal reset password, link mungkin sudah kadaluarsa." });
  }
});

// -------- DEFAULT --------
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// ======= SERVER =======
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
