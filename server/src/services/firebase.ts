import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const getFirebaseParams = () => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing Firebase Admin configuration variables.');
        // In production, we might want to throw error, but for build step dry-run we might need to be lenient?
        // For this specific task, we'll throw error to fail fast if config is missing which is good for debugging.
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing Firebase Admin configuration');
        }
    }

    return {
        projectId,
        clientEmail,
        privateKey,
    };
};

const params = getFirebaseParams();

if (params.projectId) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: params.projectId,
            clientEmail: params.clientEmail,
            privateKey: params.privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
} else {
    // Fallback or skip if strictly validating. 
    // This allows the app to start even if envs are missing in dev (though functionalify will break)
    console.warn("Firebase Admin not initialized due to missing config.");
}



export const db = admin.apps.length ? admin.firestore() : {} as FirebaseFirestore.Firestore;
export const auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
export const storage = admin.apps.length ? admin.storage() : {} as admin.storage.Storage;

if (!admin.apps.length) {
    console.error("CRITICAL: Firebase Admin not initialized. All database calls will fail.");
    console.error("Please check your .env file in the /server directory.");
}

export default admin;
