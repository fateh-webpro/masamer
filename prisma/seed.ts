import "dotenv/config";
import { prisma } from "../lib/prisma";

const initialServices = [
  {
    title: "قهوجيون وصبابون للفعاليات الرسمية",
    slug: "gahwaji-and-servers",
    shortDescription:
      "طاقم سعودي محترف ومدرّب على أصول المراسم والبروتوكول لتقديم القهوة السعودية وأجود أنواع الشاي والتمر.",
    fullDescription:
      "نقدم خدمة القهوجيين والصبابين المحترفين للفعاليات الكبرى والمناسبات الرسمية والاجتماعات الرفيعة. يتميز طاقمنا باللباقة، وحسن المظهر بالزي السعودي التراثي الموحد، والإتقان التام لبروتوكول صب القهوة السعودية وتقديم الشاي والتمور الفاخرة، مع الالتزام التام بأعلى معايير النظافة والانضباط بالمواعيد.",
    icon: "Coffee",
    features: JSON.stringify([
      "طاقم سعودي مدرب على أصول المراسم والضيافة",
      "زي موحد أنيق يعكس الهوية والأصالة",
      "دلال رسلان ومباخر ضيافة فاخرة",
      "تقديم القهوة السعودية الفاخرة والشاي بأنواعه",
      "إشراف ميداني مستمر لضمان أعلى جودة",
    ]),
    sortOrder: 1,
    isActive: true,
  },
  {
    title: "ضيافة المؤتمرات والمعارض الكبرى",
    slug: "conferences-hospitality",
    shortDescription:
      "حلول ضيافة متكاملة للمؤتمرات والمنتديات الاقتصادية والمعارض الدولية بمرونة تشغيلية عالية.",
    fullDescription:
      "حلول مصممة خصيصاً لإدارة أركان الضيافة ومحطات التقديم في المؤتمرات والمعارض الضخمة. نوفر طواقم متكاملة قادرة على استيعاب آلاف الزوار بكفاءة وسرعة، مع محطات قهوة وشاي مجهزة بأحدث أدوات التقديم وأطقم فاخرة تليق بحجم الحدث وطبيعة الحضور الدولي والمحلي.",
    icon: "Award",
    features: JSON.stringify([
      "جاهزية لاستيعاب الفعاليات والمؤتمرات الكبرى",
      "محطات ومحاريب ضيافة وتوزيع مجهزة بالكامل",
      "طواقم إضافية للتدخل السريع وإدارة الذروة",
      "توفير مستلزمات تقديم صديقة للبيئة ومعقمة",
      "تنسيق لوجستي متكامل وفق الجدول الزمني للفعالية",
    ]),
    sortOrder: 2,
    isActive: true,
  },
  {
    title: "ضيافة المناسبات الخاصة والملكية",
    slug: "private-events-hospitality",
    shortDescription:
      "تجربة ضيافة حصرية وفاخرة للأفراح ومجالس كبار الشخصيات واللقاءات العائلية الرفيعة.",
    fullDescription:
      "نصنع في مناسباتكم الخاصة ذكرى لا تُنسى لضيوفكم، عبر تخصيص أرقى أواني التقديم المذهبة والفضية، ومباخر العود الفاخر، وتقديم أجود أنواع التمور المحشوة والحلويات التراثية، مع صبابين على أعلى مستوى من اللباقة والهدوء والخدمة الشخصية الراقية.",
    icon: "Sparkles",
    features: JSON.stringify([
      "أطقم تقديم ملكية بتفاصيل وتطريزات فاخرة",
      "مباخر عود ودهن عود أصيل للمجلس",
      "تشكيلة تمور فاخرة وحلويات ضيافة منتقاة",
      "طاقم خدمة شخصية متفرغ لخدمة كبار الضيوف",
      "عناية فائقة بأدق التفاصيل والبروتوكول",
    ]),
    sortOrder: 3,
    isActive: true,
  },
];

