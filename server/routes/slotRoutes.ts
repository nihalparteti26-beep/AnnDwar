import { Router } from 'express';
import { getActiveSlot, bookSlot, rescheduleSlot, getAiRecommendations } from '../controllers/slotController.js';

const router = Router();

router.get('/active', getActiveSlot);
router.get('/ai-recommendations', getAiRecommendations);
router.post('/book', bookSlot);
router.post('/reschedule', rescheduleSlot);

export default router;
