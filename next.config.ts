import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Dev режимът пише в отделна папка (.next-dev), а билдът — в .next.
 * Така `npm run dev` и `npm run build` не могат да си презаписват
 * манифестите (това чупеше CSS-а и чънковете, ако се пуснат един след друг).
 */
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  distDir: isDev ? ".next-dev" : ".next",
};

// withPayload() запазва всички настройки по-горе и добавя нужните за Payload
export default withPayload(nextConfig, { devBundleServerPackages: false });
