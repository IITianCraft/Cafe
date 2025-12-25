import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth, requireAdmin, verifyOwnership } from '../middleware/auth';

const router = Router();

const MENU_COLLECTION = 'menus';

// GET /api/menu (Public) - Requires restaurantId query param
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, limit, restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        let query: FirebaseFirestore.Query = db.collection(MENU_COLLECTION).where('restaurantId', '==', restaurantId);

        if (category) {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.get();
        let menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (limit) {
            menuItems = menuItems.slice(0, Number(limit));
        }

        res.json({ success: true, data: menuItems });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/menu/:id (Public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const doc = await db.collection(MENU_COLLECTION).doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        res.json({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/menu (Authenticated Owner only)
router.post('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { title, description, price, category, imagePath, available, restaurantId } = req.body;
        const { uid } = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        const isOwner = await verifyOwnership(uid, restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this restaurant' });
        }

        const newItem = {
            title,
            description,
            price: Number(price),
            category,
            imagePath: imagePath || null,
            available: available !== false,
            restaurantId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection(MENU_COLLECTION).add(newItem);
        res.status(201).json({ success: true, data: { id: docRef.id, ...newItem } });
    } catch (error) {
        console.error('Create menu error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/menu/:id (Authenticated Owner only)
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const docRef = db.collection(MENU_COLLECTION).doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        const itemData = doc.data();
        const { uid } = req.user!;

        // Check ownership of the restaurant the item belongs to
        const isOwner = await verifyOwnership(uid, itemData?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this item' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        // Prevent changing restaurantId and id
        delete updates.id;
        delete updates.restaurantId;

        await docRef.update(updates);
        res.json({ success: true, data: { id: req.params.id, ...updates } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/menu/:id (Authenticated Owner only)
router.delete('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const docRef = db.collection(MENU_COLLECTION).doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        const itemData = doc.data();
        const { uid } = req.user!;

        const isOwner = await verifyOwnership(uid, itemData?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this item' });
        }

        await docRef.delete();
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
