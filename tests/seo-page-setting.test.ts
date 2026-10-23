import assert from "node:assert/strict";
import test from "node:test";
import { cleanSeoTitle } from "../lib/services/seo-page-setting-dal";
import { normalizeKeywords, seoPageSettingSchema } from "../lib/validations/seo-page-setting";

const validInput = {
  pageKey: "static:home",
  seoTitle: "خدمات الضيافة",
  seoDescription: "وصف واضح وآمن لنتيجة البحث.",
  primaryKeyword: "خدمات ضيافة المناسبات",
  secondaryKeywords: ["قهوجيين", "صبابين"],
  localKeywords: { الرياض: ["قهوجيين الرياض"], جدة: [], الدمام: [] },
};

test("accepts supported stable page keys and SEO fields", () => {
  assert.equal(seoPageSettingSchema.safeParse(validInput).success, true);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, pageKey: "service:cm123_test" }).success, true);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, pageKey: "portfolio:cm456-test" }).success, true);
});

test("rejects arbitrary page keys and markup", () => {
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, pageKey: "https://example.com" }).success, false);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, seoTitle: "<script>alert(1)</script>" }).success, false);
});

test("normalizes whitespace and removes duplicate keywords", () => {
  assert.deepEqual(normalizeKeywords([" قهوجيين  للمناسبات ", "قهوجيين للمناسبات", "MASAMER", "masamer"]), ["قهوجيين للمناسبات", "MASAMER"]);
});

test("removes the brand suffix before the root title template is applied", () => {
  assert.equal(cleanSeoTitle("خدمات الضيافة | مسامر"), "خدمات الضيافة");
  assert.equal(cleanSeoTitle("Event services - MASAMER"), "Event services");
});
