import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserDisplayName(
  user?: { name?: string | null; email?: string | null } | null,
  deletedLabel = 'Deleted User',
) {
  if (!user) return deletedLabel;
  return user.name || user.email?.split('@')[0] || deletedLabel;
}

const EASTERN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toLocaleDigits(value: string, locale: string): string {
  if (locale !== 'fa') return value;
  return value.replace(/[0-9]/g, digit => EASTERN_DIGITS[Number(digit)]);
}
