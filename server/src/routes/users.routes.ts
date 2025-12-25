import { Router, Request, Response } from 'express';
import admin, { db } from '../services/firebase';
import { verifyAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// POST /api/users/visit - Register a user visit to a restaurant
router.post('/visit', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.body;
        const { uid } = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        await db.collection('users').doc(uid).update({
            visitedRestaurants: admin.firestore.FieldValue.arrayUnion(restaurantId)
        });

        res.json({ success: true, message: 'Visit registered' });
    } catch (error) {
        console.error('Register visit error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/users/customers?restaurantId=...
router.get('/customers', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.query;
        const { uid } = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        // Verify ownership/permission
        const restaurantDoc = await db.collection('restaurants').doc(restaurantId as string).get();
        if (restaurantDoc.data()?.ownerId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        // Find users who have visited this restaurant (assuming visitedRestaurants array exists on users)
        // Or finding orders/reservations for this restaurant and getting unique user info. 
        // For now, let's assuming a simple user query or listing all users if no specific 'customer' relation exists yet, 
        // OR better, we query orders for this restaurant to get unique customers.
        // Given the prompt simplicity, I will implement a fetch from 'users' collection where 'visitedRestaurants' contains this ID.

        const snapshot = await db.collection('users')
            .where('visitedRestaurants', 'array-contains', restaurantId)
            .get();

        const customers = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().displayName || 'Unknown',
            email: doc.data().email,
            phone: doc.data().phone || doc.data().phoneNumber
        }));

        res.json({ success: true, data: customers });

    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/users/:uid
router.get('/:uid', verifyAuth, async (req: Request, res: Response) => {
    const { uid } = req.params;
    const requester = req.user!;

    // Allow access if requester is admin OR requester is the user themselves
    if (requester.role !== 'admin' && requester.uid !== uid) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: userDoc.data() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/users (Admin only)
router.get('/', verifyAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
