/** Кратка проверка какво има в Payload след пренасянето. Пускане: npm run cms:check */
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";

const run = async () => {
  const payload = await getPayload({ config });
  const out: Record<string, unknown> = {};

  for (const slug of [
    "site-settings",
    "header",
    "footer",
    "home-page",
    "events-page",
    "contacts-page",
  ] as const) {
    const doc = await payload.findGlobal({ slug, depth: 0 });
    out[slug] = Object.keys(doc ?? {}).length;
  }

  const events = await payload.find({ collection: "events", limit: 50, sort: "order" });
  out.events = events.docs.map((e) => `${e.order}. ${e.title} [${e.showOn}]`);

  const attractions = await payload.find({ collection: "attractions", limit: 10 });
  out.attractions = attractions.docs.map((a) => a.name);

  const home = await payload.findGlobal({ slug: "home-page", depth: 0 });
  out.sampleHeroTitle = `${home?.hero?.titleLine1 ?? "-"} / ${home?.hero?.titleLine2 ?? "-"}`;

  fs.writeFileSync("scripts/.check-output.json", JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  process.exit(0);
};

void run();
