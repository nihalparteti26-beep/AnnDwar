import { Router } from 'express';
import { 
  sendRegOtpHandler, 
  verifyRegOtpHandler, 
  sendUserOtpHandler,
  getGatewayStatusHandler 
} from '../controllers/authController.js';

const router = Router();

router.post('/send-registration-otp', sendRegOtpHandler);
router.post('/verify-registration-otp', verifyRegOtpHandler);
router.post('/send-user-otp', sendUserOtpHandler);
router.get('/gateway-status', getGatewayStatusHandler);

export default router;
