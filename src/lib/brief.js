// Creative brief (workflow step 2). The backend writes it with a language model; this local
// version builds it from the form answers and is labelled as a sample in the UI.
import { findCategory, findPersonality, COLOR_FAMILIES } from '../data/options';
import { VOICE } from './copy';

const T = {
  en: {
    objective: (n, noun, aud) => `Launch ${n} as a ${noun} that ${aud} recognise at a glance and remember after one visit.`,
    insight: (aud) => `${aud} choose brands that feel considered and consistent. They notice details, share what looks good and stay loyal to brands that keep their promise.`,
    positioning: (n, per, noun) => `${n} is the ${per.toLowerCase()} ${noun} for people who care how things are made.`,
    cues: (per, cols) => [`${per} personality expressed through restrained, consistent design`, cols ? `Colour built around ${cols}` : 'A colour palette chosen for the category and audience', 'A symbol that works at 16px and on a storefront', 'Typography that reads well in English and Arabic'],
    avoid: ['Stock clip-art and literal icons', 'More than one accent colour per layout', 'Effects such as bevels, glows and heavy gradients', 'Trends that will date within two years'],
    deliverables: ['12 logo directions and a refined primary logo', 'Palette, typography and patterns', 'Social, print and packaging applications', 'Brand guidelines PDF and source files'],
  },
  ar: {
    objective: (n, noun, aud) => `إطلاق ${n} كـ${noun} يتعرّف عليه ${aud} من النظرة الأولى ويتذكرونه بعد زيارة واحدة.`,
    insight: (aud) => `يختار ${aud} العلامات التي تبدو مدروسة ومتّسقة. يلاحظون التفاصيل، ويشاركون ما يبدو جميلًا، ويبقون أوفياء لمن يفي بوعده.`,
    positioning: (n, per, noun) => `${n} هو ${noun} بطابع ${per} لمن يهتمون بطريقة صنع الأشياء.`,
    cues: (per, cols) => [`شخصية ${per} تظهر عبر تصميم متّزن ومتّسق`, cols ? `ألوان مبنية حول ${cols}` : 'لوحة ألوان مختارة حسب الفئة والجمهور', 'رمز يعمل بحجم ١٦ بكسل وعلى واجهة متجر', 'خطوط واضحة بالعربية والإنجليزية'],
    avoid: ['الرسومات الجاهزة والأيقونات الحرفية', 'أكثر من لون مميِّز واحد في التصميم', 'المؤثرات مثل الظلال والتوهج والتدرجات الثقيلة', 'الصيحات التي ستصبح قديمة خلال عامين'],
    deliverables: ['١٢ اتجاهًا للشعار وشعار أساسي محسّن', 'الألوان والخطوط والنقوش', 'تطبيقات التواصل والمطبوعات والتغليف', 'دليل الهوية PDF وملفات المصدر'],
  },
};

export function generateCreativeBrief(input) {
  const lang = input.language === 'ar' ? 'ar' : 'en';
  const t = T[lang];
  const cat = findCategory(input.category);
  const per = findPersonality(input.personality);
  const aud = input.audience?.trim() || (lang === 'ar' ? 'جمهورك' : 'your audience');
  const cols = (input.colors || []).map((id) => COLOR_FAMILIES.find((c) => c.id === id)?.[lang]).filter(Boolean).join(lang === 'ar' ? ' و' : ' and ');
  return {
    source: 'sample',
    objective: t.objective(input.name, cat.noun[lang], aud),
    insight: t.insight(aud),
    positioning: t.positioning(input.name, per[lang], cat.noun[lang]),
    personality: VOICE[per.id].traits.map((x) => x[lang]),
    cues: t.cues(per[lang], cols),
    avoid: t.avoid,
    deliverables: t.deliverables,
  };
}
