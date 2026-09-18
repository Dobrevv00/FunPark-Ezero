import type { Metadata } from "next";

/**
 * Самата страница е клиентски компонент ("use client"), затова не може да
 * изнесе `metadata` — оттук идва `noindex`-ът. Допълнителна защита —
 * /Funparkadminpanel е и в disallow списъка на `app/robots.ts`.
 */
export const metadata: Metadata = {
  title: "Админ панел",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function FunparkAdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
