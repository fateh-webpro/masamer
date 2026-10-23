import assert from "node:assert/strict";
import test from "node:test";
import { getServiceSeoProfile } from "@/lib/services/service-seo";

test("provides focused SEO copy for the four existing service slugs", () => {
  assert.match(getServiceSeoProfile("human-hospitality").description ?? "", /قهوجيين.*صبابين/);
  assert.match(getServiceSeoProfile("tents-and-majlis").description ?? "", /خيام المناسبات.*بيوت الشعر/);
  assert.match(getServiceSeoProfile("seating-and-event-setup").description ?? "", /تجهيز جلسات المناسبات/);
  assert.match(getServiceSeoProfile("event-decorations").description ?? "", /ديكورات حفلات.*تنسيق مناسبات/);
});

test("keeps a neutral request fallback for future services without replacing their metadata", () => {
  const profile = getServiceSeoProfile("future-service");

  assert.equal(profile.title, undefined);
  assert.equal(profile.description, undefined);
  assert.match(profile.requestTitle, /الخدمة/);
});
