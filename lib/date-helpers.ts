export function getDateStringInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export function getTodayDateStringInTimeZone(timeZone: string): string {
  return getDateStringInTimeZone(new Date(), timeZone);
}

export function isPastDateString(
  dateString: string,
  timeZone: string,
): boolean {
  return dateString < getTodayDateStringInTimeZone(timeZone);
}

export const DEFAULT_TRIP_TIMEZONE = 'UTC';
