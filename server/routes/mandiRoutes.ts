import { Router } from 'express';
import { getMandis } from '../controllers/mandiController.js';

const router = Router();

router.get('/', getMandis);

export default router;
