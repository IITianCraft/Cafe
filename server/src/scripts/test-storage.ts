
import { storage } from '../services/firebase';

async function testStorage() {
    try {
        console.log('Testing storage access...');
        const [buckets] = await storage.bucket().storage.getBuckets();
        console.log('Buckets found:');
        buckets.forEach(bucket => {
            console.log(`- ${bucket.name}`);
        });

        const configuredBucketName = process.env.FIREBASE_STORAGE_BUCKET;
        console.log(`Configured bucket: ${configuredBucketName}`);

        if (configuredBucketName) {
            const bucket = storage.bucket(configuredBucketName);
            const [exists] = await bucket.exists();
            console.log(`Does configured bucket exist? ${exists}`);
        }

    } catch (error) {
        console.error('Error testing storage:', error);
    }
}

testStorage();
