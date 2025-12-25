import { Router, Request, Response } from 'express';
import { storage } from '../services/cloudinary';
import { verifyAuth } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: storage });

// POST /api/uploads/file (Authenticated)
// Uses Cloudinary for storage
router.post('/file', verifyAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Cloudinary puts the URL in req.file.path
        const publicUrl = req.file.path;

        res.json({
            success: true,
            data: {
                url: publicUrl,
                path: req.file.filename // Cloudinary public_id
            }
        });

    } catch (error: any) {
        console.error('Upload error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ success: false, error: 'Internal server error during upload' });
    }
});

export default router;
