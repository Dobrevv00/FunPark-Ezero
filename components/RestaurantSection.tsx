import Badge from "./Badge";
import { mediaUrl, t } from "@/lib/cms";
import type { HomePage } from "@/payload-types";

/** Пътищата на снимките остават като резервни, докато не се качат в Media. */
const images = [
  { src: "/images/restaurant-1.jpg", alt: "Салата в кутия върху дървена дъска" },
  { src: "/images/restaurant-2.jpg", alt: "Маса с брускети, салати и грил" },
  { src: "/images/restaurant-3.jpg", alt: "Панини и пържени картофи на масата" },
];

const cardBase =
  "group overflow-hidden rounded-[10px] shadow-[0px_8px_22px_0px_rgba(0,0,0,0.1)] transition-[transform,box-shadow] duration-300 ease-out";

const imgClass =
  "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]";

export default function RestaurantSection({
  content,
}: {
  content?: HomePage["restaurant"];
}) {
  const badge = t(content?.badge, "Ресторант");
  const title = t(content?.title, "Вкусове от природата");
  const text = t(
    content?.text,
    "Вижте най-добрите моменти от нашите гости @funparkezero",
  );
  const pics = images.map((img, i) => {
    const cms = content?.images?.[i];
    return {
      src: mediaUrl(cms?.image, img.src),
      alt: t(cms?.alt, img.alt),
    };
  });

  return (
    <>
      {/* Мобилен вариант */}
      <section className="pt-[80px] lg:hidden">
        <div className="flex justify-center">
          <span className="flex h-[27.288px] w-[86px] items-center justify-center rounded-[14.842px] border-[0.742px] border-[#3f3f46] text-[8.905px] leading-[1.3] tracking-[0.0891px] text-[#545454]">
            {badge}
          </span>
        </div>
        <div className="px-[16px] text-center">
          <h2 className="mt-[33px] font-golos text-[23px] font-bold leading-[37.435px] text-ink">
            {title}
          </h2>
          <p className="mx-auto mt-[8px] max-w-[318px] text-[12.697px] leading-[19.046px] text-ink">
            {text}
          </p>
        </div>

        {/* Галерия — карусел с плъзгане */}
        <div className="mt-[32px] flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-[16px] pb-[24px] pt-[8px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pics.map((img) => (
            <div
              key={img.src}
              className={`${cardBase} relative h-[280px] w-[calc(100%-48px)] shrink-0 snap-center active:scale-[0.98] active:duration-100`}
            >
              <img src={img.src} alt={img.alt} className={imgClass} />
            </div>
          ))}
        </div>
      </section>

      {/* Десктоп вариант */}
      <section className="hidden overflow-hidden pt-[256px] lg:block">
        <div className="flex justify-center">
          <Badge>{badge}</Badge>
        </div>

        <div className="mx-auto mt-[40px] max-w-[1512px] px-[32px]">
          <h2 className="font-golos text-[45px] font-extrabold leading-[59.272px] text-ink">
            {title}
          </h2>
          <p className="mt-[8px] text-[20.104px] leading-[30.156px] text-ink">
            {text}
          </p>
        </div>

        {/* Галерия */}
        {/* височината следва най-високата картичка (410px) + малък луфт за hover */}
        <div className="relative mx-auto mt-[97px] h-[420px] max-w-[1512px]">
          {[
            "left-[-23px] top-[33px] h-[364.289px] w-[485.719px]",
            "left-[calc(25%+106.72px)] top-0 h-[410px] w-[547px]",
            "left-[calc(66.67%+43.72px)] top-[23px] h-[364.289px] w-[485.719px]",
          ].map((pos, i) => (
            <div
              key={pics[i].src}
              className={`${cardBase} absolute hover:z-10 hover:scale-[1.03] hover:shadow-[0px_22px_48px_0px_rgba(0,0,0,0.22)] ${pos}`}
            >
              <img src={pics[i].src} alt={pics[i].alt} className={imgClass} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
