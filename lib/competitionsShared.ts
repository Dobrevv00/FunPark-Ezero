/**
 * Общи стойности за състезанията — ползват ги формата на сайта, панелът,
 * сървърната проверка и колекциите в Payload. Без сървърни зависимости.
 *
 * Публично записване има само за квалификацията. Кой продължава на полуфинал
 * и финал отбелязва администраторът.
 */

/** Раздел от правилата на състезанието */
export type CompetitionRule = {
  title: string;
  intro: string;
  items: string[];
};

/** Ред от таблицата с наказания */
export type CompetitionPenalty = {
  penalty: string;
  reason: string;
};

/** Състезание във вида, в който стига до сайта. Без лични данни. */
export type PublicCompetition = {
  id: number;
  title: string;
  description: string;
  /** ISO дата на квалификацията; null, ако още не е обявена */
  qualificationDate: string | null;
  /**
   * Готови текстове за датите — форматират се на сървъра, за да не се
   * различават от браузъра (иначе React дава грешка при хидратация).
   */
  qualificationDateLabel: string;
  semifinalDateLabel: string;
  finalDateLabel: string;
  location: string;
  /** null = без такса */
  feeEur: number | null;
  feeNote: string;
  registrationNote: string;
  prizeInfo: string;
  rules: CompetitionRule[];
  penalties: CompetitionPenalty[];
  rulesNote: string;
  /** null = без ограничение */
  maxParticipants: number | null;
  registeredCount: number;
  /** null = без ограничение; 0 = запълнено */
  spotsLeft: number | null;
  /** Публични имена на класираните: „Иван П.“ */
  semifinalists: string[];
  finalists: string[];
};

/** Записан участник — само за панела на администратора */
export type AdminRegistration = {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  guardianName: string;
  note: string;
  status: "new" | "confirmed" | "waiting" | "rejected";
  createdAt: string;
};

/** Състезание с всички данни — само за панела на администратора */
export type AdminCompetition = {
  id: number;
  title: string;
  description: string;
  qualificationDate: string | null;
  semifinalDate: string | null;
  finalDate: string | null;
  qualificationDateTo: string | null;
  semifinalDateTo: string | null;
  finalDateTo: string | null;
  timeUnknown: boolean;
  maxParticipants: number | null;
  feeEur: number | null;
  location: string;
  feeNote: string;
  registrationNote: string;
  prizeInfo: string;
  rules: CompetitionRule[];
  penalties: CompetitionPenalty[];
  rulesNote: string;
  active: boolean;
  registrations: AdminRegistration[];
  semifinalists: number[];
  finalists: number[];
};

/** „3 октомври 2026 г., 10:00 ч.“ — или „Датата предстои“ */
export const formatCompetitionDate = (iso: string | null) => {
  if (!iso) return "Датата предстои";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Датата предстои";
  return d.toLocaleString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Sofia",
  });
};

const SOFIA = "Europe/Sofia";

const parts = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleString("bg-BG", { day: "numeric", timeZone: SOFIA }),
    month: d.toLocaleString("bg-BG", { month: "long", timeZone: SOFIA }),
    // bg-BG връща годината като „2026 г.“ — оставяме само числото
    year: d
      .toLocaleString("bg-BG", { year: "numeric", timeZone: SOFIA })
      .replace(/\D/g, ""),
    time: d.toLocaleString("bg-BG", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: SOFIA,
    }),
  };
};

/**
 * Дата или период за един кръг:
 *   „26 – 27 септември 2026 г.“        (кръг в два дни, часът още не е обявен)
 *   „30 септември – 1 октомври 2026 г.“ (периодът минава в следващия месец)
 *   „3 октомври 2026 г. от 10:00 ч.“    (един ден с обявен час)
 *
 * `timeUnknown` скрива часа, докато стартовете не са определени.
 */
export const formatCompetitionPeriod = (
  fromIso: string | null,
  toIso: string | null,
  timeUnknown = false,
) => {
  if (!fromIso || Number.isNaN(Date.parse(fromIso))) return "Датата предстои";
  const a = parts(fromIso);
  const time = timeUnknown ? "" : ` от ${a.time} ч.`;

  if (!toIso || Number.isNaN(Date.parse(toIso))) {
    return `${a.day} ${a.month} ${a.year} г.${time}`;
  }
  const b = parts(toIso);
  // един и същи ден — периодът няма смисъл
  if (a.day === b.day && a.month === b.month && a.year === b.year) {
    return `${a.day} ${a.month} ${a.year} г.${time}`;
  }
  const from =
    a.month === b.month && a.year === b.year ? a.day : `${a.day} ${a.month}`;
  return `${from} – ${b.day} ${b.month} ${b.year} г.${time}`;
};

/**
 * Име за публикуване в класирането: собствено име + инициал на фамилията.
 * „Иван Петров Иванов“ → „Иван И.“ — пълната фамилия не излиза на сайта.
 */
export const publicName = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

/** Минимална и максимална възраст за записване */
export const AGE_LIMITS = { min: 3, max: 99 } as const;

/** Под тази възраст е нужен родител или настойник */
export const ADULT_AGE = 18;
