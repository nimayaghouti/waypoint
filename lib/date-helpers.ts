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

export function zonedTimeToUtc(
  dateKey: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  const guessDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(guessDate);
  const getPart = (type: string) =>
    Number(parts.find(p => p.type === type)?.value);

  const tzYear = getPart('year');
  const tzMonth = getPart('month');
  const tzDay = getPart('day');
  let tzHour = getPart('hour');
  const tzMinute = getPart('minute');

  if (tzHour === 24) tzHour = 0;

  const tzGuessDate = new Date(
    Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0),
  );
  const offsetMs = tzGuessDate.getTime() - guessDate.getTime();

  return new Date(guessDate.getTime() - offsetMs);
}

export const DEFAULT_TRIP_TIMEZONE = 'UTC';
