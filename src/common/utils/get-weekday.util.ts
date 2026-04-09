// src/common/utils/get-weekday.util.ts

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

/**
 * Returns the weekday abbreviation for a YYYY-MM-DD date string.
 *
 * Parses as local time (T00:00:00 without Z) to avoid the UTC-midnight
 * off-by-one-day error: new Date('2025-01-06') parses as 2025-01-05T23:00:00
 * in UTC+1 (WAT), returning SAT instead of MON.
 */
export function getWeekDay(date: string): WeekDay {
  const parsed = new Date(`${date}T00:00:00`);

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
  }

  const map: WeekDay[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return map[parsed.getDay()];
}
