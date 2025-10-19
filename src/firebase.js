import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD9CVt9Nmd9SYOtBlAf3HTHt_7_N1wBxWY',
  authDomain: 'eastlynne-bookings.firebaseapp.com',
  projectId: 'eastlynne-bookings',
  storageBucket: 'eastlynne-bookings.firebasestorage.app',
  messagingSenderId: '428929942705',
  appId: '1:428929942705:web:f5120a189f94ed2da9ce90',
  measurementId: 'G-MHBEYLE77Q',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
