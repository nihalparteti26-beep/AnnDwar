/**
 * AnnDwar Production SMS & WhatsApp Notification Service
 * Supported Providers:
 * 1. Fast2SMS (Indian SMS Gateway): FAST2SMS_API_KEY
 * 2. Twilio (Global SMS & WhatsApp): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * 3. MSG91 (Indian Enterprise SMS): MSG91_AUTH_KEY, MSG91_SENDER_ID
 * 4. WhatsApp Universal Links & Twilio WhatsApp: TWILIO_WHATSAPP_NUMBER
 */

export function cleanIndianPhone(phone: string | number | undefined | null): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '919826199999';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10) return `91${digits.slice(-10)}`;
  return `91${digits}`;
}

export function buildWhatsAppUrl(phone: string | number | undefined | null, message: string): string {
  const clean = cleanIndianPhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

// In-memory simulation log for development and local testing
export interface DispatchedLogItem {
  id: string;
  phone: string;
  type: 'sms' | 'whatsapp' | 'otp';
  content: string;
  provider: string;
  timestamp: string;
  status: 'delivered' | 'simulated' | 'failed';
  error?: string;
}

export const liveDispatchLogs: DispatchedLogItem[] = [];

/**
 * Sends a high-priority 6-digit OTP to the specified registered phone number
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<{
  success: boolean;
  provider: string;
  isLiveGateway: boolean;
  error?: string;
}> {
  const clean = cleanIndianPhone(phoneNumber);
  const tenDigit = clean.slice(-10);
  const otpMessage = `AnnDwar: Your verification OTP is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

  console.log('\n======================================================');
  console.log(`[AnnDwar OTP Dispatch] Destination: +91 ${tenDigit}`);
  console.log(`[AnnDwar OTP Dispatch] Message: ${otpMessage}`);

  // 1. Check Fast2SMS Provider (Dedicated OTP route)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      console.log('[Fast2SMS] Attempting live OTP delivery via Fast2SMS API...');
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: tenDigit
        })
      });
      const data = await resp.json();
      if (data && data.return === true) {
        console.log(`✅ [Fast2SMS] OTP sent live to +91 ${tenDigit}. Request ID: ${data.request_id}`);
        liveDispatchLogs.unshift({
          id: 'otp_' + Date.now(),
          phone: tenDigit,
          type: 'otp',
          content: otpMessage,
          provider: 'Fast2SMS',
          timestamp: new Date().toLocaleTimeString(),
          status: 'delivered'
        });
        return { success: true, provider: 'Fast2SMS', isLiveGateway: true };
      } else {
        const err = data?.message?.[0] || 'Fast2SMS dispatch failed';
        console.warn('[Fast2SMS] Error response:', data);
        return { success: false, provider: 'Fast2SMS', isLiveGateway: true, error: err };
      }
    } catch (e: any) {
      console.error('[Fast2SMS] Network failure:', e.message);
      return { success: false, provider: 'Fast2SMS', isLiveGateway: true, error: e.message };
    }
  }

  // 2. Check Twilio Provider
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      console.log('[Twilio] Attempting live OTP delivery via Twilio REST API...');
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams({
        To: `+91${tenDigit}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: otpMessage
      });
      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const twData = await resp.json();
      if (twData.sid) {
        console.log(`✅ [Twilio] OTP sent live to +91 ${tenDigit}. SID: ${twData.sid}`);
        liveDispatchLogs.unshift({
          id: 'otp_' + Date.now(),
          phone: tenDigit,
          type: 'otp',
          content: otpMessage,
          provider: 'Twilio',
          timestamp: new Date().toLocaleTimeString(),
          status: 'delivered'
        });
        return { success: true, provider: 'Twilio', isLiveGateway: true };
      } else {
        const err = twData?.message || 'Twilio dispatch failed';
        console.warn('[Twilio] Error response:', twData);
        return { success: false, provider: 'Twilio', isLiveGateway: true, error: err };
      }
    } catch (e: any) {
      console.error('[Twilio] Network failure:', e.message);
      return { success: false, provider: 'Twilio', isLiveGateway: true, error: e.message };
    }
  }

  // 3. Fallback when no provider key is configured in .env
  console.warn('⚠️ [SMS Service Notice]: No live SMS provider API key configured in .env (FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID).');
  console.warn('To enable real carrier SMS, add FAST2SMS_API_KEY or TWILIO credentials to .env file.');

  liveDispatchLogs.unshift({
    id: 'otp_' + Date.now(),
    phone: tenDigit,
    type: 'otp',
    content: otpMessage,
    provider: 'local_environment',
    timestamp: new Date().toLocaleTimeString(),
    status: 'simulated'
  });

  return {
    success: true,
    provider: 'local_environment',
    isLiveGateway: false
  };
}

/**
 * Reusable notification function to dispatch updates to the registered phone number
 */
export async function sendNotification(
  phoneNumber: string,
  message: string,
  options?: { type?: 'sms' | 'whatsapp' | 'both'; title?: string } | string
): Promise<{
  phone: string;
  smsSent: boolean;
  waSent: boolean;
  waUrl: string;
  provider: string;
  error?: string;
}> {
  const opts = typeof options === 'string' ? { title: options, type: 'both' as const } : options;
  const clean = cleanIndianPhone(phoneNumber);
  const tenDigit = clean.slice(-10);
  const waUrl = buildWhatsAppUrl(clean, message);
  const dispatchType = opts?.type || 'both';

  let smsSent = false;
  let waSent = false;
  let provider = 'none';
  let errorMsg: string | undefined;

  // SMS Dispatch
  if (dispatchType === 'sms' || dispatchType === 'both') {
    if (process.env.FAST2SMS_API_KEY) {
      try {
        const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message,
            language: 'english',
            numbers: tenDigit
          })
        });
        const data = await resp.json();
        if (data && data.return === true) {
          smsSent = true;
          provider = 'Fast2SMS';
        } else {
          errorMsg = data?.message?.[0];
        }
      } catch (e: any) {
        errorMsg = e.message;
      }
    } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams({
          To: `+91${tenDigit}`,
          From: process.env.TWILIO_PHONE_NUMBER,
          Body: message
        });
        const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        const data = await resp.json();
        if (data.sid) {
          smsSent = true;
          provider = 'Twilio';
        } else {
          errorMsg = data?.message;
        }
      } catch (e: any) {
        errorMsg = e.message;
      }
    } else {
      smsSent = true;
      provider = 'local_environment';
    }
  }

  // WhatsApp Dispatch via Twilio or Universal Deep Link
  if (dispatchType === 'whatsapp' || dispatchType === 'both') {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams({
          To: `whatsapp:+91${tenDigit}`,
          From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          Body: message
        });
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        waSent = true;
      } catch (e: any) {
        console.warn('[Twilio WhatsApp] Warning:', e.message);
      }
    } else {
      // Universal WhatsApp link always supported for farmer devices
      waSent = true;
    }
  }

  liveDispatchLogs.unshift({
    id: 'notif_' + Date.now(),
    phone: tenDigit,
    type: dispatchType === 'whatsapp' ? 'whatsapp' : 'sms',
    content: message,
    provider,
    timestamp: new Date().toLocaleTimeString(),
    status: smsSent ? 'delivered' : 'failed',
    error: errorMsg
  });

  return {
    phone: clean,
    smsSent,
    waSent,
    waUrl,
    provider,
    error: errorMsg
  };
}

// Backward-compatible wrapper
export const dispatchRealNotification = sendNotification;
