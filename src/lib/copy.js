// Copy templates used by the sample generator. {name} {noun} {product} {audience}
// are filled in per brand. Each personality has its own register in both languages.

export const TAGLINES = {
  luxury: {
    en: ['Crafted for the few.', 'Every detail, deliberate.', 'Quiet luxury, made to last.', 'Rare by design.'],
    ar: ['صُنعت للقلّة.', 'كل تفصيل مقصود.', 'فخامة هادئة تدوم.', 'نادرة بطبيعتها.'],
  },
  modern: {
    en: ['Made for how you live now.', 'Simple. Sharp. Yours.', 'The new standard.', 'Built for today.'],
    ar: ['صُمّمت لإيقاع حياتك اليوم.', 'بسيطة. حادة. لك.', 'المعيار الجديد.', 'مبنية لليوم.'],
  },
  minimal: {
    en: ['Only what matters.', 'Less noise. More you.', 'Essentials, perfected.', 'Clarity in every form.'],
    ar: ['فقط ما يهم.', 'ضجيج أقل. أنت أكثر.', 'الأساسيات بإتقان.', 'وضوح في كل شكل.'],
  },
  bold: {
    en: ['Turn it up.', 'Made loud. Made to move.', 'No half measures.', 'Own the room.'],
    ar: ['ارفع الصوت.', 'صاخبة وتتحرك.', 'لا أنصاف حلول.', 'تصدّر المشهد.'],
  },
  playful: {
    en: ['Good things, happy days.', 'A little joy in everything.', 'Come as you are.', 'Smile, it’s {name}.'],
    ar: ['أشياء جميلة وأيام سعيدة.', 'قليل من الفرح في كل شيء.', 'تعال كما أنت.', 'ابتسم، إنها {name}.'],
  },
  trust: {
    en: ['Steady hands, clear answers.', 'Here when it counts.', 'Confidence, built in.', 'Your partner for the long run.'],
    ar: ['أيدٍ ثابتة وإجابات واضحة.', 'معك حين يهم الأمر.', 'ثقة مدمجة.', 'شريكك للمدى الطويل.'],
  },
  natural: {
    en: ['Rooted in what’s real.', 'Grown with care.', 'Honest by nature.', 'From the earth, for you.'],
    ar: ['متجذّرة في الأصيل.', 'نمت بعناية.', 'صادقة بطبيعتها.', 'من الأرض، إليك.'],
  },
  innovative: {
    en: ['Tomorrow, delivered.', 'Think further.', 'Where ideas take shape.', 'Built for what’s next.'],
    ar: ['المستقبل، الآن.', 'فكّر أبعد.', 'حيث تتشكّل الأفكار.', 'مبنية لما هو قادم.'],
  },
};

