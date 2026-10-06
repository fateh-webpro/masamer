import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function createAdmin() {
  const rawName = process.env.ADMIN_INIT_NAME;
  const rawEmail = process.env.ADMIN_INIT_EMAIL;
  const rawPassword = process.env.ADMIN_INIT_PASSWORD;

  if (!rawName || !rawName.trim()) {
    console.error("❌ خطأ: المتغير ADMIN_INIT_NAME غير محدد في .env");
    process.exit(1);
  }

  if (!rawEmail || !rawEmail.trim()) {
    console.error("❌ خطأ: المتغير ADMIN_INIT_EMAIL غير محدد في .env");
    process.exit(1);
  }

  if (!rawPassword || !rawPassword.trim()) {
    console.error("❌ خطأ: المتغير ADMIN_INIT_PASSWORD غير محدد في .env");
    process.exit(1);
  }

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("❌ خطأ: البريد الإلكتروني المحدد في ADMIN_INIT_EMAIL غير صالح.");
    process.exit(1);
  }

  // Password strength check
  if (password.length < 8) {
    console.error("❌ خطأ: كلمة المرور يجب أن تكون 8 خانات على الأقل.");
    process.exit(1);
  }

  console.log(`🔐 جاري تجهيز وتشفير بيانات المسؤول (${email})...`);

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
  });

  console.log(`✅ تم إنشاء/تحديث حساب المسؤول بنجاح:`);
  console.log(`   - البريد الإلكتروني: ${admin.email}`);
  console.log(`   - الاسم: ${admin.name}`);
  console.log(`   - الحالة: ${admin.isActive ? "نشط" : "معطل"}`);
  console.log(`   - المعرّف (ID): ${admin.id}`);
}

createAdmin()
  .catch((e) => {
    console.error("❌ حدث خطأ غير متوقع أثناء إعداد حساب المسؤول:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
