import { Router } from 'express';
import { cropCheck } from '../controllers/cropController.js';

const router = Router();

router.post('/crop-check', cropCheck);

export default router;
