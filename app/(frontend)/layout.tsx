import type { Metadata } from "next";
import { Golos_Text, Mulish } from "next/font/google";
import BookingModalProvider from "@/components/BookingModal";
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
        <BookingModalProvider>{children}</BookingModalProvider>
      </body>
    </html>
  );
}
