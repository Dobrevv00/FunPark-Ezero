import Badge from "./Badge";

export default function RestaurantSection() {
  return (
    <>
      {/* Мобилен вариант */}
      <section className="overflow-hidden pt-[80px] lg:hidden">
        <div className="flex justify-center">
          <span className="flex h-[27.288px] w-[86px] items-center justify-center rounded-[14.842px] border-[0.742px] border-[#3f3f46] text-[8.905px] leading-[1.3] tracking-[0.0891px] text-[#545454]">
            Ресторант
          </span>
        </div>
        <div className="px-[16px]">
          <h2 className="mt-[33px] font-golos text-[23px] font-bold leading-[37.435px] text-ink">
            Вкусове от природата
          </h2>
          <p className="mt-[8px] max-w-[318px] text-[12.697px] leading-[19.046px] text-ink">
            Вижте най-добрите моменти от нашите гости @funparkezero
          </p>
        </div>

        {/* Галерия — плейсхолдъри по дизайн */}
        <div className="relative mt-[72px] h-[325px] w-full">
          <div className="absolute left-[-192px] top-[16px] h-[294px] w-[245px] border-[0.613px] border-[#d4d4d8] bg-[#d9d9d9]" />
          <div className="absolute left-1/2 top-0 h-[325px] w-[276px] -translate-x-1/2 border-[0.613px] border-[#d4d4d8] bg-[#d9d9d9]" />
          <div className="absolute left-[calc(75%+48.5px)] top-[16px] h-[294px] w-[245px] border-[0.613px] border-[#d4d4d8] bg-[#d9d9d9]" />
        </div>
      </section>

      {/* Десктоп вариант */}
      <section className="hidden overflow-hidden pt-[256px] lg:block">
        <div className="flex justify-center">
          <Badge>Ресторант</Badge>
        </div>

        <div className="mx-auto mt-[40px] max-w-[1512px] px-[32px]">
          <h2 className="font-golos text-[45px] font-extrabold leading-[59.272px] text-ink">
            Вкусове от природата
          </h2>
          <p className="mt-[8px] text-[20.104px] leading-[30.156px] text-ink">
            Вижте най-добрите моменти от нашите гости @funparkezero
          </p>
        </div>

        {/* Галерия — плейсхолдъри по дизайн */}
        <div className="relative mx-auto mt-[97px] h-[443px] max-w-[1512px]">
          <div className="absolute left-[-23px] top-[33px] h-[364.289px] w-[485.719px] border-[1.214px] border-[#d4d4d8] bg-[#d9d9d9]" />
          <div className="absolute left-[calc(25%+106.72px)] top-0 h-[410px] w-[547px] border-[1.214px] border-[#d4d4d8] bg-[#d9d9d9]" />
          <div className="absolute left-[calc(66.67%+43.72px)] top-[23px] h-[364.289px] w-[485.719px] border-[1.214px] border-[#d4d4d8] bg-[#d9d9d9]" />
        </div>
      </section>
    </>
  );
}
