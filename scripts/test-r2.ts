/**
 * Проверка на Media хранилището.
 *
 * Без R2 променливи: проверява конфигурацията, че Payload стартира и че
 * съществуващите записи са непокътнати (upload тестът се пропуска).
 * С R2 променливи: качва малък тестов файл, проверява публичния адрес,
 * че файлът се отваря, и после трие само тестовия запис.
 *
 * Пускане: node --env-file=.env.local --import tsx scripts/test-r2.ts
 */
import fs from "fs";
import os from "os";
import path from "path";

import { getPayload } from "payload";
import config from "@payload-config";

const results: string[] = [];
const check = (label: string, pass: boolean, extra = "") =>
  results.push(`${pass ? "OK  " : "ГРЕШКА"} ${label}${extra ? " — " + extra : ""}`);
const note = (text: string) => results.push(`     · ${text}`);

/** Най-малкият валиден PNG (1×1 прозрачен пиксел). */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwACRgFdogHnkAAAAABJRU5ErkJggg==",
  "base64",
);

const run = async () => {
  const needed = [
    "R2_BUCKET",
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_PUBLIC_URL",
  ];
  const missing = needed.filter((k) => !process.env[k]);
  const publicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

  /* --- 1. конфигурация --- */
  const payload = await getPayload({ config });
  check("Payload стартира без грешка", true);

  const media = payload.collections.media?.config;
  check("колекцията „media“ съществува", Boolean(media));
  const upload = media?.upload as { mimeTypes?: string[] } | undefined;
  check(
    "разрешени са снимки и видеа",
    Boolean(upload?.mimeTypes?.includes("image/webp") && upload?.mimeTypes?.includes("video/mp4")),
    upload?.mimeTypes?.join(", "),
  );
  const hasPrefix = media?.fields?.some(
    (f) => "name" in f && f.name === "prefix",
  );
  check("полето „prefix“ е добавено от адаптера", Boolean(hasPrefix));

  /* --- 2. съществуващи записи --- */
  const before = await payload.find({ collection: "media", limit: 100, depth: 0 });
  note(`съществуващи Media записи: ${before.totalDocs}`);

  if (missing.length > 0) {
    note(`R2 е ИЗКЛЮЧЕН локално — липсват: ${missing.join(", ")}`);
    note("upload тестът се пропуска (не измислям стойности)");
    console.log("\n" + results.join("\n") + "\n");
    process.exit(results.some((r) => r.startsWith("ГРЕШКА")) ? 1 : 0);
  }

  /* --- 3. реален upload към R2 --- */
  const tmp = path.join(os.tmpdir(), `r2-test-${Date.now()}.png`);
  fs.writeFileSync(tmp, TINY_PNG);

  const created = await payload.create({
    collection: "media",
    data: { alt: "Тестов файл за R2 — може да се изтрие" },
    filePath: tmp,
  });
  fs.rmSync(tmp, { force: true });

  check("Media документът е създаден", Boolean(created?.id));
  note(`файл: ${created.filename} · адрес: ${created.url}`);
  check(
    "публичният адрес ползва R2_PUBLIC_URL",
    typeof created.url === "string" && created.url.startsWith(publicUrl),
  );
  check(
    "адресът НЕ е S3 API endpoint-ът",
    typeof created.url === "string" &&
      !created.url.includes("r2.cloudflarestorage.com"),
  );

  /* --- 4. файлът се отваря публично --- */
  try {
    const res = await fetch(created.url as string, { method: "GET" });
    const bytes = res.ok ? (await res.arrayBuffer()).byteLength : 0;
    check(
      "файлът се отваря през публичния адрес",
      res.ok && bytes === TINY_PNG.byteLength,
      `HTTP ${res.status}, ${bytes} байта`,
    );
  } catch (err) {
    check(
      "файлът се отваря през публичния адрес",
      false,
      err instanceof Error ? err.message : String(err),
    );
  }

  /* --- 5. чистене: само тестовия запис --- */
  await payload.delete({ collection: "media", id: created.id });
  const after = await payload.find({ collection: "media", limit: 100, depth: 0 });
  check(
    "тестовият запис е изтрит, останалите са непокътнати",
    after.totalDocs === before.totalDocs,
    `преди ${before.totalDocs} · сега ${after.totalDocs}`,
  );

  try {
    const gone = await fetch(created.url as string, { method: "HEAD" });
    check(
      "обектът е премахнат и от R2",
      gone.status === 404 || gone.status === 403,
      `HTTP ${gone.status}`,
    );
  } catch {
    note("проверката за изтрит обект не можа да се направи (мрежа)");
  }

  console.log("\n" + results.join("\n") + "\n");
  process.exit(results.some((r) => r.startsWith("ГРЕШКА")) ? 1 : 0);
};

void run();
