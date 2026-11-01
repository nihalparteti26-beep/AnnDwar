import { Router } from 'express';
import { getGodownStocks } from '../controllers/godownController.js';

const router = Router();

router.get('/', getGodownStocks);

export default router;