export const DIRECTIONS = {
  signature: {
    titles: {
      luxury: { en: 'Gilded Calm', ar: 'سكينة مذهّبة' }, modern: { en: 'Clean Signal', ar: 'إشارة نقية' }, minimal: { en: 'Pure Form', ar: 'الشكل الصافي' },
      bold: { en: 'Full Volume', ar: 'بأعلى صوت' }, playful: { en: 'Sunny Side', ar: 'الجانب المشمس' }, trust: { en: 'True North', ar: 'الشمال الحقيقي' },
      natural: { en: 'Grounded Craft', ar: 'حِرفة أصيلة' }, innovative: { en: 'Next Horizon', ar: 'الأفق القادم' },
    },
    summary: {
      en: 'The most faithful reading of your brief: {personality} at its core, built around your chosen colors and designed to feel instantly familiar to {audience}.',
      ar: 'القراءة الأكثر وفاءً لطلبك: شخصية {personality} في جوهرها، مبنية حول ألوانك المختارة ومصممة لتكون مألوفة فورًا لدى {audience}.',
    },
    story: {
      en: '{name} started with one conviction: a {noun} should feel as considered as the moments it is part of. Every choice, from our {product} to the way we greet you, is made with {audience} in mind. We keep what works, refine what matters, and leave out everything else.',
      ar: 'بدأت {name} بقناعة واحدة: أن يكون كل {noun} مدروسًا بقدر اللحظات التي يرافقها. كل قرار، من {product} إلى طريقة استقبالك، نتخذه ونحن نفكر في {audience}. نحافظ على ما ينجح، ونصقل ما يهم، ونترك كل ما عدا ذلك.',
    },
    mission: {
      en: 'To give {audience} a {noun} they can rely on, with quality they can see and service they remember.',
      ar: 'أن نمنح {audience} تجربة {noun} يُعتمد عليها، بجودة تُرى وخدمة لا تُنسى.',
    },
  },
  contrast: {
    titles: {
      luxury: { en: 'Velvet Hour', ar: 'ساعة المخمل' }, modern: { en: 'Sharp Contrast', ar: 'تباين حاد' }, minimal: { en: 'Soft Edge', ar: 'الحافة الناعمة' },
      bold: { en: 'Electric Pulse', ar: 'نبض كهربائي' }, playful: { en: 'Pop Story', ar: 'حكاية ملونة' }, trust: { en: 'Solid Ground', ar: 'أرض صلبة' },
      natural: { en: 'Wild Bloom', ar: 'تفتّح بري' }, innovative: { en: 'Future Lab', ar: 'مختبر المستقبل' },
    },
    summary: {
      en: 'A higher-contrast take that pairs your base color with its complement. It stands out in crowded feeds and on shelves while keeping the {personality} tone.',
      ar: 'رؤية أعلى تباينًا تمزج لونك الأساسي بلونه المكمّل. تبرز في المنصات المزدحمة وعلى الرفوف مع الحفاظ على الطابع {personality}.',
    },
    story: {
      en: 'Most brands in this space whisper. {name} speaks clearly. We built our {noun} for {audience} who know what they want and notice when it is done right. Our {product} is the proof: distinctive, confident, and made to be remembered.',
      ar: 'معظم العلامات في هذا المجال تهمس، أما {name} فتتحدث بوضوح. بنينا تجربتنا من أجل {audience} الذين يعرفون ما يريدون ويلاحظون حين يُنجز الأمر بإتقان. و{product} هو الدليل: مميز وواثق ولا يُنسى.',
    },
    mission: {
      en: 'To stand apart for the right reasons, setting a clear, recognisable standard for {audience}.',
      ar: 'أن نتميّز للأسباب الصحيحة، ونضع معيارًا واضحًا ومعروفًا لدى {audience}.',
    },
  },
  expressive: {
    titles: {
      luxury: { en: 'Modern Heirloom', ar: 'إرث معاصر' }, modern: { en: 'Neo Classic', ar: 'كلاسيكية جديدة' }, minimal: { en: 'Quiet Color', ar: 'لون هادئ' },
      bold: { en: 'Street Royal', ar: 'ملكية الشارع' }, playful: { en: 'Candy Studio', ar: 'استوديو الحلوى' }, trust: { en: 'Warm Authority', ar: 'سُلطة دافئة' },
      natural: { en: 'Desert Rose', ar: 'وردة الصحراء' }, innovative: { en: 'Prism Shift', ar: 'تحوّل المنشور' },
    },
    summary: {
      en: 'The unexpected route. It pushes the palette into a triadic scheme and swaps the type for a more characterful pairing, so {name} can lead its category rather than follow it.',
      ar: 'المسار غير المتوقع. يدفع لوحة الألوان نحو مخطط ثلاثي ويستبدل الخطوط بزوج أكثر تميزًا، لتقود {name} فئتها بدلًا من أن تتبعها.',
    },
    story: {
      en: '{name} is what happens when tradition meets a fresh point of view. We took the {noun} you thought you knew and gave it a new voice, made for {audience} who like to be first. Our {product} is where it begins.',
      ar: '{name} هي ما يحدث حين يلتقي الأصيل بوجهة نظر جديدة. أخذنا الصورة المألوفة لأي {noun} ومنحناها صوتًا جديدًا، صُنع من أجل {audience} الذين يحبون أن يكونوا الأوائل. ومن {product} تبدأ الحكاية.',
    },
    mission: {
      en: 'To redefine what a {noun} can be, and give {audience} something genuinely new to love.',
      ar: 'أن نعيد تعريف ما يمكن أن يكون عليه أي {noun}، ونمنح {audience} شيئًا جديدًا حقًا يحبونه.',
    },
  },
};

