import { Router } from 'express';
import {
  getFarmerProfile,
  updateFarmerProfile,
  getFarmerDocuments,
  getFarmerPayments,
  registerFarmer,
  loginFarmer,
  updateFarmerDbt,
} from '../controllers/farmerController.js';
import { getNotifications } from '../controllers/queueController.js';

const router = Router();

router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.get('/documents', getFarmerDocuments);
router.get('/payments', getFarmerPayments);
router.get('/notifications', getNotifications);
router.post('/register', registerFarmer);
router.post('/login', loginFarmer);
router.post('/dbt-status', updateFarmerDbt);

export default router;
