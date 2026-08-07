import fs from "fs";
const log = (m: string) => fs.appendFileSync("scripts/.probe3.log", m + "\n");
fs.writeFileSync("scripts/.probe3.log", "");
process.on("uncaughtException", (e) => log("uncaughtException: " + (e?.stack || e)));
process.on("unhandledRejection", (e) => log("unhandledRejection: " + ((e as Error)?.stack || String(e))));
process.on("exit", (code) => log("exit code: " + code));

const main = async () => {
  log("преди import payload");
  const { getPayload } = await import("payload");
  log("payload е импортнат");
  const config = (await import("@payload-config")).default;
  log("конфигурацията е импортната");
  const p = await getPayload({ config });
  log("getPayload ок: " + Object.keys(p.collections).join(","));
};
void main();
