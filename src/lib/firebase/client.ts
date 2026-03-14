import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAY9SfuUje8UsiJEo1CItemgsMIKtvSQ8Y",
    authDomain: "accident-b70dc.firebaseapp.com",
    projectId: "accident-b70dc",
    storageBucket: "accident-b70dc.firebasestorage.app",
    messagingSenderId: "1062151894453",
    appId: "1:1062151894453:web:b5c4188fdb090fcf4095fc",
    measurementId: "G-B6ZDKG501B"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
