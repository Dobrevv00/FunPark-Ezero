import type { Metadata } from "next";
import { Golos_Text, Mulish } from "next/font/google";
import BookingModalProvider from "@/components/BookingModal";
import CookieConsentProvider from "@/components/CookieConsent";
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

export const metadata: Metadata = {
  title: "Fun Park Ezero",
  description:
    "Забавление, природа и незабравими моменти за цялото семейство, всичко на едно място.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body className={`${golos.variable} ${mulish.variable} font-mulish antialiased`}>
        {/* Съгласието за бисквитки обгръща целия публичен сайт.
            Payload админът има свой layout в app/(payload) и не го вижда. */}
        <CookieConsentProvider>
          <BookingModalProvider>{children}</BookingModalProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
