import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// إعدادات Firebase - يتم جلبها من متغيرات البيئة لضمان الأمان
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY || 'dummy-key',
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

let auth = null;
let googleProvider = null;
let facebookProvider = null;
let microsoftProvider = null;

try {
  // تهيئة Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  auth = firebase.auth();

  // مزودو تسجيل الدخول
  googleProvider = new firebase.auth.GoogleAuthProvider();
  facebookProvider = new firebase.auth.FacebookAuthProvider();
  microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, googleProvider, facebookProvider, microsoftProvider };
