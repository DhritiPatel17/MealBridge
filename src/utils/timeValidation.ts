// Time conversion and validation utilities for Donor surplus food posting

/**
 * Converts 12-hour clock (1-12, AM/PM) to 24-hour clock (0-23)
 * 12 AM = 00:00
 * 12 PM = 12:00
 * 1 PM = 13:00
 */
export function convert12To24(hour12: number, ampm: 'AM' | 'PM'): number {
  if (ampm === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  } else {
    return hour12 === 12 ? 12 : hour12 + 12;
  }
}

/**
 * Cooked time rules:
 * - Assume today's date. If that makes the time later than now, use yesterday's date instead.
 *   This handles times after midnight.
 * - If the cooked time is more than 12 hours before now, it cannot be donated.
 */
export function getCookedDateTime(
  cookHour: number | '',
  cookMinute: string,
  cookAmPm: 'AM' | 'PM' | '',
  now: Date = new Date()
): { date: Date | null; isMoreThan12HoursAgo: boolean } {
  if (cookHour === '' || cookMinute === '' || cookAmPm === '') {
    return { date: null, isMoreThan12HoursAgo: false };
  }

  const hour24 = convert12To24(Number(cookHour), cookAmPm);
  const minute = parseInt(cookMinute, 10) || 0;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour24, minute, 0, 0);

  // If today makes the time later than now, use yesterday's date instead
  if (d.getTime() > now.getTime()) {
    d.setDate(d.getDate() - 1);
  }

  const diffMs = now.getTime() - d.getTime();
  const isMoreThan12HoursAgo = diffMs > 12 * 3600000;

  return {
    date: d,
    isMoreThan12HoursAgo,
  };
}

/**
 * Calculates safe-until Date
 */
export function getSafeUntilDateTime(
  perishability: string,
  cookedDate: Date | null,
  durationValue: number,
  durationUnit: 'Minutes' | 'Hours' | 'Days',
  expiryDatePack?: string,
  now: Date = new Date()
): Date {
  if (perishability === 'packaged') {
    const d = new Date(expiryDatePack || Date.now());
    d.setHours(23, 59, 0, 0);
    return d;
  }

  const base = cookedDate ? new Date(cookedDate.getTime()) : new Date(now.getTime());
  if (durationUnit === 'Minutes') {
    base.setMinutes(base.getMinutes() + (durationValue || 0));
  } else if (durationUnit === 'Hours') {
    base.setHours(base.getHours() + (durationValue || 0));
  } else if (durationUnit === 'Days') {
    base.setDate(base.getDate() + (durationValue || 0));
  }
  return base;
}

