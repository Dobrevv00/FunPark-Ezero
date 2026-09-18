import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Attractions } from "./collections/Attractions";
import { CompetitionRegistrations } from "./collections/CompetitionRegistrations";
import { Competitions } from "./collections/Competitions";
import { Enquiries } from "./collections/Enquiries";
import { Events } from "./collections/Events";
import { Media } from "./collections/Media";
import { PackageEnquiries } from "./collections/PackageEnquiries";
import { Packages } from "./collections/Packages";
import { Users } from "./collections/Users";
import { BirthdaysPage } from "./globals/BirthdaysPage";
import { ContactsPage } from "./globals/ContactsPage";
import { EventsPage } from "./globals/EventsPage";
import { FooterGlobal } from "./globals/FooterGlobal";
import { HeaderGlobal } from "./globals/HeaderGlobal";
import { HomePage } from "./globals/HomePage";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Ранна диагностика на средата. Стойностите НИКОГА не се извеждат —
 * проверява се само дали DATABASE_URL изобщо е адрес на Postgres, защото
 * иначе pg се проваля по-късно с подвеждащо съобщение (напр. ENOTFOUND base).
 */
if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  console.warn(
    "[payload] DATABASE_URL is missing or is not a postgres:// connection string. " +
      "Payload will fail to connect. Pull the real values with `vercel env pull .env.local`.",
  );
}

if (!process.env.PAYLOAD_SECRET) {
  console.warn("[payload] PAYLOAD_SECRET is not set.");
}

/**
 * Cloudflare R2 (S3-съвместимо) хранилище за колекцията „media“.
 *
 * Стойностите идват само от средата и никога не се изписват. Ако някоя липсва
 * (например локално, без изтеглени променливи), адаптерът се изключва и Payload
 * пази файловете локално както преди — админът остава работещ.
 */
const r2 = {
  bucket: process.env.R2_BUCKET ?? "",
  endpoint: process.env.R2_ENDPOINT ?? "",
  accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  publicUrl: (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, ""),
};

const r2Enabled = Object.values(r2).every((v) => v !== "");

if (!r2Enabled) {
  console.warn(
    "[payload] R2 storage is disabled — one or more of R2_BUCKET, R2_ENDPOINT, " +
      "R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL is missing. " +
      "Uploads fall back to local storage.",
  );
}

export default buildConfig({
  admin: {
    // колекцията, с която се влиза в /admin
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Events,
    Attractions,
    Packages,
    Enquiries,
    Competitions,
    CompetitionRegistrations,
    // остава регистрирана само за да не се губят стари записи и таблицата;
    // всички форми вече пишат в „enquiries“
    PackageEnquiries,
  ],
  globals: [
    SiteSettings,
    HeaderGlobal,
    FooterGlobal,
    HomePage,
    EventsPage,
    ContactsPage,
    BirthdaysPage,
  ],
  editor: lexicalEditor(),
  plugins: [
    s3Storage({
      enabled: r2Enabled,
      // схемата остава еднаква и когато адаптерът е изключен
      alwaysInsertFields: true,
      bucket: r2.bucket,
      // директно качване от браузъра към R2 (presigned PUT) — така големите
      // файлове не минават през лимита на Vercel функциите
      clientUploads: true,
      collections: {
        media: {
          // файловете се сервират директно от публичния R2 адрес,
          // а не през /api/media/file/...
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            [r2.publicUrl, prefix, filename].filter(Boolean).join("/"),
        },
      },
      config: {
        region: "auto",
        endpoint: r2.endpoint,
        // R2 работи с path-style адреси (bucket-ът е в пътя, не в поддомейна)
        forcePathStyle: true,
        credentials: {
          accessKeyId: r2.accessKeyId,
          secretAccessKey: r2.secretAccessKey,
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
});
