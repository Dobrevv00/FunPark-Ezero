import type { Metadata, Viewport } from "next";
import { Golos_Text, Mulish } from "next/font/google";
import BookingModalProvider from "@/components/BookingModal";
import CookieConsentProvider from "@/components/CookieConsent";
import { getSiteSettings } from "@/lib/cms.server";
import {
  buildLocalBusinessJsonLd,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-golos-text",
});

const mulish = Mulish({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish-sans",
});

const SITE_DESCRIPTION =
  "Забавление, природа и незабравими моменти за цялото семейство, всичко на едно място.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // страниците задават своя title; тази стойност е само резервна
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13362f",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // за structured data (виж lib/site.ts) — само реални, вече публични данни;
  // ако базата е недостъпна, getSiteSettings() връща null и JSON-LD пропуска
  // празните полета вместо да измисля стойности
  const settings = await getSiteSettings();
  const jsonLd = buildLocalBusinessJsonLd(settings);

  return (
    <html lang="bg">
      <body className={`${golos.variable} ${mulish.variable} font-mulish antialiased`}>
        {/* Structured data за търсачките — schema.org/AmusementPark.
            https://nextjs.org/docs/app/guides/json-ld */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Съгласието за бисквитки обгръща целия публичен сайт.
            Payload админът има свой layout в app/(payload) и не го вижда. */}
        <CookieConsentProvider>
          <BookingModalProvider>{children}</BookingModalProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
