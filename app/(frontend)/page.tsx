import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingCard from "@/components/BookingCard";
import AboutIntro from "@/components/AboutIntro";
import WhyUs from "@/components/WhyUs";
import RestaurantSection from "@/components/RestaurantSection";
import SocialFeed from "@/components/SocialFeed";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import {
  getFooter,
  getHeader,
  getHomePage,
  getSiteSettings,
} from "@/lib/cms.server";

// съдържанието се препрочита периодично, за да излизат промените от CMS
export const revalidate = 60;

export default async function Home() {
  const [home, header, footer, settings] = await Promise.all([
    getHomePage(),
    getHeader(),
    getFooter(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />
      <main className="overflow-x-clip">
        <Hero content={home?.hero} />
        <section className="bg-cream pb-[157px] lg:pb-[151px]">
          <div className="relative -mt-[27px] lg:-mt-[35px]">
            <BookingCard content={home?.bookingCard} />
          </div>
          <AboutIntro content={home?.aboutIntro} />
        </section>
        <WhyUs content={home?.whyUs} />
        <RestaurantSection content={home?.restaurant} />
        <SocialFeed content={home?.socialFeed} socialLinks={settings?.socials} />
        <CtaSection content={home?.cta} />
      </main>
      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
