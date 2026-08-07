import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {};

// withPayload() запазва всички настройки по-горе и добавя нужните за Payload
export default withPayload(nextConfig, { devBundleServerPackages: false });
