import { Router } from 'express';
import { getLogistics } from '../controllers/logisticsController.js';

const router = Router();

router.get('/', getLogistics);

export default router;
