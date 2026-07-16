import YellowButton from "./YellowButton";

export default function CtaSection() {
  return (
    <>
      {/* Мобилен вариант */}
      <section className="mx-auto mt-[50px] mb-[40px] max-w-[402px] px-[16px] lg:hidden">
        <div className="flex h-[299px] flex-col items-center rounded-[10px] bg-offwhite pt-[72px] text-center shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
          <h2 className="font-golos text-[23px] font-bold leading-[24.342px] text-ink">
            Готови ли сте за следващо
            <br />
            приключение?
          </h2>
          <p className="mt-[16px] w-[304px] text-[12.7px] font-medium leading-[14.35px] text-[#71717a]">
            Резервирайте своя престой или събитие днес и си гарантирайте
            незабравими спомени.
          </p>
          <YellowButton className="mt-[34px] w-[331px] max-w-full">
            Виж в TikTok
          </YellowButton>
        </div>
      </section>

      {/* Десктоп вариант */}
      <section className="mx-auto hidden max-w-[1512px] px-[30px] py-[17px] lg:block">
        <div className="flex h-[371px] flex-col items-center rounded-[10px] bg-offwhite pt-[84px] text-center shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
          <h2 className="font-golos text-[35px] font-bold leading-[35.623px] text-ink">
            Готови ли сте за следващо
            <br />
            приключение?
          </h2>
          <p className="mt-[26px] w-[397px] text-[16px] font-medium leading-[21px] text-[#71717a]">
            Резервирайте своя престой или събитие днес и си гарантирайте
            незабравими спомени.
          </p>
          <YellowButton booking className="mt-[35px] w-[259px]">Резервирай сега</YellowButton>
        </div>
      </section>
    </>
  );
}
