import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('Testing Cloudinary Connection...');
console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`API Key: ${process.env.CLOUDINARY_API_KEY ? '***' : 'Missing'}`);
console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET ? '***' : 'Missing'}`);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping()
    .then(res => {
        console.log('Success! Cloudinary ping response:', res);
    })
    .catch(err => {
        console.error('Error connecting to Cloudinary:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    });
