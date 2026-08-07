import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Users } from "./collections/Users";

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

export default buildConfig({
  admin: {
    // колекцията, с която се влиза в /admin
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
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
