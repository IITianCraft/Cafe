import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth, verifyOwnership } from '../middleware/auth';

const router = Router();
const CONTACT_COLLECTION = 'contact_queries';

// POST /api/contact - Submit a query (Public)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { restaurantId, name, email, phone, subject, message } = req.body;

        if (!restaurantId || !name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const newQuery = {
            restaurantId,
            name,
            email,
            phone: phone || null,
            subject,
            message,
            status: 'pending', // pending, responded, closed
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(CONTACT_COLLECTION).add(newQuery);

        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...newQuery }
        });
    } catch (error) {
        console.error('Submit query error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/contact - List queries for a restaurant (Auth required)
router.get('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.query;
        const { uid } = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        const isOwner = await verifyOwnership(uid, restaurantId as string);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const snapshot = await db.collection(CONTACT_COLLECTION)
            .where('restaurantId', '==', restaurantId)
            .get();

        const queries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        res.json({ success: true, data: queries });
    } catch (error) {
        console.error('Get queries error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/contact/:id - Update status/respond (Auth required)
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, response } = req.body;
        const { uid } = req.user!;

        const docRef = db.collection(CONTACT_COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Query not found' });
        }

        const queryData = doc.data();
        const isOwner = await verifyOwnership(uid, queryData?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const updates: any = {};
        if (status) updates.status = status;
        if (response) {
            updates.response = response;
            updates.respondedAt = new Date().toISOString();
            updates.status = 'responded';
        }

        await docRef.update(updates);
        res.json({ success: true, data: { id, ...updates } });
    } catch (error) {
        console.error('Update query error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
