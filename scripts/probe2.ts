import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";

const main = async () => {
  try {
    console.log("1) зареждам payload…");
    const payload = await getPayload({ config });
    console.log("2) payload е готов, чета глобал…");
    const g = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    console.log("3) ок:", Object.keys(g ?? {}).join(","));
    fs.writeFileSync("scripts/.probe2.txt", "ok");
  } catch (e) {
    const msg = e instanceof Error ? (e.stack ?? e.message) : String(e);
    console.error("ГРЕШКА:", msg);
    fs.writeFileSync("scripts/.probe2.txt", "ERR: " + msg);
  }
  process.exit(0);
};
void main();