export const VALUES = {
  luxury: [{ en: 'Craftsmanship', ar: 'الإتقان' }, { en: 'Discretion', ar: 'الرقي' }, { en: 'Heritage', ar: 'الإرث' }, { en: 'Excellence', ar: 'التميّز' }],
  modern: [{ en: 'Clarity', ar: 'الوضوح' }, { en: 'Speed', ar: 'السرعة' }, { en: 'Simplicity', ar: 'البساطة' }, { en: 'Openness', ar: 'الانفتاح' }],
  minimal: [{ en: 'Focus', ar: 'التركيز' }, { en: 'Honesty', ar: 'الصدق' }, { en: 'Balance', ar: 'التوازن' }, { en: 'Calm', ar: 'الهدوء' }],
  bold: [{ en: 'Energy', ar: 'الطاقة' }, { en: 'Courage', ar: 'الجرأة' }, { en: 'Momentum', ar: 'الزخم' }, { en: 'Attitude', ar: 'الحضور' }],
  playful: [{ en: 'Joy', ar: 'البهجة' }, { en: 'Warmth', ar: 'الدفء' }, { en: 'Curiosity', ar: 'الفضول' }, { en: 'Community', ar: 'المجتمع' }],
  trust: [{ en: 'Integrity', ar: 'النزاهة' }, { en: 'Reliability', ar: 'الموثوقية' }, { en: 'Transparency', ar: 'الشفافية' }, { en: 'Care', ar: 'الاهتمام' }],
  natural: [{ en: 'Sustainability', ar: 'الاستدامة' }, { en: 'Authenticity', ar: 'الأصالة' }, { en: 'Care', ar: 'العناية' }, { en: 'Origin', ar: 'المنشأ' }],
  innovative: [{ en: 'Curiosity', ar: 'الفضول' }, { en: 'Progress', ar: 'التقدّم' }, { en: 'Precision', ar: 'الدقة' }, { en: 'Impact', ar: 'الأثر' }],
};

export const VOICE = {
  luxury: { traits: [{ en: 'Assured', ar: 'واثق' }, { en: 'Elegant', ar: 'أنيق' }, { en: 'Understated', ar: 'متحفّظ' }], sample: { en: 'Some things are worth the wait. This is one of them.', ar: 'بعض الأشياء تستحق الانتظار، وهذا واحد منها.' } },
  modern: { traits: [{ en: 'Direct', ar: 'مباشر' }, { en: 'Smart', ar: 'ذكي' }, { en: 'Upbeat', ar: 'متفائل' }], sample: { en: 'Everything you need. Nothing you don’t.', ar: 'كل ما تحتاجه، ولا شيء زائد.' } },
  minimal: { traits: [{ en: 'Calm', ar: 'هادئ' }, { en: 'Precise', ar: 'دقيق' }, { en: 'Gentle', ar: 'لطيف' }], sample: { en: 'Fewer things. Better things.', ar: 'أشياء أقل، أشياء أفضل.' } },
  bold: { traits: [{ en: 'Loud', ar: 'صاخب' }, { en: 'Confident', ar: 'واثق' }, { en: 'Punchy', ar: 'قوي' }], sample: { en: 'Ready? You were born ready.', ar: 'جاهز؟ أنت وُلدت جاهزًا.' } },
  playful: { traits: [{ en: 'Friendly', ar: 'ودود' }, { en: 'Witty', ar: 'ظريف' }, { en: 'Warm', ar: 'دافئ' }], sample: { en: 'Fair warning: you might fall in love.', ar: 'تحذير ودّي: قد تقع في الحب.' } },
  trust: { traits: [{ en: 'Clear', ar: 'واضح' }, { en: 'Reassuring', ar: 'مطمئن' }, { en: 'Expert', ar: 'خبير' }], sample: { en: 'Here’s exactly what happens next.', ar: 'إليك ما سيحدث بالضبط بعد ذلك.' } },
  natural: { traits: [{ en: 'Honest', ar: 'صادق' }, { en: 'Earthy', ar: 'عفوي' }, { en: 'Caring', ar: 'حنون' }], sample: { en: 'Picked at the right time, made the right way.', ar: 'قُطفت في وقتها، وصُنعت كما يجب.' } },
  innovative: { traits: [{ en: 'Visionary', ar: 'رؤيوي' }, { en: 'Sharp', ar: 'حاد' }, { en: 'Optimistic', ar: 'متفائل' }], sample: { en: 'We built the thing we wished existed.', ar: 'بنينا ما تمنّينا أن يكون موجودًا.' } },
};

