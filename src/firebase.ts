import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2bEzj7-7UXO0zQU6cAOu8XLgifg6Yj-w",
  authDomain: "mini-social-media-46d81.firebaseapp.com",
  projectId: "mini-social-media-46d81",
  storageBucket: "mini-social-media-46d81.appspot.com",
  messagingSenderId: "760557892469",
  appId: "1:760557892469:web:c9a15b42ee5b4ab2a4d93c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
