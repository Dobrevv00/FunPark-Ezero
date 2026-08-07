import Badge from "./Badge";
import { t } from "@/lib/cms";
import type { HomePage } from "@/payload-types";

export default function AboutIntro({
  content,
}: {
  content?: HomePage["aboutIntro"];
}) {
  // мобилната и десктоп версията днес изписват баджа различно — пази се както е
  const badgeMobile = t(content?.badgeMobile, "За атракцията");
  const badgeDesktop = t(content?.badgeDesktop, "За Атракцията");
  const title = t(
    content?.title,
    "Място, където природата, движението и споделените моменти се превръщат в",
  );
  const titleAccent = t(content?.titleAccent, "истинско приключение.");
  const text = t(
    content?.text,
    "Създадохме място, където приключението продължава и след последното препятствие. Наслади се на въженото съоръжение, природата и уютния ресторант в едно незабравимо преживяване.",
  );

  return (
    <>
      {/* Мобилен вариант */}
      <div className="px-[16px] pt-[154px] text-center lg:hidden">
        <div className="flex justify-center">
          <span className="flex h-[30px] w-[96px] items-center justify-center rounded-[20px] border-[0.742px] border-[#3f3f46] text-[10px] font-medium leading-[1.3] tracking-[0.1px] text-[#545454]">
            {badgeMobile}
          </span>
        </div>
        <h2 className="mx-auto mt-[33px] max-w-[376px] font-golos text-[23px] font-bold leading-[1.15] tracking-[0.23px] text-ink">
          {title} <span className="text-leaf">{titleAccent}</span>
        </h2>
        <p className="mx-auto mt-[20px] max-w-[370px] text-[12px] leading-[1.3] tracking-[0.12px] text-[#545454]">
          {text}
        </p>
      </div>

      {/* Десктоп вариант */}
      <div className="hidden flex-col items-center pt-[114px] text-center lg:flex">
        <Badge>{badgeDesktop}</Badge>
        <h2 className="mt-[34px] max-w-[897px] font-golos text-[35px] font-bold leading-[1.15] tracking-[0.2944px] text-ink">
          {title}{" "}
          <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
            {titleAccent}
          </span>
        </h2>
        <p className="mt-[8px] max-w-[722px] text-[16px] leading-[1.3] tracking-[0.16px] text-[#545454]">
          {text}
        </p>
      </div>
    </>
  );
}
