import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingCard from "@/components/BookingCard";
import AboutIntro from "@/components/AboutIntro";
import WhyUs from "@/components/WhyUs";
import RestaurantSection from "@/components/RestaurantSection";
import SocialFeed from "@/components/SocialFeed";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <section className="bg-cream pb-[157px] lg:pb-[151px]">
          <div className="relative -mt-[27px] lg:-mt-[35px]">
            <BookingCard />
          </div>
          <AboutIntro />
        </section>
        <WhyUs />
        <RestaurantSection />
        <SocialFeed />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