export const MARK_RATIONALE = {
  'monogram-circle': { en: 'A monogram set in a perfect circle: complete, timeless, and easy to recognise at any size, from a favicon to a storefront.', ar: 'حرف أول داخل دائرة مكتملة: رمز خالد وسهل التمييز بأي حجم، من أيقونة الموقع إلى واجهة المتجر.' },
  'monogram-square': { en: 'A softened square holds the initial, suggesting structure and dependability without feeling rigid.', ar: 'مربع بزوايا ناعمة يحتضن الحرف الأول، يوحي بالبنية والاعتمادية دون أن يبدو جامدًا.' },
  'monogram-split': { en: 'The initial is sliced by a single diagonal, a small tension that signals a fresh, design-led point of view.', ar: 'يقطع الحرفَ الأول خطٌ قطري واحد، توتر بسيط يعبّر عن رؤية جديدة تقودها روح التصميم.' },
  hexagon: { en: 'A hexagon references connection and efficient systems, the shape nature uses when structure matters.', ar: 'الشكل السداسي يرمز للترابط والأنظمة الفعّالة، وهو الشكل الذي تختاره الطبيعة حين تهم البنية.' },
  orbit: { en: 'An orbit around a core: momentum, ecosystem and a product that keeps people coming back.', ar: 'مدار حول نواة: زخم ومنظومة متكاملة ومنتج يعود إليه الناس دائمًا.' },
  petals: { en: 'Four soft petals form a bloom, care and growth expressed through a balanced, symmetrical mark.', ar: 'أربع بتلات ناعمة تشكّل زهرة، تعبّر عن العناية والنمو بعلامة متوازنة ومتناظرة.' },
  spark: { en: 'A four-point spark: the moment of brilliance, a cue for quality and a touch of magic.', ar: 'وميض رباعي الأطراف: لحظة التألق، وإشارة إلى الجودة ولمسة من السحر.' },
  pillars: { en: 'Three ascending pillars describe steady growth and solid foundations.', ar: 'ثلاثة أعمدة متصاعدة تعبّر عن النمو الثابت والأسس الراسخة.' },
  wave: { en: 'Layered waves bring rhythm and flow, a calm, continuous motion.', ar: 'أمواج متتالية تمنح الإيقاع والانسياب، حركة هادئة ومستمرة.' },
  arch: { en: 'The arch, a doorway found across Arabic and classical architecture, frames the brand as a place of welcome and permanence.', ar: 'القوس، المدخل الحاضر في العمارة العربية والكلاسيكية، يقدّم العلامة كمكان للترحيب والديمومة.' },
  diamond: { en: 'A faceted diamond speaks of value, clarity and precision cutting.', ar: 'ماسة متعددة الأوجه تعبّر عن القيمة والصفاء ودقة القطع.' },
  bloom: { en: 'Radiating rounded rays: warmth, generosity and an open invitation.', ar: 'أشعة دائرية مشعّة: دفء وكرم ودعوة مفتوحة.' },
  crescent: { en: 'A crescent embracing a star draws on regional night skies: guidance, beauty and a sense of occasion.', ar: 'هلال يحتضن نجمة مستوحى من سماء المنطقة ليلًا: هداية وجمال وإحساس بالمناسبة.' },
  bean: { en: 'A stylised bean with a single flowing line: origin, craft and the ritual of the first cup.', ar: 'حبة مُبسّطة بخط انسيابي واحد: المنشأ والحِرفة وطقس الفنجان الأول.' },
  shield: { en: 'A shield with an inner check conveys protection and a promise kept.', ar: 'درع بعلامة داخلية يعبّر عن الحماية والوعد الذي يُحفظ.' },
  star8: { en: 'An eight-point star from Islamic geometry: balance, craft and a heritage that feels at home across the region.', ar: 'نجمة ثمانية مستوحاة من الهندسة الإسلامية: توازن وحِرفة وإرث مألوف في المنطقة كلها.' },
  crown: { en: 'A crown with three jewelled points: leadership, prestige and a promise of the best.', ar: 'تاج بثلاث نقاط مرصّعة: ريادة ومكانة ووعد بالأفضل.' },
  leaf: { en: 'A single leaf with clear veins: growth, freshness and ingredients you can trust.', ar: 'ورقة واحدة بعروق واضحة: نمو ونضارة ومكونات تثق بها.' },
  drop: { en: 'A clean drop: purity, care and the essence of the product.', ar: 'قطرة صافية: نقاء وعناية وجوهر المنتج.' },
  flame: { en: 'A flame with a bright core: passion, energy and warmth.', ar: 'لهب بقلب مضيء: شغف وطاقة ودفء.' },
  mountain: { en: 'A peak under a rising sun: ambition, endurance and the view from the top.', ar: 'قمة تحت شمس مشرقة: طموح وصمود والإطلالة من الأعلى.' },
  sunrise: { en: 'A sun on the horizon: a fresh start every day and optimism you can see.', ar: 'شمس على الأفق: بداية جديدة كل يوم وتفاؤل يُرى.' },
  infinity: { en: 'An unbroken loop: continuity, loyalty and service without limits.', ar: 'حلقة لا تنقطع: استمرارية وولاء وخدمة بلا حدود.' },
  chevrons: { en: 'Three rising chevrons: progress, speed and a clear direction upward.', ar: 'ثلاثة أسهم متصاعدة: تقدّم وسرعة واتجاه واضح نحو الأعلى.' },
  mosaic: { en: 'Four tiles in a grid, one in a new color: a system with room for something unexpected.', ar: 'أربع قطع في شبكة واحدة منها بلون مختلف: نظام يترك مساحة للمفاجأة.' },
  halves: { en: 'Two offset halves form one whole: partnership, dialogue and balance.', ar: 'نصفان متقابلان يكوّنان دائرة واحدة: شراكة وحوار وتوازن.' },
  prism: { en: 'A two-tone pyramid: structure, clarity and light split into new ideas.', ar: 'هرم بلونين: بنية ووضوح وضوء ينكسر إلى أفكار جديدة.' },
  cube: { en: 'An isometric cube: building blocks, product thinking and depth.', ar: 'مكعب ثلاثي الأبعاد: لبنات البناء والتفكير في المنتج والعمق.' },
  lotus: { en: 'A lotus in bloom: calm, renewal and beauty that rises from within.', ar: 'زهرة لوتس متفتحة: سكينة وتجدد وجمال ينبع من الداخل.' },
  bubble: { en: 'A speech bubble holding the initial: conversation, community and a brand that listens.', ar: 'فقاعة حوار تحتضن الحرف الأول: تواصل ومجتمع وعلامة تُصغي.' },
  seal: { en: 'A stamped seal around the initial: quality you can certify and a mark of approval.', ar: 'ختم حول الحرف الأول: جودة موثّقة وعلامة اعتماد.' },
  heart: { en: 'A heart with a soft highlight: care, warmth and a brand people love.', ar: 'قلب بلمسة ضوء ناعمة: عناية ودفء وعلامة يحبها الناس.' },
  bolt: { en: 'A lightning bolt: speed, energy and instant results.', ar: 'صاعقة برق: سرعة وطاقة ونتائج فورية.' },
  anchor: { en: 'An anchor: stability, trust and a brand that stays steady in any weather.', ar: 'مرساة: ثبات وثقة وعلامة لا تتزعزع مهما تغيّرت الظروف.' },
  compass: { en: 'A compass needle pointing north: guidance, expertise and a clear direction.', ar: 'بوصلة تشير إلى الشمال: إرشاد وخبرة واتجاه واضح.' },
  feather: { en: 'A feather quill: lightness, elegance and the art of writing.', ar: 'ريشة كتابة: خفة وأناقة وفن الكتابة.' },
  palm: { en: 'A palm tree with dates: generosity, roots in the Gulf and hospitality.', ar: 'نخلة بثمر التمر: كرم وجذور خليجية وضيافة.' },
  knot: { en: 'Two linked rings: partnership, connection and a bond that holds.', ar: 'حلقتان متشابكتان: شراكة وتواصل ورابط متين.' },
  cup: { en: 'A steaming cup: the daily ritual, comfort and a warm welcome.', ar: 'فنجان يتصاعد منه البخار: طقس يومي وراحة وترحيب دافئ.' },
  house: { en: 'A house with an arched door: home, belonging and a place to arrive.', ar: 'بيت بباب مقوّس: الدار والانتماء ومكان للوصول.' },
};

