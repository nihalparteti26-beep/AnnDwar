import crypto from 'crypto';
import { sendOTP, cleanIndianPhone } from './notificationService.js';
import { db } from '../db.js';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  verified: boolean;
}

// In-memory store for active OTPs keyed by clean 10-digit phone
const otpStore = new Map<string, OtpRecord>();

// TTL configurations
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 3;

/**
 * Validates Indian 10-digit mobile number format
 */
export function validateIndianMobile(phone: string): { isValid: boolean; cleanPhone: string; error?: string } {
  const digits = String(phone || '').replace(/\D/g, '');
  let tenDigit = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    tenDigit = digits.slice(2);
  } else if (digits.length > 10) {
    tenDigit = digits.slice(-10);
  }

  if (tenDigit.length !== 10 || !/^[6-9]\d{9}$/.test(tenDigit)) {
    return {
      isValid: false,
      cleanPhone: tenDigit,
      error: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9).'
    };
  }

  return { isValid: true, cleanPhone: tenDigit };
}

/**
 * Mask phone number for secure client responses
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 2)}******${digits.slice(-2)}`;
}

/**
 * Dispatches an OTP to the exact phone number entered during registration
 */
export async function sendRegistrationOTP(phoneNumber: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  cooldownSeconds?: number;
  provider?: string;
  isLiveGateway?: boolean;
}> {
  const { isValid, cleanPhone, error } = validateIndianMobile(phoneNumber);
  if (!isValid) {
    return { success: false, error };
  }

  const now = Date.now();
  const existing = otpStore.get(cleanPhone);

  // Enforce rate-limiting: minimum 60 seconds between resends
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      cooldownSeconds: remainingSeconds
    };
  }

  // Generate cryptographically secure 6-digit OTP
  const randomCode = crypto.randomInt(100000, 999999).toString();

  // Store in memory with 5-minute expiry
  otpStore.set(cleanPhone, {
    code: randomCode,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
    verified: false
  });

  // Dispatch OTP via SMS provider
  const dispatchRes = await sendOTP(cleanPhone, randomCode);

  if (!dispatchRes.success) {
    return {
      success: false,
      error: dispatchRes.error || 'Failed to deliver OTP to your mobile number. Please check the number and try again.'
    };
  }

  return {
    success: true,
    message: `OTP sent successfully to ${maskPhone(cleanPhone)}. Valid for 5 minutes.`,
    cooldownSeconds: 60,
    provider: dispatchRes.provider,
    isLiveGateway: dispatchRes.isLiveGateway
  };
}

/**
 * Verifies the user-entered OTP against the stored OTP for that exact phone number
 */
export function verifyRegistrationOTP(phoneNumber: string, enteredOtp: string): {
  success: boolean;
  message?: string;
  error?: string;
} {
  const { isValid, cleanPhone, error } = validateIndianMobile(phoneNumber);
  if (!isValid) {
    return { success: false, error };
  }

  const cleanOtp = String(enteredOtp || '').trim();
  if (!cleanOtp || cleanOtp.length !== 6) {
    return { success: false, error: 'Please enter the complete 6-digit OTP.' };
  }

  const record = otpStore.get(cleanPhone);
  const now = Date.now();

  if (!record) {
    return {
      success: false,
      error: 'No OTP requested for this mobile number. Please click "Send OTP" first.'
    };
  }

  if (now > record.expiresAt) {
    otpStore.delete(cleanPhone);
    return {
      success: false,
      error: 'OTP has expired (validity 5 minutes). Please request a new OTP.'
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanPhone);
    return {
      success: false,
      error: 'Too many incorrect attempts. For security, please request a fresh OTP.'
    };
  }

  if (record.code !== cleanOtp) {
    record.attempts++;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      success: false,
      error: `Incorrect OTP! ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
    };
  }

  // Verification successful
  record.verified = true;
  return {
    success: true,
    message: 'Mobile number verified successfully!'
  };
}

/**
 * Checks if a phone number was verified recently
 */
export function isPhoneVerified(phoneNumber: string): boolean {
  const { cleanPhone } = validateIndianMobile(phoneNumber);
  const record = otpStore.get(cleanPhone);
  if (!record) return false;
  // Valid for up to 15 minutes post-verification to complete form submission
  return record.verified && Date.now() < record.expiresAt + 10 * 60 * 1000;
}

/**
 * Clears verification state after registration completes
 */
export function consumePhoneVerification(phoneNumber: string): void {
  const { cleanPhone } = validateIndianMobile(phoneNumber);
  otpStore.delete(cleanPhone);
}

/**
 * Dispatches an OTP for existing users by fetching their registered phone from the database
 */
export async function sendUserOTP(identifier: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  phone?: string;
  maskedPhone?: string;
  cooldownSeconds?: number;
}> {
  const cleanId = (identifier || '').trim().toLowerCase();
  const farmers = await db.farmers.find();
  const matched = farmers.find(f =>
    f.id.toLowerCase() === cleanId ||
    f.phone.replace(/\D/g, '').endsWith(cleanId.slice(-10)) ||
    f.nameHi.includes(cleanId) ||
    (f.nameEn && f.nameEn.toLowerCase().includes(cleanId))
  );

  if (!matched || !matched.phone) {
    return {
      success: false,
      error: 'No registered farmer found matching this ID or phone number.'
    };
  }

  const res = await sendRegistrationOTP(matched.phone);
  if (!res.success) {
    return { success: false, error: res.error, cooldownSeconds: res.cooldownSeconds };
  }

  return {
    success: true,
    message: `OTP sent to your registered mobile number: ${maskPhone(matched.phone)}`,
    phone: matched.phone,
    maskedPhone: maskPhone(matched.phone),
    cooldownSeconds: 60
  };
}
