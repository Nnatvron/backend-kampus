import admin from "firebase-admin";

// Cegah duplikat init di Vercel serverless
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN)),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