async function main() {
  console.log("🌱 بدء غرس البيانات الأولية لخدمات مسامر...");

  for (const service of initialServices) {
    const upserted = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription,
        icon: service.icon,
        features: service.features,
        sortOrder: service.sortOrder,
        isActive: service.isActive,
      },
      create: service,
    });
    console.log(`✅ تم إعداد الخدمة: ${upserted.title} (${upserted.slug})`);
  }

  console.log("🌱 بدء غرس إعدادات وهوية الموقع...");
  const existingSetting = await prisma.siteSetting.findFirst();
  if (existingSetting) {
    console.log(`ℹ️ إعدادات الموقع موجودة مسبقاً (ID: ${existingSetting.id})`);
  } else {
    const createdSetting = await prisma.siteSetting.create({
      data: {
        siteName: "مسامر",
        siteNameEn: "MASAMER",
        shortDescription: "خدمات الضيافة الفاخرة والقهوجيين وتجهيز المناسبات",
        phone: "0539691477",
        whatsapp: "0539691477",
        email: "info@masamer.sa",
        address: "المملكة العربية السعودية",
        heroBadge: "أصالة الضيافة برؤية معاصرة",
        heroTitle: "مسـامر لخدمات الضيافة",
        heroHighlightedText: "فخامة تليق بضيوفك ومناسباتك",
        heroDescription:
          "نقدم أرقى خدمات القهوجيين والصبابين المدربين بأعلى معايير اللباقة والأصالة، مع جاهزية متكاملة لتوفير وتجهيز كافة مستلزمات الضيافة لمناسباتك الرسمية والخاصة.",
        heroPrimaryButtonText: "اطلب الخدمة",
        heroSecondaryButtonText: "استكشف خدماتنا",
        footerDescription:
          "المنصة الرائدة في تقديم أرقى خدمات القهوجيين والصبابين وتجهيز متطلبات الضيافة للمؤتمرات والفعاليات والمناسبات الخاصة في المملكة العربية السعودية.",
        copyrightText: "مسامر لخدمات الضيافة. جميع الحقوق محفوظة.",
        seoTitle: "مسامر | خدمات الضيافة والقهوجيين وتجهيز المناسبات",
        seoDescription:
          "المنصة الرائدة في تقديم خدمات القهوجيين والصبابين المحترفين في المملكة العربية السعودية.",
      },
    });
    console.log(`✅ تم إنشاء إعدادات الموقع الافتراضية بنجاح (ID: ${createdSetting.id})`);
  }

  console.log("🌱 بدء غرس تصنيفات معرض الأعمال...");
  const initialPortfolioCategories = [
    {
      name: "القهوجيين والصبابين",
      slug: "gahwajis-and-sabbabin",
      description: "طواقم قهوجيين وصبابين محترفين للفعاليات والمناسبات الرسمية والخاصة",
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "تجهيز المناسبات والحفلات",
      slug: "events-and-parties",
      description: "تجهيزات متكاملة للحفلات والمؤتمرات والمناسبات العامة",
      sortOrder: 2,
      isActive: true,
    },
    {
      name: "تجهيز مواقع المناسبات",
      slug: "event-venues",
      description: "تهيئة وتجهيز المواقع المفتوحة والمغلقة بأحدث المعدات",
      sortOrder: 3,
      isActive: true,
    },
    {
      name: "الجلسات والتأثيث",
      slug: "seating-and-furniture",
      description: "جلسات فاخرة وأثاث مراسم بتصاميم عصرية وتراثية راقية",
      sortOrder: 4,
      isActive: true,
    },
    {
      name: "الجلسات الشعبية",
      slug: "traditional-seating",
      description: "جلسات تراثية وشعبية أصيلة تعكس كرم الضيافة السعودية",
      sortOrder: 5,
      isActive: true,
    },
    {
      name: "الديكور والتنسيق",
      slug: "decor-and-styling",
      description: "تنسيق الديكورات وتوزيع عناصر الضيافة والمباخر والزهور",
      sortOrder: 6,
      isActive: true,
    },
  ];

  for (const cat of initialPortfolioCategories) {
    const upsertedCat = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
    console.log(`✅ تم إعداد تصنيف الأعمال: ${upsertedCat.name} (${upsertedCat.slug})`);
  }

  console.log("✨ اكتمل غرس البيانات بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ أثناء غرس البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
