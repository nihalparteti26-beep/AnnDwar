/**
 * WhatsApp Helper Utilities for AnnDwar - Kisan se Desh Tak
 * Generates direct universal wa.me deep links to launch real WhatsApp
 * on Desktop (WhatsApp Web / App) and Mobile (WhatsApp App).
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

export function openRealWhatsApp(phone: string | number | undefined | null, message: string): void {
  const url = buildWhatsAppUrl(phone, message);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