export const SOCIAL = {
  en: {
    launch: { kicker: 'Now open', headline: 'Meet {name}', sub: 'A new {noun} for {audience}.', cta: 'Visit us today' },
    product: { kicker: 'Introducing', headline: 'Our {product}', sub: 'Limited launch offer: 20% off this week.', cta: 'Shop now' },
    quote: { headline: '“{taglineBare}”', sub: '— {name}' },
    arrival: { kicker: 'Just dropped', headline: 'The {product} is here', cta: 'Swipe up' },
    poll: { kicker: 'Tell us', headline: 'What should we make next?', a: 'More flavours', b: 'New sizes' },
    captions: [
      'Say hello to {name}. We’ve been building this for a long time and can’t wait for you to see it. Doors are open.',
      'Our {product} is finally here. Made in small batches, with every detail checked by hand. Launch pricing ends Sunday.',
      '{tagline} That’s the promise behind everything we make.',
    ],
  },
  ar: {
    launch: { kicker: 'افتتاح', headline: 'تعرّف على {name}', sub: '{noun} جديد من أجل {audience}.', cta: 'زورونا اليوم' },
    product: { kicker: 'نقدّم لكم', headline: '{product}', sub: 'عرض الإطلاق: خصم ٢٠٪ هذا الأسبوع.', cta: 'تسوّق الآن' },
    quote: { headline: '«{taglineBare}»', sub: '— {name}' },
    arrival: { kicker: 'وصل حديثًا', headline: '{product} وصل', cta: 'اسحب للأعلى' },
    poll: { kicker: 'شاركونا', headline: 'ماذا نصنع بعد ذلك؟', a: 'نكهات أكثر', b: 'أحجام جديدة' },
    captions: [
      'رحّبوا بـ{name}. عملنا على هذا طويلًا ولا نطيق صبرًا لتروه. أبوابنا مفتوحة.',
      '{product} وصل أخيرًا. نصنعه بكميات صغيرة ونراجع كل تفصيل يدويًا. أسعار الإطلاق تنتهي الأحد.',
      '{tagline} هذا هو الوعد وراء كل ما نصنعه.',
    ],
  },
};

