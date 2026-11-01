import authRoutes from './authRoutes.js';
import { Router } from 'express';
import farmerRoutes from './farmerRoutes.js';
import slotRoutes from './slotRoutes.js';
import queueRoutes from './queueRoutes.js';
import cropRoutes from './cropRoutes.js';
import mandiRoutes from './mandiRoutes.js';
import logisticsRoutes from './logisticsRoutes.js';
import godownRoutes from './godownRoutes.js';
import compassRoutes from './compassRoutes.js';
import { getStages, updateStage } from '../controllers/queueController.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Anndwar', time: new Date().toISOString() });
});

// Modular Routes
router.use('/auth', authRoutes);
router.use('/farmer', farmerRoutes);
router.use('/slots', slotRoutes);
router.use('/queue', queueRoutes);
router.get('/stages', getStages);
router.post('/stages/update', updateStage);
router.use('/ai', cropRoutes);
router.use('/mandis', mandiRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/godown', godownRoutes);
router.use('/compass', compassRoutes);

export default router;
