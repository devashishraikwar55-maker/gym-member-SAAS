import { formatDate } from '../types';

/**
 * Normalizes a phone number for WhatsApp links (wa.me)
 * Removes non-digits and ensures international country code if 10-digit number.
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  // If standard 10-digit Indian number without country prefix, prepend 91
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

/**
 * Generates a polite, personalized WhatsApp message for renewing an expired or expiring membership.
 */
export function getWhatsAppRenewMessage(
  memberName: string,
  gymName: string = 'GYM-member',
  expiryDate?: string,
  planName?: string
): string {
  const formattedDate = expiryDate ? formatDate(expiryDate) : 'recently';
  const gym = gymName || 'GYM-member';

  return `Hi ${memberName},\n\nYour gym membership at *${gym}*${planName ? ` (${planName})` : ''} has expired on *${formattedDate}*.\n\nTo continue your workouts without interruption, please renew your membership plan.\n\nReply to this message or visit the front desk to renew today!\n\nBest regards,\n*${gym} Team*`;
}

/**
 * Creates the direct wa.me link with URL-encoded text.
 */
export function getWhatsAppRenewUrl(
  phone: string,
  memberName: string,
  gymName?: string,
  expiryDate?: string,
  planName?: string
): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const message = getWhatsAppRenewMessage(memberName, gymName, expiryDate, planName);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
