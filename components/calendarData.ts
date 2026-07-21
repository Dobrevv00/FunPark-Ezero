export type DayState = "past" | "closed" | "today" | "selected" | "open";
export type Day = { day: number; state: DayState } | null;

export const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];

export const monthNames = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември",
];

export const monthNamesLower = [
  "януари", "февруари", "март", "април", "май", "юни",
  "юли", "август", "септември", "октомври", "ноември", "декември",
];

export const weekdayNames = [
  "Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота",
];

/** Ключ на дата "2026-08-15" за даден ден от месец */
export const dayKey = (year: number, month: number, d: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Генерира решетката от седмици за даден месец (понеделник първи ден).
 * blockedDayKeys — множество от блокирани дати ("2026-08-15"), маркирани като затворени.
 */
export function getMonthWeeks(
  year: number,
  month: number,
  today: Date,
  blockedDayKeys?: Set<string>
): Day[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const cells: Day[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const time = new Date(year, month, d).getTime();
    let state: DayState = "open";
    if (blockedDayKeys?.has(dayKey(year, month, d))) state = "closed";
    else if (time < todayMidnight) state = "past";
    else if (time === todayMidnight) state = "today";
    cells.push({ day: d, state });
  }
  while (cells.length % 7) cells.push(null);

  const result: Day[][] = [];
  for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
  return result;
}

