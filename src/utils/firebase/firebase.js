import admin from "firebase-admin";
import config from "../../config/index.js"; 

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.FIREBASE_PROJECT_ID,
    privateKeyId: config.FIREBASE_PRIVATE_KEY_ID,
    privateKey: config.FIREBASE_PRIVATE_KEY,
    clientEmail: config.FIREBASE_CLIENT_EMAIL,
    clientId: config.FIREBASE_CLIENT_ID
  }),
});

export default admin;
