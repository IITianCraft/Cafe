
import { storage } from '../services/firebase';
import * as fs from 'fs';

async function createBucket() {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error('FIREBASE_STORAGE_BUCKET not defined in .env');
        return;
    }

    try {
        console.log(`Attempting to create bucket: ${bucketName}`);
        await storage.bucket().storage.createBucket(bucketName, {
            location: 'US-CENTRAL1',
        });
        console.log(`Bucket ${bucketName} created successfully.`);
    } catch (error: any) {
        console.error('Error creating bucket:', error.message);
        fs.writeFileSync('debug_output.json', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

createBucket();
