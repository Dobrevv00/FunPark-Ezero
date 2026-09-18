import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingCard from "@/components/BookingCard";
import AboutIntro from "@/components/AboutIntro";
import WhyUs from "@/components/WhyUs";
import RestaurantSection from "@/components/RestaurantSection";
import SocialFeed from "@/components/SocialFeed";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import ComingSoon, { comingSoonEnabled } from "@/components/ComingSoon";
import { getInstagramReels } from "@/lib/instagram.server";
import { DEFAULT_OG_IMAGE } from "@/lib/site";
import {
  getFooter,
  getHeader,
  getHomePage,
  getSiteSettings,
} from "@/lib/cms.server";

// съдържанието се препрочита периодично, за да излизат промените от CMS
export const revalidate = 60;

const TITLE = "Въжен парк и приключения сред природата — Бургас";
const DESCRIPTION =
  "Fun Park Ezero край езерото в Бургас — въжено съоръжение с маршрути за всички нива, ресторант и събития. Резервирайте своето посещение онлайн.";

export const metadata: Metadata = {
  // пълен низ, не разчита на шаблона от layout.tsx — за root route-а ("/")
  // Next.js не прилага родителския title.template (наблюдавано и в build
  // изхода, не само в dev), затова суфиксът тук е изрично изписан
  title: `${TITLE} | Fun Park Ezero`,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: `${TITLE} | Fun Park Ezero`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: `${TITLE} | Fun Park Ezero`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function Home() {
  const [home, header, footer, settings, reels] = await Promise.all([
    getHomePage(),
    getHeader(),
    getFooter(),
    getSiteSettings(),
    // най-новите Reels за „Последвайте ни“; без токен връща []
    getInstagramReels(),
  ]);

  // при включен режим „Очаквайте скоро“ страницата показва само екрана
  if (await comingSoonEnabled()) return <ComingSoon settings={settings} />;

  return (
    <>
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />
      <main className="fit-1512 overflow-x-clip">
        <Hero content={home?.hero} />
        <section className="bg-cream pb-[157px] lg:pb-[151px]">
          <div className="relative -mt-[27px] lg:-mt-[35px]">
            <BookingCard content={home?.bookingCard} />
          </div>
          <AboutIntro content={home?.aboutIntro} />
        </section>
        <WhyUs content={home?.whyUs} />
        <RestaurantSection content={home?.restaurant} />
        <SocialFeed
          content={home?.socialFeed}
          socialLinks={settings?.socials}
          reels={reels}
        />
        <CtaSection content={home?.cta} socialLinks={settings?.socials} />
      </main>
      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
