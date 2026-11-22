// Inputs the brand form offers. Every label is bilingual; `hints` feed the generator.

export const CATEGORIES = [
  { id: 'coffee', icon: 'Coffee', en: 'Coffee & café', ar: 'قهوة ومقاهي', product: { en: 'signature blend', ar: 'الخلطة المميزة' }, noun: { en: 'café', ar: 'مقهى' }, marks: ['bean', 'arch', 'monogram-circle', 'crescent'], pack: 'cup', hue: 25 },
  { id: 'restaurant', icon: 'UtensilsCrossed', en: 'Restaurant & food', ar: 'مطاعم وأغذية', product: { en: 'chef’s menu', ar: 'قائمة الشيف' }, noun: { en: 'kitchen', ar: 'مطبخ' }, marks: ['bloom', 'monogram-square', 'arch', 'wave'], pack: 'box', hue: 12 },
  { id: 'fashion', icon: 'Shirt', en: 'Fashion & apparel', ar: 'أزياء وملابس', product: { en: 'new collection', ar: 'المجموعة الجديدة' }, noun: { en: 'label', ar: 'علامة أزياء' }, marks: ['monogram-split', 'spark', 'arch', 'diamond'], pack: 'bag', hue: 330 },
  { id: 'beauty', icon: 'Sparkles', en: 'Beauty & cosmetics', ar: 'تجميل ومستحضرات', product: { en: 'glow serum', ar: 'سيروم النضارة' }, noun: { en: 'beauty house', ar: 'دار تجميل' }, marks: ['petals', 'monogram-circle', 'spark', 'wave'], pack: 'bottle', hue: 340 },
  { id: 'perfume', icon: 'FlaskConical', en: 'Perfume & oud', ar: 'عطور وعود', product: { en: 'oud edition', ar: 'إصدار العود' }, noun: { en: 'perfumery', ar: 'دار عطور' }, marks: ['crescent', 'arch', 'diamond', 'spark'], pack: 'bottle', hue: 35 },
  { id: 'jewelry', icon: 'Gem', en: 'Jewelry', ar: 'مجوهرات', product: { en: 'bridal set', ar: 'طقم العروس' }, noun: { en: 'atelier', ar: 'مشغل مجوهرات' }, marks: ['diamond', 'spark', 'monogram-circle', 'arch'], pack: 'box', hue: 45 },
  { id: 'tech', icon: 'Cpu', en: 'Technology & SaaS', ar: 'تقنية وبرمجيات', product: { en: 'platform', ar: 'المنصة' }, noun: { en: 'platform', ar: 'منصة' }, marks: ['orbit', 'hexagon', 'pillars', 'monogram-split'], pack: 'box', hue: 255 },
  { id: 'wellness', icon: 'Leaf', en: 'Health & wellness', ar: 'صحة وعافية', product: { en: 'daily ritual', ar: 'روتين العناية اليومي' }, noun: { en: 'studio', ar: 'مركز عافية' }, marks: ['petals', 'wave', 'bloom', 'monogram-circle'], pack: 'bottle', hue: 150 },
  { id: 'fitness', icon: 'Dumbbell', en: 'Fitness & sport', ar: 'لياقة ورياضة', product: { en: 'training program', ar: 'برنامج التدريب' }, noun: { en: 'club', ar: 'نادٍ' }, marks: ['pillars', 'hexagon', 'shield', 'spark'], pack: 'bag', hue: 5 },
  { id: 'realestate', icon: 'Building2', en: 'Real estate', ar: 'عقارات', product: { en: 'new residences', ar: 'المساكن الجديدة' }, noun: { en: 'developer', ar: 'مطوّر عقاري' }, marks: ['arch', 'pillars', 'shield', 'monogram-square'], pack: 'box', hue: 210 },
  { id: 'finance', icon: 'Landmark', en: 'Finance & fintech', ar: 'مالية وتقنية مالية', product: { en: 'smart account', ar: 'الحساب الذكي' }, noun: { en: 'firm', ar: 'مؤسسة مالية' }, marks: ['shield', 'pillars', 'hexagon', 'orbit'], pack: 'box', hue: 220 },
  { id: 'education', icon: 'GraduationCap', en: 'Education', ar: 'تعليم', product: { en: 'learning track', ar: 'المسار التعليمي' }, noun: { en: 'academy', ar: 'أكاديمية' }, marks: ['orbit', 'shield', 'bloom', 'monogram-square'], pack: 'bag', hue: 200 },
  { id: 'travel', icon: 'Plane', en: 'Travel & hospitality', ar: 'سفر وضيافة', product: { en: 'getaway package', ar: 'باقة الرحلة' }, noun: { en: 'retreat', ar: 'وجهة ضيافة' }, marks: ['wave', 'crescent', 'arch', 'orbit'], pack: 'bag', hue: 190 },
  { id: 'agency', icon: 'PenTool', en: 'Creative agency', ar: 'وكالة إبداعية', product: { en: 'brand sprint', ar: 'جلسة بناء العلامة' }, noun: { en: 'studio', ar: 'استوديو' }, marks: ['monogram-split', 'spark', 'orbit', 'bloom'], pack: 'bag', hue: 275 },
  { id: 'ecommerce', icon: 'ShoppingBag', en: 'E‑commerce & retail', ar: 'تجارة إلكترونية', product: { en: 'best‑sellers', ar: 'الأكثر مبيعًا' }, noun: { en: 'store', ar: 'متجر' }, marks: ['hexagon', 'bloom', 'monogram-square', 'wave'], pack: 'box', hue: 285 },
];

