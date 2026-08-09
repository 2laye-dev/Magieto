export const categories = [
  { id: "skin", title: "رنگ مو", image: `${import.meta.env.BASE_URL}assets/Categories/color.png` },
  { id: "hair", title: "مراقبت مو", image: `${import.meta.env.BASE_URL}assets/Categories/haircare.png` },
  { id: "makeup", title: "محصولات آرایشی", image: `${import.meta.env.BASE_URL}assets/Categories/makeup.png` },
  { id: "fragrance", title: "عطر و خوشبو کننده", image: `${import.meta.env.BASE_URL}assets/Categories/perfume.png` },
  { id: "body", title: "محصولات سالنی", image: `${import.meta.env.BASE_URL}assets/Categories/saloon.png` },
  { id: "personal-care", title: "بهداشت دهان و دندان", image: `${import.meta.env.BASE_URL}assets/Categories/dental-care.png` },
];

export const brandLogos = {
  "آپ اسکای": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-آپ-اسکای.jpg`,
  "آرکیا": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-آرکیا.jpg`,
  "اورادنت": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-اورادنت.jpg`,
  "بیس": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-بیس.jpg`,
  "پادینا": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-پادینا.jpg`,
  "تاکوری": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-تاکوری.jpg`,
  "جوو": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-جوو.jpg`,
  "کالیون": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-کالیون.jpg`,
  "لورینت": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-لورینت.jpg`,
  "مولهنس": `${import.meta.env.BASE_URL}assets/Brands/مولهنس.jpg`,
  "وینا": `${import.meta.env.BASE_URL}assets/Brands/آیکون-برند-وینا.jpg`,
};

export const brands = Object.keys(brandLogos);

const localProductFiles = [
  ["پیشنهاد ویژه", "اوردانت - دهانشویه.jpg"],
  ["پیشنهاد ویژه", "تاکوری - ماسک مو شماره 1.jpg"],
  ["پیشنهاد ویژه", "لورینت - پنکیک.jpg"],
  ["پیشنهاد ویژه", "مولهنس - بادی اسپلش کرید اونتوس.jpg"],
  ["پیشنهاد ویژه", "مولهنس - لوسیون بدن.jpg"],
  ["جدیدترین ها", "تاکوری - سرم دو فاز.jpg"],
  ["جدیدترین ها", "لورینت - سایه.jpg"],
  ["جدیدترین ها", "مولهنس - عطر 35 میل.jpg"],
  ["جدیدترین ها", "مولهنس - مام رول فاقد آلومینیوم.jpg"],
  ["جدیدترین ها", "وینا - رنگ مو.jpg"],
  ["مراقبت مو", "تاکوری - روغن مو.jpg"],
  ["مراقبت مو", "تاکوری - سرم دو فاز.jpg"],
  ["مراقبت مو", "تاکوری - ماسک مو شماره 1.jpg"],
  ["مراقبت مو", "تاکوری - ماسک مو شماره 3.jpg"],
  ["مراقبت مو", "وینا - رنگ مو.jpg"],
  ["آرایش", "لورینت - پنکیک.jpg"],
  ["آرایش", "لورینت - خط چشم.jpg"],
  ["آرایش", "لورینت - رژ گونه.jpg"],
  ["آرایش", "لورینت - رژ لب مگنتی.jpg"],
  ["آرایش", "لورینت - سایه.jpg"],
  ["آرایش", "لورینت - کرم پودر تیوپی.jpg"],
];

const normalizeBrand = (value) => value === "اوردانت" ? "اورادنت" : value;

export const products = localProductFiles.map(([collection, fileName], index) => {
  const name = fileName.replace(/\.[^.]+$/, "");
  const brand = normalizeBrand(name.split(" - ")[0]);
  return {
    id: `local-product-${index + 1}`,
    name,
    englishName: name,
    brand,
    brandLogo: brandLogos[brand],
    collection,
    category: collection,
    price: 385000 + index * 27000,
    oldPrice: null,
    rating: 0,
    reviews: 0,
    stock: 12,
    volume: "",
    origin: "ایران",
    image: `${import.meta.env.BASE_URL}assets/Products/${collection}/${fileName}`,
    alternate: "",
    concerns: [],
    suitable: "",
    ingredients: [],
    description: name,
    usage: "",
    warning: "",
    badge: "",
  };
});

export const guides = [
  {
    slug: "choose-vitamin-c",
    title: "چطور ویتامین C مناسب پوستمان را انتخاب کنیم؟",
    excerpt: "غلظت، نوع مشتق و جای درست آن در روتین را بدون اصطلاحات پیچیده بشناسید.",
    category: "راهنمای ترکیبات",
    readTime: "۶ دقیقه",
    image: "",
  },
  {
    slug: "sunscreen-city",
    title: "ضدآفتاب شهری؛ چه بافتی برای استفاده هر روز بهتر است؟",
    excerpt: "از میزان محافظت تا پایان بافت و سازگاری با آرایش روزانه.",
    category: "روتین پوست",
    readTime: "۵ دقیقه",
    image: "",
  },
  {
    slug: "damaged-hair",
    title: "برای موی رنگ‌شده، ماسک مو را کجای روتین بگذاریم؟",
    excerpt: "تفاوت نرم‌کننده و ماسک و روش استفاده بدون سنگین شدن ساقه.",
    category: "مراقبت مو",
    readTime: "۴ دقیقه",
    image: "",
  },
];

export const formatPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

export const navItems = [
  { label: "مراقبت پوست", href: "/products?category=skin" },
  { label: "مراقبت مو", href: "/products?category=hair" },
  { label: "آرایش", href: "/products?category=makeup" },
  { label: "عطر", href: "/products?category=fragrance" },
  { label: "برندها", href: "/brands" },
  { label: "راهنماها", href: "/guides" },
  { label: "پیشنهادهای ویژه", href: "/offers" },
];
