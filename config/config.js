// Use Firebase compat to access auth on older API surface
import firebase from 'firebase/compat/app';//compat hiya version jdida mta3 firebase 
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import 'firebase/compat/database';// realtime database
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {  
  apiKey: "AIzaSyBigtxoqPtYw0gzZcdQrDBdGb-ZU9X7ZLY",
  authDomain: "firstapp-3b03b.firebaseapp.com",
  projectId: "firstapp-3b03b",
  storageBucket: "firstapp-3b03b.firebasestorage.app",
  messagingSenderId: "1005868183480",
  appId: "1:1005868183480:web:42eba4d4cd97f199de294d",
  measurementId: "G-Z6YSKW3CJG"
};

// Initialize Firebase
const initApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const database = firebase.database();

export { auth, db, database };
export default initApp;

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://poaiudusxkdmbrgqrgix.supabase.co'
const supabaseKey = 'sb_publishable_Xm_ndO9RgS3OIbP57-LCsg_XkhasB07'
const supabase = createClient(supabaseUrl, supabaseKey)
export { supabase };