import YellowButton from "./YellowButton";

export default function Hero() {
  return (
    <section className="relative h-[688px] overflow-hidden lg:h-[818px]">
      {/* Мобилен фон */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src="/images/hero-mobile.jpg"
          alt="Въжен парк Fun Park Ezero сред природата"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0.711deg, rgb(0, 0, 0) 8.6928%, rgba(0, 0, 0, 0) 69.163%)",
          }}
        />
      </div>

      {/* Десктоп фон */}
      <div className="absolute left-1/2 top-0 hidden h-full w-[1575px] -translate-x-1/2 overflow-hidden rounded-[11.534px] lg:block">
        <img
          src="/images/hero.jpg"
          alt="Въжен парк Fun Park Ezero сред природата"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(15.497deg, rgba(0, 0, 0, 0.48) 17.125%, rgba(102, 102, 102, 0) 58.193%)",
          }}
        />
      </div>

      {/* Мобилно съдържание */}
      <div className="relative h-full lg:hidden">
        <h1 className="absolute inset-x-[16px] top-[420px] text-center font-golos text-[35px] font-black leading-[1.04] text-offwhite">
          Изживей
          <br />
          приключението
        </h1>
        <p className="absolute inset-x-[16px] top-[506px] mx-auto max-w-[375px] text-center font-golos text-[14px] font-semibold leading-[1.44] text-[rgba(255,254,254,0.92)]">
          Забавление, природа и незабравими моменти за цялото семейство, всичко
          на едно място.
        </p>
        <YellowButton booking className="absolute left-[16px] right-[16px] top-[575px]">
          Резервирай сега
        </YellowButton>
      </div>

      {/* Десктоп съдържание */}
      <div className="relative mx-auto hidden h-full w-full max-w-[1512px] lg:block">
        <h1 className="absolute left-[71px] top-[425px] font-golos text-[55px] font-black leading-[1.04] text-offwhite">
          Изживей
          <br />
          приключението
        </h1>
        <p className="absolute left-[71px] top-[553px] w-[560px] font-golos text-[20px] font-semibold leading-[1.5] text-[rgba(255,254,254,0.92)]">
          Забавление, природа и незабравими моменти за цялото семейство, всичко
          на едно място.
        </p>
        <YellowButton booking className="absolute left-[71px] top-[643px] w-[259px]">
          Резервирай сега
        </YellowButton>
      </div>
    </section>
  );
}
