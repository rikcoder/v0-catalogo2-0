import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBFOzZxEa5gnqRO6RnkrjrJ2_kbfiyQdhA",
  authDomain: "appcatalago-2cf4c.firebaseapp.com",
  projectId: "appcatalago-2cf4c",
  storageBucket: "appcatalago-2cf4c.firebasestorage.app",
  messagingSenderId: "172075237959",
  appId: "1:172075237959:web:5188406c54053814f12762",
  measurementId: "G-M38EK0BQE9",
}

// Evita inicializar múltiplas vezes no Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)