export const PERSONALITIES = [
  { id: 'luxury', en: 'Luxurious', ar: 'فاخرة', desc: { en: 'Refined, rare, quietly confident', ar: 'راقية ونادرة وواثقة بهدوء' }, sat: [0.45, 0.6], light: [0.18, 0.32], heading: ['Playfair Display', 'Cormorant Garamond'], body: ['Manrope', 'Inter'], headingAr: ['Amiri', 'El Messiri'], bodyAr: ['IBM Plex Sans Arabic', 'Tajawal'], accentGold: true },
  { id: 'modern', en: 'Modern', ar: 'عصرية', desc: { en: 'Clean, current, precise', ar: 'نظيفة ومواكبة ودقيقة' }, sat: [0.55, 0.75], light: [0.42, 0.55], heading: ['Space Grotesk', 'Outfit'], body: ['Inter', 'DM Sans'], headingAr: ['Readex Pro', 'Changa'], bodyAr: ['IBM Plex Sans Arabic', 'Almarai'] },
  { id: 'minimal', en: 'Minimal', ar: 'بسيطة', desc: { en: 'Essential, calm, uncluttered', ar: 'جوهرية وهادئة وخالية من الزحام' }, sat: [0.12, 0.3], light: [0.2, 0.4], heading: ['Outfit', 'Sora'], body: ['Inter', 'DM Sans'], headingAr: ['Readex Pro', 'IBM Plex Sans Arabic'], bodyAr: ['IBM Plex Sans Arabic', 'Almarai'] },
  { id: 'bold', en: 'Bold', ar: 'جريئة', desc: { en: 'Loud, energetic, unmistakable', ar: 'صاخبة ونشيطة ولا تُخطئها العين' }, sat: [0.75, 0.95], light: [0.45, 0.55], heading: ['Unbounded', 'Syne'], body: ['Manrope', 'DM Sans'], headingAr: ['Lalezar', 'Changa'], bodyAr: ['Cairo', 'Tajawal'] },
  { id: 'playful', en: 'Playful', ar: 'مرحة', desc: { en: 'Warm, friendly, a little cheeky', ar: 'دافئة وودودة وخفيفة الظل' }, sat: [0.65, 0.85], light: [0.52, 0.62], heading: ['Poppins', 'Fraunces'], body: ['DM Sans', 'Manrope'], headingAr: ['Reem Kufi', 'Cairo'], bodyAr: ['Tajawal', 'Almarai'] },
  { id: 'trust', en: 'Trustworthy', ar: 'موثوقة', desc: { en: 'Steady, clear, dependable', ar: 'ثابتة وواضحة ويُعتمد عليها' }, sat: [0.45, 0.65], light: [0.3, 0.42], heading: ['Sora', 'Montserrat'], body: ['Inter', 'Lora'], headingAr: ['Cairo', 'Readex Pro'], bodyAr: ['IBM Plex Sans Arabic', 'Tajawal'] },
  { id: 'natural', en: 'Natural', ar: 'طبيعية', desc: { en: 'Organic, honest, grounded', ar: 'عضوية وصادقة وقريبة من الأرض' }, sat: [0.25, 0.45], light: [0.3, 0.42], heading: ['Fraunces', 'Cormorant Garamond'], body: ['Manrope', 'Lora'], headingAr: ['El Messiri', 'Amiri'], bodyAr: ['Almarai', 'Tajawal'] },
  { id: 'innovative', en: 'Innovative', ar: 'مبتكرة', desc: { en: 'Visionary, technical, forward', ar: 'رؤيوية وتقنية ومتقدمة' }, sat: [0.6, 0.85], light: [0.45, 0.58], heading: ['Sora', 'Space Grotesk'], body: ['Inter', 'Manrope'], headingAr: ['Changa', 'Readex Pro'], bodyAr: ['IBM Plex Sans Arabic', 'Cairo'] },
];

export const COLOR_FAMILIES = [
  { id: 'purple', en: 'Purple', ar: 'بنفسجي', hue: 268, swatch: '#8B5CF6' },
  { id: 'blue', en: 'Blue', ar: 'أزرق', hue: 220, swatch: '#3B6FE0' },
  { id: 'teal', en: 'Teal', ar: 'فيروزي', hue: 178, swatch: '#14A39A' },
  { id: 'green', en: 'Green', ar: 'أخضر', hue: 145, swatch: '#2F9E5B' },
  { id: 'gold', en: 'Gold', ar: 'ذهبي', hue: 42, swatch: '#C9A24A' },
  { id: 'orange', en: 'Orange', ar: 'برتقالي', hue: 24, swatch: '#EE7A2F' },
  { id: 'red', en: 'Red', ar: 'أحمر', hue: 355, swatch: '#D9374B' },
  { id: 'pink', en: 'Pink', ar: 'وردي', hue: 330, swatch: '#E5609E' },
  { id: 'brown', en: 'Earth', ar: 'ترابي', hue: 28, swatch: '#8A5A3B', earthy: true },
  { id: 'mono', en: 'Black & white', ar: 'أسود وأبيض', hue: 260, swatch: '#1A1A1F', mono: true },
];

export const AUDIENCE_SUGGESTIONS = {
  en: ['Young professionals 25–35', 'Families in the GCC', 'Gen Z creators', 'High‑income women 30–50', 'Startup founders', 'University students'],
  ar: ['شباب مهنيون ٢٥–٣٥', 'العائلات في الخليج', 'صنّاع المحتوى من الجيل زد', 'نساء بدخل مرتفع ٣٠–٥٠', 'مؤسسو الشركات الناشئة', 'طلاب الجامعات'],
};

export const findCategory = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
export const findPersonality = (id) => PERSONALITIES.find((p) => p.id === id) || PERSONALITIES[1];
