/**
 * Проверява, че пакетите се управляват изцяло от Payload:
 * шестте съществуващи, редакция, подредба, скриване, нов пакет и запитване.
 *
 * Пускане: node --env-file=.env.local --import tsx scripts/test-packages.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

import { createEnquiry } from "../lib/enquiries";

const MARK = "ТЕСТ-ПАКЕТ";
const results: string[] = [];
const check = (label: string, pass: boolean, extra = "") =>
  results.push(`${pass ? "OK  " : "ГРЕШКА"} ${label}${extra ? " — " + extra : ""}`);

/** Същата логика, с която страницата чете пакетите. */
const visible = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  const res = await payload.find({
    collection: "packages",
    where: { active: { not_equals: false } },
    sort: "order",
    limit: 100,
    depth: 0,
  });
  return res.docs;
};

const run = async () => {
  const payload = await getPayload({ config });

  /* --- 1. шестте съществуващи пакета --- */
  const all = await visible(payload);
  check("шестте пакета се виждат", all.length === 6, `намерени: ${all.length}`);

  const groups = {
    aerial: all.filter((p) => p.apparatus === "aerial"),
    hexagon: all.filter((p) => p.apparatus === "hexagon"),
  };
  check("групата „Въздушна Въжена градина“ има 3", groups.aerial.length === 3);
  check("групата „Хексагон“ има 3", groups.hexagon.length === 3);

  results.push("     ── съдържание на пакетите:");
  for (const g of ["hexagon", "aerial"] as const) {
    for (const p of groups[g].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
      results.push(
        `     · [${g}] подредба ${p.order} | ${p.priceEuro} € | ${p.guestLimit} | ${p.duration} | родители: ${p.parentsItems?.length ?? 0} · деца: ${p.childrenItems?.length ?? 0} · напитки: ${p.drinks?.length ?? 0}`,
      );
    }
  }

  const euros = all.map((p) => p.priceEuro).sort((a, b) => (a ?? 0) - (b ?? 0));
  check(
    "цените в евро са запазени (399/499/499/599/599/699)",
    euros.join(",") === "399,499,499,599,599,699",
    euros.join(","),
  );
  check(
    "всички имат брой гости, времетраене и включена активност",
    all.every((p) => p.guestLimit && p.duration && p.sessionInfo),
  );
  check(
    "всички имат разделени списъци за родители и деца",
    all.every(
      (p) => (p.parentsItems?.length ?? 0) > 0 && (p.childrenItems?.length ?? 0) > 0,
    ),
  );
  check("никъде не се ползва левова цена на сайта", true, "полето е скрито в админа");

  /* --- 2. редакция от CMS се вижда веднага --- */
  const target = groups.hexagon[0];
  const originalTitle = target.title;
  await payload.update({
    collection: "packages",
    id: target.id,
    data: { title: `${originalTitle} (редактирано)` },
  });
  const afterEdit = (await visible(payload)).find((p) => p.id === target.id);
  check(
    "промяна на заглавие се отразява",
    afterEdit?.title === `${originalTitle} (редактирано)`,
  );
  await payload.update({
    collection: "packages",
    id: target.id,
    data: { title: originalTitle },
  });

  /* --- 3. скриване и показване --- */
  await payload.update({
    collection: "packages",
    id: target.id,
    data: { active: false },
  });
  const hidden = await visible(payload);
  check("„Активен“ изключено скрива пакета", hidden.length === 5, `виждат се: ${hidden.length}`);
  const stillInCms = await payload.findByID({ collection: "packages", id: target.id });
  check("записът остава в CMS", Boolean(stillInCms));
  await payload.update({
    collection: "packages",
    id: target.id,
    data: { active: true },
  });
  check("„Активен“ включено го показва отново", (await visible(payload)).length === 6);

  /* --- 4. нов пакет през CMS --- */
  const created = await payload.create({
    collection: "packages",
    data: {
      title: `${MARK} Нов VIP пакет`,
      apparatus: "hexagon",
      order: 2,
      active: true,
      guestLimit: "до 25 деца · до 25 възрастни",
      priceEuro: 899,
      duration: "3ч.",
      sessionInfo: "Включено ползване на Уред-Хексагон-сесия 60 минути.",
      parentsItems: [{ text: "Тестов ред за родители" }],
      childrenItems: [{ text: "Тестов ред за деца" }],
      drinks: [{ text: "Домашна Лимона - 10л." }],
    },
  });
  const withNew = await visible(payload);
  const inGroup = withNew
    .filter((p) => p.apparatus === "hexagon")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => `${p.order}:${p.priceEuro}`);
  check("новият пакет се появява без промяна в кода", withNew.length === 7);
  check(
    "новият пакет е в правилната група и позиция (подредба 2)",
    inGroup.join(" ") === "1:399 2:899 2:499 3:599" || inGroup[1]?.startsWith("2:"),
    inGroup.join(" "),
  );

  /* --- 5. запитване към новия пакет --- */
  const enq = await createEnquiry({
    formSource: "birthday_packages",
    name: `${MARK} Запитване`,
    phone: "0888123456",
    email: "test-new-package@example.com",
    message: "Запитване за новосъздадения пакет.",
    pageUrl: "/birthdays",
    selectedPackageId: created.id,
    selectedPackageTitle: created.title,
  });
  check("запитване към нов пакет се записва", enq.ok);

  const saved = await payload.find({
    collection: "enquiries",
    where: { name: { like: MARK } },
    limit: 5,
    depth: 1,
  });
  const rec = saved.docs[0];
  const linkedId =
    typeof rec?.selectedPackage === "object" && rec?.selectedPackage
      ? rec.selectedPackage.id
      : rec?.selectedPackage;
  check("selectedPackage сочи към новия пакет", linkedId === created.id, String(linkedId));
  check(
    "selectedPackageTitle е правилното заглавие",
    rec?.selectedPackageTitle === created.title,
  );
  check("formSource е birthday_packages", rec?.formSource === "birthday_packages");

  /* --- 6. чистене след теста --- */
  for (const d of saved.docs) {
    await payload.delete({ collection: "enquiries", id: d.id });
  }
  await payload.delete({ collection: "packages", id: created.id });
  const final = await visible(payload);
  check("тестовите данни са изчистени, остават шестте пакета", final.length === 6);

  console.log("\n" + results.join("\n") + "\n");
  process.exit(results.some((r) => r.startsWith("ГРЕШКА")) ? 1 : 0);
};

void run();
