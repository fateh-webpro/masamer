export interface NavItem { title: string; href: string; description?: string }
export const mainNav: NavItem[] = [
  { title: "الرئيسية", href: "/" }, { title: "خدماتنا", href: "/services" }, { title: "أعمالنا", href: "/works" },
  { title: "من نحن", href: "/about" }, { title: "تواصل معنا", href: "/contact" },
];
export const footerLinks = {
  services: [{ title: "خدماتنا", href: "/services" }, { title: "أعمالنا", href: "/works" }, { title: "اطلب الخدمة", href: "/request" }],
  company: [{ title: "عن مسامر", href: "/about" }, { title: "تواصل معنا", href: "/contact" }],
};
