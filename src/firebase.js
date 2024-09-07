import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "img-upload-63d14.firebaseapp.com",
  projectId: "img-upload-63d14",
  storageBucket: "img-upload-63d14.appspot.com",
  messagingSenderId: "895500276520",
  appId: "1:895500276520:web:107e2a1707fa63729bb61d",
  measurementId: "G-ZHWRGVM4GS"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app); 

export { storage, analytics }; 