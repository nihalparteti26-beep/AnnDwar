import { Router } from 'express';
import {
  getLiveQueue,
  getStages,
  advanceStage,
  updateStage,
  getOperatorQueue,
  getLatestDirective,
  getNotifications,
  postOperatorAction
} from '../controllers/queueController.js';

const router = Router();

router.get('/live', getLiveQueue);
router.get('/stages', getStages);
router.post('/advance-stage', advanceStage);
router.post('/update-stage', updateStage);

// Live Dynamic Operator Queue & Directive Endpoints
router.get('/farmers', getOperatorQueue);
router.get('/directive', getLatestDirective);
router.get('/notifications', getNotifications);
router.post('/action', postOperatorAction);

export default router;
