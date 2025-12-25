import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../services/firebase';

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                role: 'admin' | 'user';
            };
        }
    }
}

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);

        // Check Firestore for user role
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData?.role || 'user', // Default to 'user' if not specified
        };

        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
    }

    next();
};

export const verifyOwnership = async (uid: string, restaurantId: string): Promise<boolean> => {
    if (!restaurantId) return false;
    const doc = await db.collection('restaurants').doc(restaurantId).get();
    return doc.exists && doc.data()?.ownerId === uid;
};
