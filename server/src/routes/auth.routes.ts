import { Router, Request, Response } from 'express';
import { auth, db } from '../services/firebase';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// POST /api/auth/verify
router.post('/verify', async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, error: 'Authorization header required' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Get or create user doc
        const userRef = db.collection('users').doc(uid);
        let userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create new user with default role 'user'
            const newUser = {
                name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
                email: decodedToken.email,
                role: 'user',
                createdAt: new Date().toISOString(),
                profileUrl: decodedToken.picture || null
            };
            await userRef.set(newUser);
            userDoc = await userRef.get();
        }

        const userData = userDoc.data();

        // Verify consistency: ensure role exists, default to user if corrupted
        if (!userData?.role) {
            await userRef.update({ role: 'user' });
            userData!.role = 'user';
        }

        res.json({
            success: true,
            data: {
                uid,
                ...userData
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

export default router;