export const CARD_PEOPLE = {
  en: [{ name: 'Layla Haddad', title: 'Founder & Creative Director' }, { name: 'Omar Nasser', title: 'Managing Partner' }, { name: 'Sara Al‑Mansouri', title: 'Head of Brand' }],
  ar: [{ name: 'ليلى حداد', title: 'المؤسسة والمديرة الإبداعية' }, { name: 'عمر ناصر', title: 'الشريك الإداري' }, { name: 'سارة المنصوري', title: 'مديرة العلامة التجارية' }],
};

// Extra post templates, built at render time so every project gets them.
export const SOCIAL_EXTRA = {
  en: {
    testimonial: { kicker: 'Customer review', headline: '“Exactly what I was looking for. Now I tell everyone about {name}.”', author: 'Reem A., Dubai', caption: 'Nothing makes our day like a review like this. Thank you, Reem.' },
    sale: { kicker: 'This weekend only', big: '30%', headline: 'off our {product}', cta: 'Shop the sale', caption: 'Our biggest offer of the season: 30% off our {product}, Friday to Sunday.' },
    tips: { kicker: 'Good to know', headline: '3 ways to get more from {name}', items: ['Start with our {product}', 'Follow us for early access', 'Bring a friend, save 10%'], caption: 'Three small ways to get more from every visit. Save this for later.' },
  },
  ar: {
    testimonial: { kicker: 'رأي عميل', headline: '«بالضبط ما كنت أبحث عنه. صرت أحدّث الجميع عن {name}.»', author: 'ريم ع.، دبي', caption: 'لا شيء يسعدنا مثل تقييم كهذا. شكرًا يا ريم.' },
    sale: { kicker: 'نهاية هذا الأسبوع فقط', big: '٣٠٪', headline: 'خصم على {product}', cta: 'تسوّق العروض', caption: 'أكبر عروض الموسم: خصم ٣٠٪ على {product} من الجمعة إلى الأحد.' },
    tips: { kicker: 'نصيحة', headline: '٣ طرق لتستفيد أكثر من {name}', items: ['ابدأ بـ{product}', 'تابعنا لتصلك العروض أولًا', 'أحضر صديقًا ووفّر ١٠٪'], caption: 'ثلاث طرق بسيطة لتستفيد أكثر في كل زيارة. احفظ المنشور لوقت لاحق.' },
  },
};
