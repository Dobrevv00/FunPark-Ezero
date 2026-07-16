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

/** Заети дати по месеци (ключ: "година-месецИндекс") — после ще идват от CMS */
export const busyDays: Record<string, number[]> = {
  "2026-6": [5, 19, 26],
};

/** Генерира решетката от седмици за даден месец (понеделник първи ден) */
export function getMonthWeeks(year: number, month: number, today: Date): Day[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const busy = busyDays[`${year}-${month}`] ?? [];
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const cells: Day[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const time = new Date(year, month, d).getTime();
    let state: DayState = "open";
    if (busy.includes(d)) state = "closed";
    else if (time < todayMidnight) state = "past";
    else if (time === todayMidnight) state = "today";
    cells.push({ day: d, state });
  }
  while (cells.length % 7) cells.push(null);

  const result: Day[][] = [];
  for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
  return result;
}

const d = (day: number, state: DayState = "open"): Day => ({ day, state });

/** Статичната решетка от дизайна — ползва се от резервационната карта на началната страница */
export const weeks: Day[][] = [
  [null, null, d(1, "past"), d(2, "past"), d(3, "past"), d(4, "past"), d(5, "closed")],
  [d(6, "past"), d(7, "past"), d(8, "today"), d(9), d(10), d(11), d(12, "selected")],
  [d(13), d(14), d(15), d(16), d(17), d(18), d(19, "closed")],
  [d(20), d(21), d(22), d(23), d(24), d(25), d(26, "closed")],
  [d(27), d(28), d(29), d(30), d(31), null, null],
];
