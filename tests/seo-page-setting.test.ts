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

test("accepts 150 secondary keywords and rejects the 151st", () => {
  const keywords = Array.from({ length: 150 }, (_, index) => `كلمة ثانوية ${index + 1}`);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, secondaryKeywords: keywords }).success, true);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, secondaryKeywords: [...keywords, "كلمة إضافية"] }).success, false);
});

test("accepts 100 local keywords per city and rejects the 101st", () => {
  const keywords = Array.from({ length: 100 }, (_, index) => `عبارة الرياض ${index + 1}`);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, localKeywords: { ...validInput.localKeywords, الرياض: keywords } }).success, true);
  assert.equal(seoPageSettingSchema.safeParse({ ...validInput, localKeywords: { ...validInput.localKeywords, الرياض: [...keywords, "عبارة إضافية"] } }).success, false);
});

test("removes the brand suffix before the root title template is applied", () => {
  assert.equal(cleanSeoTitle("خدمات الضيافة | مسامر"), "خدمات الضيافة");
  assert.equal(cleanSeoTitle("Event services - MASAMER"), "Event services");
});
