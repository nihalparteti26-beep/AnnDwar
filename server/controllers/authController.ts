import { Request, Response } from 'express';
import { 
  sendRegistrationOTP, 
  verifyRegistrationOTP, 
  sendUserOTP 
} from '../services/otpService.js';

export const sendRegOtpHandler = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const result = await sendRegistrationOTP(phone);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in send-registration-otp:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to dispatch OTP.' });
  }
};

export const verifyRegOtpHandler = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP are required.' });
    }

    const result = verifyRegistrationOTP(phone, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in verify-registration-otp:', error);
    res.status(500).json({ success: false, error: error.message || 'OTP verification failed.' });
  }
};

export const sendUserOtpHandler = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Farmer ID or registered phone is required.' });
    }

    const result = await sendUserOTP(identifier);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in send-user-otp:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to dispatch user OTP.' });
  }
};

export const getGatewayStatusHandler = (req: Request, res: Response) => {
  const hasFast2Sms = Boolean(process.env.FAST2SMS_API_KEY);
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

  res.json({
    status: 'active',
    activeProvider: hasFast2Sms ? 'Fast2SMS' : hasTwilio ? 'Twilio' : 'local_environment',
    isLiveGateway: hasFast2Sms || hasTwilio,
    providersConfigured: {
      fast2sms: hasFast2Sms,
      twilio: hasTwilio
    }
  });
};
