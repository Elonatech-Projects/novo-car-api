export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export function getWeekDay(date: string): WeekDay {
  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format');
  }

  const day = parsed.getDay();

  const map: WeekDay[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return map[day];
}
