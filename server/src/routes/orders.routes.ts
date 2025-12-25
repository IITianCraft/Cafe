import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { verifyAuth, requireAdmin, verifyOwnership } from '../middleware/auth';

const router = Router();
const ORDERS_COLLECTION = 'orders';

// POST /api/orders (Authenticated User)
router.post('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { items, total, restaurantId } = req.body;
        const requester = req.user!;

        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        let verifiedStatus = 'pending';
        // Verify Razorpay Payment if applicable
        const { paymentMethod, transactionId, paymentStatus } = req.body;

        if (paymentMethod === 'razorpay' && transactionId && paymentStatus === 'paid') {
            try {
                const keyId = process.env.RAZORPAY_KEY_ID;
                const keySecret = process.env.RAZORPAY_KEY_SECRET;

                if (keyId && keySecret) {
                    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
                    const verifyRes = await fetch(`https://api.razorpay.com/v1/payments/${transactionId}`, {
                        headers: {
                            'Authorization': `Basic ${auth}`
                        }
                    });

                    if (verifyRes.ok) {
                        const paymentData = await verifyRes.json();
                        if (paymentData.status === 'captured') {
                            verifiedStatus = 'paid';
                        } else {
                            console.warn(`Payment ${transactionId} status is ${paymentData.status}, not captured.`);
                            // Fallback to pending or reject? Let's allow but keep strict for 'paid'
                        }
                    } else {
                        console.error('Razorpay verification failed:', await verifyRes.text());
                    }
                } else {
                    console.warn('Razorpay keys not configured on server.');
                }
            } catch (verError) {
                console.error('Payment verification error:', verError);
            }
        } else if (paymentStatus === 'paid') {
            // Trust other methods? Or default to verifiedStatus if passed?
            // For now, if cod, verifiedStatus remains 'pending' usually, but if 'paid' passed for some reason (e.g. mock), accept it
            verifiedStatus = paymentStatus;
        }


        const newOrder = {
            userId: requester.uid,
            items,
            total,
            restaurantId,
            status: verifiedStatus, // Use verified status
            paymentMethod,
            transactionId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userEmail: requester.email,
            deliveryAddress: req.body.deliveryAddress || null,
            notes: req.body.notes || null,
            tableNumber: req.body.tableNumber || null,
            orderType: req.body.orderType || 'delivery'
        };

        const docRef = await db.collection(ORDERS_COLLECTION).add(newOrder);
        res.status(201).json({ success: true, data: { id: docRef.id, ...newOrder } });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

// GET /api/orders (Authenticated)
// Params: restaurantId (optional).
// Logic:
// 1. If restaurantId provided:
//    - If User is Owner: Return ALL orders for that restaurant.
//    - If User is NOT Owner: Return ONLY User's orders for that restaurant.
// 2. If restaurantId NOT provided:
//    - Return ALL orders for that User (Global history).
router.get('/', verifyAuth, async (req: Request, res: Response) => {
    try {
        const requester = req.user!;
        const { restaurantId, status } = req.query;
        let query: FirebaseFirestore.Query = db.collection(ORDERS_COLLECTION);

        if (restaurantId) {
            const isOwner = await verifyOwnership(requester.uid, String(restaurantId));

            // Base filter by restaurant
            query = query.where('restaurantId', '==', restaurantId);

            if (isOwner) {
                // Admin View: Can see all orders for this restaurant
                // Optional status filter
                if (status) {
                    query = query.where('status', '==', status);
                }
            } else {
                // Customer View: Can only see their OWN orders in this restaurant
                query = query.where('userId', '==', requester.uid);
            }
        } else {
            // Global Customer View: See all my orders across platform
            query = query.where('userId', '==', requester.uid);
        }

        const snapshot = await query.get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // In-memory sort by date desc
        orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal error' });
    }
});

// GET /api/orders/:id
router.get('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const doc = await db.collection(ORDERS_COLLECTION).doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const data = doc.data();
        const requester = req.user!;

        // Check Access: Owner of restaurant OR Creator of order
        const isOwner = await verifyOwnership(requester.uid, data?.restaurantId);
        const isCreator = data?.userId === requester.uid;

        if (!isOwner && !isCreator) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        res.json({ success: true, data: { id: doc.id, ...data } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/orders/:id (Restaurant Owner only)
router.put('/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, error: 'Status required' });

        const docRef = db.collection(ORDERS_COLLECTION).doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ success: false, error: 'Order not found' });

        const data = doc.data();
        const requester = req.user!;

        // Check Ownership
        const isOwner = await verifyOwnership(requester.uid, data?.restaurantId);
        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this restaurant' });
        }

        await docRef.update({
            status,
            updatedAt: new Date().toISOString()
        });

        res.json({ success: true, data: { id: req.params.id, status } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
