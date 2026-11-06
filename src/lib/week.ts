export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const MOMENTS = ["lunch", "dinner"] as const;

export type Day = (typeof DAYS)[number];
export type Moment = (typeof MOMENTS)[number];

// Un Créneau est une clé (jour, moment) : il ne peut donc contenir qu'un seul Repas.
export type Week = Partial<Record<Day, Partial<Record<Moment, string>>>>;

export type Slot = { day: Day; moment: Moment; meal: string | null };

export function weekSlots(week: Week | undefined): Slot[] {
  return DAYS.flatMap((day) =>
    MOMENTS.map((moment) => ({ day, moment, meal: week?.[day]?.[moment] ?? null })),
  );
}

// Une Semaine est identifiée par la date (AAAA-MM-JJ) de son lundi.
export function isWeekStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) && date.getUTCDay() === 1;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => d.toISOString().slice(0, 10);

// Lundi (heure locale) de la Semaine qui contient `now`.
export function currentWeekStart(now: Date = new Date()): string {
  const local = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  local.setUTCDate(local.getUTCDate() - ((local.getUTCDay() + 6) % 7));
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}

export function shiftWeek(weekStart: string, weeks: number): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return toIso(d);
}

export function dayDate(weekStart: string, day: Day): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + DAYS.indexOf(day));
  return toIso(d);
}
