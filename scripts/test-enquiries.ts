/**
 * Проверка на запитванията: валидация, honeypot и запис в „enquiries“.
 * Създава тестови записи, проверява ги и ги изтрива след себе си.
 *
 * Пускане: node --env-file=.env.local --import tsx scripts/test-enquiries.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

import { createEnquiry } from "../lib/enquiries";

const MARK = "ТЕСТ-ЗАПИТВАНЕ";

const run = async () => {
  const payload = await getPayload({ config });
  const results: string[] = [];
  const check = (label: string, pass: boolean, extra = "") =>
    results.push(`${pass ? "OK  " : "ГРЕШКА"} ${label}${extra ? " — " + extra : ""}`);

  const firstPackage = await payload.find({
    collection: "packages",
    limit: 1,
    sort: "order",
  });
  const pkg = firstPackage.docs[0];

  /* 1) контактна форма — валидно */
  const contact = await createEnquiry({
    formSource: "contact",
    name: `${MARK} Контакти`,
    phone: "0888123456",
    email: "test-contact@example.com",
    message: "Съобщение от контактната форма.",
    pageUrl: "/contacts",
  });
  check("контактна форма се записва", contact.ok, JSON.stringify(contact));

  /* 2) пакет — валидно */
  const birthday = await createEnquiry({
    formSource: "birthday_packages",
    name: `${MARK} Пакет`,
    phone: "+359 88 123 4567",
    email: "test-package@example.com",
    message: "Искам събота следобед.",
    pageUrl: "/birthdays",
    selectedPackageId: pkg?.id,
    selectedPackageTitle: pkg?.title ?? "—",
  });
  check("запитване за пакет се записва", birthday.ok, JSON.stringify(birthday));

  /* 3) honeypot — връща ok, но НЕ записва */
  const bot = await createEnquiry({
    formSource: "contact",
    name: `${MARK} Бот`,
    phone: "0888123456",
    email: "bot@example.com",
    honeypot: "http://spam.example",
  });
  check("ботът получава ok", bot.ok);

  /* 4) невалидни данни */
  const noName = await createEnquiry({
    formSource: "contact",
    name: "   ",
    phone: "0888123456",
    email: "a@b.bg",
  });
  check("липсващо име се отхвърля", !noName.ok && noName.error === "invalid");

  const badPhone = await createEnquiry({
    formSource: "contact",
    name: `${MARK} Телефон`,
    phone: "123",
    email: "a@b.bg",
  });
  check("невалиден телефон се отхвърля", !badPhone.ok);

  const badEmail = await createEnquiry({
    formSource: "contact",
    name: `${MARK} Имейл`,
    phone: "0888123456",
    email: "не-е-имейл",
  });
  check("невалиден имейл се отхвърля", !badEmail.ok);

  const tooLong = await createEnquiry({
    formSource: "contact",
    name: `${MARK} Дълго`,
    phone: "0888123456",
    email: "a@b.bg",
    message: "x".repeat(2100),
  });
  check("прекалено дълго съобщение се отхвърля", !tooLong.ok);

  /* 5) какво реално има в базата */
  const saved = await payload.find({
    collection: "enquiries",
    where: { name: { like: MARK } },
    limit: 50,
    depth: 1,
  });

  check(
    "записани са точно 2 записа (ботът и невалидните не влизат)",
    saved.docs.length === 2,
    `намерени: ${saved.docs.length}`,
  );

  for (const d of saved.docs) {
    const pkgTitle =
      typeof d.selectedPackage === "object" && d.selectedPackage
        ? d.selectedPackage.title
        : "—";
    results.push(
      `     · ${d.formSource} | ${d.name} | ${d.phone} | ${d.email} | статус ${d.status} | стр. ${d.pageUrl} | пакет: ${pkgTitle}`,
    );
  }

  const sources = saved.docs.map((d) => d.formSource).sort();
  check(
    "източниците са различими",
    sources.join(",") === "birthday_packages,contact",
    sources.join(","),
  );

  /* 6) стара колекция — колко записа има */
  const legacy = await payload.find({ collection: "package-enquiries", limit: 50 });
  results.push(`     · стара колекция „package-enquiries“: ${legacy.docs.length} записа`);

  /* 7) чистене след теста */
  for (const d of saved.docs) {
    await payload.delete({ collection: "enquiries", id: d.id });
  }
  const after = await payload.find({
    collection: "enquiries",
    where: { name: { like: MARK } },
    limit: 5,
  });
  check("тестовите записи са изтрити", after.docs.length === 0);

  console.log("\n" + results.join("\n") + "\n");
  process.exit(results.some((r) => r.startsWith("ГРЕШКА")) ? 1 : 0);
};

void run();
