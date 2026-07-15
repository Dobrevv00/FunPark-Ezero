const columns = [
  {
    title: "Меню",
    left: 522,
    items: ["Начало", "Събития", "Контакти"],
  },
  {
    title: "Информация",
    left: 771,
    items: ["Резервации", "Политика за поверителност", "Общи условия"],
  },
];

const mobileColumns = [
  { title: "Меню", items: ["Начало", "Събития", "Контакти"] },
  { title: "Информация", items: ["Резервации", "Общи условия"] },
];

const contacts = [
  { icon: "/icons/location.svg", w: 12, h: 15, text: "ул. Езерна 1, 9000 Варна" },
  { icon: "/icons/call.svg", w: 12, h: 12, text: "+359 88 123 4567" },
  { icon: "/icons/mail.svg", w: 14, h: 11, text: "info@funparkzero.bg" },
];

const mobileContacts = [
  { icon: "/icons/location.svg", w: 12, h: 15, text: "ул. Езерна 1, Бургас" },
  { icon: "/icons/call.svg", w: 12, h: 12, text: "+359 88 123 4567" },
  { icon: "/icons/mail.svg", w: 14, h: 11, text: "info@funparkzero.bg" },
];

function FooterLogo({
  ring,
  inner,
  logoW,
  logoH,
}: {
  ring: number;
  inner: number;
  logoW: number;
  logoH: number;
}) {
  return (
    <div className="relative" style={{ width: ring, height: ring }}>
      <img src="/icons/footer-ring-outer.svg" alt="" className="absolute inset-0 size-full" />
      <img
        src="/icons/footer-ring-inner.svg"
        alt=""
        className="absolute"
        style={{ width: inner, height: inner, left: (ring - inner) / 2, top: (ring - inner) / 2 }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          width: logoW,
          height: logoH,
          left: (ring - logoW) / 2,
          top: (ring - logoH) / 2 + 3,
        }}
      >
        <span className="absolute inset-[2.67%_0_0_0]">
          <img src="/icons/logo-mark-footer.svg" alt="Fun Park Ezero" className="size-full" />
        </span>
        <span className="absolute inset-[0_37%_78.73%_34.4%]">
          <img src="/icons/logo-leaf-footer.svg" alt="" className="size-full" />
        </span>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-forest">
      {/* Мобилен вариант */}
      <div className="flex h-[550px] flex-col items-center pt-[30px] lg:hidden">
        <FooterLogo ring={70} inner={64} logoW={49.6} logoH={33.7} />
        <p className="mt-[12px] w-[219px] text-center font-golos text-[12.7px] leading-[13px] text-white/45">
          Незабравими преживявания сред природата за цялото семейство.
        </p>

        {mobileColumns.map((col) => (
          <div key={col.title} className="mt-[26px] flex flex-col items-center">
            <p className="text-[15px] font-medium leading-[19.5px] text-sun">
              {col.title}
            </p>
            <ul className="mt-[8px] flex flex-col items-center gap-[10px]">
              {col.items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="whitespace-nowrap text-[12.7px] leading-[15.278px] text-white/50 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-[26px] flex flex-col items-center">
          <p className="text-[15px] font-medium leading-[19.5px] text-sun">
            Контакти
          </p>
          <ul className="mt-[8px] flex flex-col gap-[10px]">
            {mobileContacts.map((c) => (
              <li key={c.text} className="flex items-center justify-center gap-[9px]">
                <span className="flex w-[15px] shrink-0 justify-center">
                  <img src={c.icon} alt="" width={c.w} height={c.h} />
                </span>
                <span className="whitespace-nowrap text-[12.7px] leading-[15.278px] text-white/50">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Десктоп вариант */}
      <div className="relative mx-auto hidden h-[316px] max-w-[1512px] lg:block">
        <div className="absolute left-[155px] top-[54px]">
          <FooterLogo ring={114} inner={104} logoW={81} logoH={55} />
        </div>
        <p className="absolute left-[103px] top-[188px] w-[219px] text-center font-golos text-[13px] leading-[21.125px] text-white/55">
          Незабравими преживявания сред природата за цялото семейство.
        </p>

        {/* Колони с линкове */}
        {columns.map((col) => (
          <div key={col.title} className="absolute top-[119px]" style={{ left: col.left }}>
            <p className="text-[15px] font-medium leading-[19.5px] text-sun">
              {col.title}
            </p>
            <ul className="mt-[12px] flex flex-col gap-[12px]">
              {col.items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="whitespace-nowrap text-[13px] leading-[19.5px] text-white/55 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Контакти */}
        <div className="absolute left-[1136px] top-[119px]">
          <p className="text-[15px] font-medium leading-[19.5px] text-sun">
            Контакти
          </p>
          <ul className="mt-[12px] flex flex-col gap-[12px]">
            {contacts.map((c) => (
              <li key={c.text} className="flex items-center gap-[9px]">
                <span className="flex w-[15px] shrink-0 justify-center">
                  <img src={c.icon} alt="" width={c.w} height={c.h} />
                </span>
                <span className="whitespace-nowrap text-[13px] leading-[19.5px] text-white/55">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
