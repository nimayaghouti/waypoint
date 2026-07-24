import * as gregorian from 'date-fns';
import * as jalali from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale/fa-IR';
import { enUS } from 'date-fns/locale';

type DateFnsModule = typeof gregorian;

export type SupportedLocale = 'en' | 'fa';

export interface CalendarLabels {
  title: string;
  description: string;
  legend: string;
  statusAVAILABLE: string;
  statusMAYBE: string;
  statusUNAVAILABLE: string;
  statusNONE: string;
  selectMultiple: string;
  exitSelectMode: string;
  daysSelectedSuffix: string;
  cancelSelection: string;
  errorUpdate: string;
}

export function getDateFns(locale: string): DateFnsModule {
  return (locale === 'fa' ? jalali : gregorian) as unknown as DateFnsModule;
}

export function getDateFnsLocale(locale: string) {
  return (locale === 'fa' ? faIR : enUS) as unknown as typeof enUS;
}

export function getWeekStartsOn(locale: string): 0 | 6 {
  return locale === 'fa' ? 6 : 0;
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toLocaleDigits(value: string, locale: string): string {
  if (locale !== 'fa') return value;
  return value.replace(/[0-9]/g, digit => PERSIAN_DIGITS[Number(digit)]);
}

export function toISODateKey(date: Date): string {
  return gregorian.format(date, 'yyyy-MM-dd');
}
