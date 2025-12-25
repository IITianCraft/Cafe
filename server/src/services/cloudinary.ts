import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage
export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nourish-admin', // Optional: Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'ico'], // Constrain allowed formats
        public_id: (req: any, file: any) => {
            // Optional: Generate a unique public ID (filename)
            const name = file.originalname.split('.')[0];
            return `${Date.now()}-${name}`;
        },
    } as any // Type assertion needed due to some type definition mismatches in the library
});

export default cloudinary;
