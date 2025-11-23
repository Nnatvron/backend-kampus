import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { nim, nama, email, password, phone, jurusan, jenjang } = req.body;

    if (!email || !password || !nim || !nama) {
      return res.status(400).json({ message: "Email, password, NIM, dan nama wajib diisi" });
    }

    // Buat user di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Simpan data tambahan di Firestore
    await setDoc(doc(db, "users", user.uid), {
      nim,
      nama,
      email,
      phone: phone || "",
      jurusan: jurusan || "",
      jenjang: jenjang || "",
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      uid: user.uid,
      user: { nim, nama, email, phone, jurusan, jenjang },
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "auth/email-already-in-use") {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    res.status(500).json({ message: err.message });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email dan password wajib diisi" });

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ambil data tambahan user dari Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      return res.status(404).json({ message: "Data user tidak ditemukan" });
    }

    res.status(200).json({
      message: "Login berhasil",
      user: { uid: user.uid, ...userDoc.data() },
    });
  } catch (err) {
    console.error("Login error:", err);
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      return res.status(400).json({ message: "Email atau password salah" });
    }
    res.status(500).json({ message: err.message });
  }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi" });

    await sendPasswordResetEmail(auth, email);

    res.status(200).json({ message: "Link reset password telah dikirim ke email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }
    res.status(500).json({ message: err.message });
  }
};
