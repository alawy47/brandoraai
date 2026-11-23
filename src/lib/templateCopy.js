import { anyPackCopy, packCopy } from './templatePacks';

// Starter text for every template, in both languages. Brand name, tagline and contact details come from the concept.
// Lines in `items` are "label | value" pairs for menus and invoices, plain lines elsewhere.
const COPY = {
  event: { en: { kicker: '12 DEC · 7 PM', headline: 'Opening night', sub: 'Doors open at 6:30. Seats are limited, so reserve yours.', cta: 'Reserve a seat' }, ar: { kicker: '١٢ ديسمبر · ٧ م', headline: 'ليلة الافتتاح', sub: 'تُفتح الأبواب ٦:٣٠. المقاعد محدودة، احجز مقعدك.', cta: 'احجز مقعدك' } },
  stat: { en: { kicker: 'Our year in numbers', big: '12,400', headline: 'orders delivered with care', sub: 'Thank you for choosing us.' }, ar: { kicker: 'عامنا بالأرقام', big: '١٢٬٤٠٠', headline: 'طلب وصل بعناية', sub: 'شكرًا لأنك اخترتنا.' } },
  menu: { en: { kicker: 'This week', headline: 'Our menu', items: 'Signature blend | 14\nSeasonal special | 18\nHouse favourite | 16\nSomething sweet | 9' }, ar: { kicker: 'هذا الأسبوع', headline: 'قائمتنا', items: 'مزيجنا الخاص | ١٤\nطبق الموسم | ١٨\nالمفضّل لدينا | ١٦\nحلوى اليوم | ٩' } },
  giveaway: { en: { kicker: 'Giveaway', headline: 'Win a gift set', sub: 'Three ways to enter', items: 'Follow our page\nTag a friend\nShare this post', cta: 'Ends Friday' }, ar: { kicker: 'مسابقة', headline: 'اربح هدية', sub: 'ثلاث خطوات للمشاركة', items: 'تابع صفحتنا\nاذكر صديقًا\nشارك المنشور', cta: 'تنتهي الجمعة' } },
  hiring: { en: { kicker: "We're hiring", headline: 'Brand designer', sub: 'Join a small team that cares about craft.', items: 'Two years of identity work\nStrong typography\nBilingual is a plus', cta: 'Apply today' }, ar: { kicker: 'نبحث عنك', headline: 'مصمم هوية', sub: 'انضم إلى فريق صغير يهتم بالإتقان.', items: 'خبرة سنتين في الهوية\nحس قوي بالخطوط\nإتقان اللغتين ميزة', cta: 'قدّم الآن' } },
  thanks: { en: { kicker: 'From all of us', headline: 'Thank you', sub: 'Your support means more than we can say.' }, ar: { kicker: 'من فريقنا', headline: 'شكرًا لك', sub: 'دعمك يعني لنا أكثر مما نستطيع قوله.' } },
  bgquote: { en: { headline: 'Good design is quiet, and it is remembered.', sub: 'Our promise' }, ar: { headline: 'التصميم الجيد هادئ، لكنه لا يُنسى.', sub: 'وعدنا' } },
  feature: { en: { kicker: 'Why choose us', headline: 'Built around you', items: 'Made with care\nFast delivery\nHonest prices\nHuman support' }, ar: { kicker: 'لماذا نحن', headline: 'مصمم من أجلك', items: 'صُنع بعناية\nتوصيل سريع\nأسعار صادقة\nدعم بشري' } },
  split: { en: { kicker: 'New', headline: 'Fresh from the studio', sub: 'A new chapter starts today.', cta: 'Learn more' }, ar: { kicker: 'جديد', headline: 'طازج من الاستوديو', sub: 'فصل جديد يبدأ اليوم.', cta: 'اعرف أكثر' } },
  carousel: { en: { kicker: 'Guide · 1/6', headline: 'Six ideas worth saving', sub: 'Swipe to read' }, ar: { kicker: 'دليل · ١/٦', headline: 'ست أفكار تستحق الحفظ', sub: 'اسحب للقراءة' } },

  qstory: { en: { headline: 'Make it simple, then make it beautiful.', sub: 'Monday note' }, ar: { headline: 'اجعله بسيطًا، ثم اجعله جميلًا.', sub: 'ملاحظة الاثنين' } },
  countdown: { en: { kicker: 'Launching in', big: '03', headline: 'days', cta: 'Set a reminder' }, ar: { kicker: 'نطلق بعد', big: '٠٣', headline: 'أيام', cta: 'فعّل التذكير' } },
  tipstory: { en: { kicker: 'Quick tip', headline: 'Three habits', items: 'Start small\nStay consistent\nReview weekly' }, ar: { kicker: 'نصيحة سريعة', headline: 'ثلاث عادات', items: 'ابدأ صغيرًا\nداوم\nراجع أسبوعيًا' } },
  menustory: { en: { kicker: 'Today', headline: 'On the menu', items: 'Morning set | 12\nLunch plate | 22\nEvening special | 28' }, ar: { kicker: 'اليوم', headline: 'على القائمة', items: 'فطور الصباح | ١٢\nطبق الغداء | ٢٢\nعشاء خاص | ٢٨' } },
  announce: { en: { kicker: 'Announcement', headline: 'Something new is coming', sub: 'Stay close.', cta: 'Swipe up' }, ar: { kicker: 'إعلان', headline: 'شيء جديد قادم', sub: 'ابقَ قريبًا.', cta: 'اسحب للأعلى' } },
  qa: { en: { kicker: 'Ask us anything', headline: 'Your questions, answered', sub: 'Type your question below' }, ar: { kicker: 'اسألنا', headline: 'نجيب عن أسئلتك', sub: 'اكتب سؤالك أدناه' } },

  poster: { en: { kicker: 'Live · 12 December', headline: 'An evening of craft', sub: 'Music, food and good company.', cta: 'Free entry' }, ar: { kicker: 'مباشر · ١٢ ديسمبر', headline: 'أمسية الإتقان', sub: 'موسيقى وطعام وصحبة طيبة.', cta: 'الدخول مجاني' } },
  flyer: { en: { kicker: 'Special offer', headline: 'Your first order, on us', sub: 'Show this flyer at the counter.', items: 'Free tasting\nComplimentary delivery\nValid until month end', cta: 'Visit us today' }, ar: { kicker: 'عرض خاص', headline: 'طلبك الأول علينا', sub: 'أبرز هذه الورقة عند الكاونتر.', items: 'تذوّق مجاني\nتوصيل مجاني\nساري حتى نهاية الشهر', cta: 'زرنا اليوم' } },
  menuprint: { en: { kicker: 'Menu', headline: 'Food & drink', items: 'Starters\nHouse salad | 14\nSoup of the day | 12\nMains\nGrilled catch | 38\nSlow-cooked lamb | 46\nDesserts\nDate pudding | 16\nSeasonal fruit | 14' }, ar: { kicker: 'القائمة', headline: 'الطعام والشراب', items: 'المقبلات\nسلطة البيت | ١٤\nشوربة اليوم | ١٢\nالأطباق الرئيسية\nسمك مشوي | ٣٨\nلحم مطهو ببطء | ٤٦\nالحلويات\nبودينغ التمر | ١٦\nفاكهة الموسم | ١٤' } },
  certificate: { en: { kicker: 'Certificate of achievement', headline: 'Layla Haddad', sub: 'is recognised for outstanding contribution and dedication to the craft.', cta: 'Awarded on 12 December' }, ar: { kicker: 'شهادة تقدير', headline: 'ليلى حداد', sub: 'تقديرًا لإسهامها المتميز وإخلاصها في عملها.', cta: 'مُنحت بتاريخ ١٢ ديسمبر' } },
  invoice: { en: { kicker: 'Invoice', headline: 'INV-0042', sub: 'Bill to: Layla Haddad', items: 'Brand identity | 4200\nSocial templates | 1200\nPrint set | 900', cta: 'Payment due in 14 days' }, ar: { kicker: 'فاتورة', headline: 'INV-0042', sub: 'الفاتورة إلى: ليلى حداد', items: 'هوية العلامة | ٤٢٠٠\nقوالب السوشال | ١٢٠٠\nالمطبوعات | ٩٠٠', cta: 'الدفع خلال ١٤ يومًا' } },
  giftcard: { en: { kicker: 'Gift card', big: '100', headline: 'For someone special', sub: 'Valid for 12 months' }, ar: { kicker: 'بطاقة هدية', big: '١٠٠', headline: 'لشخص مميز', sub: 'صالحة لمدة ١٢ شهرًا' } },
  signature: { en: {}, ar: {} },
  thankscard: { en: { kicker: 'With thanks', headline: 'Thank you for your order', sub: 'We hope it brings you joy.' }, ar: { kicker: 'مع الامتنان', headline: 'شكرًا على طلبك', sub: 'نتمنى أن يسعدك.' } },
};

/** Starter text for a template: the category's own copy first, then the generic text, then any pack that defines it. */
export const templateDefaults = (id, lang, category) => ({
  ...(COPY[id]?.[lang === 'ar' ? 'ar' : 'en'] || anyPackCopy(id, lang)),
  ...(category ? packCopy(category, id, lang) : {}),
});
