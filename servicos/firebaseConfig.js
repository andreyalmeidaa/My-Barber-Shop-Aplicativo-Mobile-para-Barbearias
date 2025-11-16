
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyDMn8nymZmDoci9GtCrxmfCcpdE9Ip5b_8",
  authDomain: "barbearia-e4f4d.firebaseapp.com",
  databaseURL: "https://barbearia-e4f4d-default-rtdb.firebaseio.com",
  projectId: "barbearia-e4f4d",
  storageBucket: "barbearia-e4f4d.firebasestorage.app", 
  //storageBucket: "barbearia-e4f4d.appspot.com",
  
  messagingSenderId: "330593164186",
  appId: "1:330593164186:web:c13f76b76ee172e7377823",
};



const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage };
