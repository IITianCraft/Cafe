import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// GET /api/reservations?restaurantId=...
router.get('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.query;
        const { uid } = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        // Verify restaurant ownership
        const restaurantDoc = await db.collection('restaurants').doc(restaurantId as string).get();
        if (!restaurantDoc.exists) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }

        if (restaurantDoc.data()?.ownerId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized access to this restaurant' });
        }

        const snapshot = await db.collection('reservations')
            .where('restaurantId', '==', restaurantId)
            .orderBy('date', 'desc')
            .get();

        const reservations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ success: true, data: reservations });
    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/reservations - Create reservation (public or internal)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { restaurantId, ...data } = req.body;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        const newReservation = {
            restaurantId,
            ...data,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('reservations').add(newReservation);

        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...newReservation }
        });
    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
