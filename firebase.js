// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABggwlVe_2yAzrnrHRhu1w1LCA2hCSpMA",
  authDomain: "inventory-management-5d30c.firebaseapp.com",
  projectId: "inventory-management-5d30c",
  storageBucket: "inventory-management-5d30c.appspot.com",
  messagingSenderId: "161394433276",
  appId: "1:161394433276:web:43ac0cc3e534c820454b79",
  measurementId: "G-73VMZT0KPY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };
