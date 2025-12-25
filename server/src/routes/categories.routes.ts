import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth, verifyOwnership } from '../middleware/auth';

const router = Router();
const CATEGORY_COLLECTION = 'categories';

// GET /api/categories - Get all categories for a restaurant
router.get('/', async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        const snapshot = await db.collection(CATEGORY_COLLECTION)
            .where('restaurantId', '==', restaurantId)
            // .orderBy('order', 'asc') // Potential future enhancement
            .get();

        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/categories - Create new category (Auth required)
router.post('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { name, image, restaurantId } = req.body;
        const { uid } = req.user!;

        if (!restaurantId || !name) {
            return res.status(400).json({ success: false, error: 'Restaurant ID and Name are required' });
        }

        const isOwner = await verifyOwnership(uid, restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const newCategory = {
            name,
            image: image || null,
            restaurantId,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection(CATEGORY_COLLECTION).add(newCategory);

        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...newCategory }
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/categories/:id - Update category (Auth required)
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const { uid } = req.user!;

        const docRef = db.collection(CATEGORY_COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const categoryData = doc.data();
        const isOwner = await verifyOwnership(uid, categoryData?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        await docRef.update({
            name,
            image,
            updatedAt: new Date().toISOString()
        });

        res.json({ success: true, data: { id, ...categoryData, name, image } });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { uid } = req.user!;

        const docRef = db.collection(CATEGORY_COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const categoryData = doc.data();
        const isOwner = await verifyOwnership(uid, categoryData?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        await docRef.delete();
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
