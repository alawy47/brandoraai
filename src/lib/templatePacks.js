// Template packs by business category: which templates suit each kind of brand, with starter copy written for that trade.
// `items` lines are "label | value" for menus, tables and stats; plain lines elsewhere. All text is editable in the studio.
const T = (en, ar) => ({ en, ar });

export const PACKS = {
  coffee: {
    dish: T({ kicker: 'Drink of the day', headline: 'Cardamom flat white', sub: 'Single-origin espresso, steamed milk and a pinch of cardamom.', big: '18', cta: 'Order at the bar' }, { kicker: 'مشروب اليوم', headline: 'فلات وايت بالهيل', sub: 'إسبريسو من مصدر واحد مع حليب مبخّر ولمسة هيل.', big: '١٨', cta: 'اطلبه الآن' }),
    loyalty: T({ kicker: 'Loyalty card', headline: 'Every 10th cup is on us', sub: 'Get a stamp with every drink.' }, { kicker: 'بطاقة الولاء', headline: 'الكوب العاشر علينا', sub: 'اجمع ختمًا مع كل مشروب.' }),
    hours: T({ kicker: 'Visit us', headline: 'Opening hours', items: 'Sat – Thu | 7 am – 11 pm\nFriday | 2 pm – 11 pm\nHolidays | 9 am – 9 pm', sub: 'Walk-ins welcome, no booking needed.' }, { kicker: 'زورونا', headline: 'ساعات العمل', items: 'السبت – الخميس | ٧ ص – ١١ م\nالجمعة | ٢ م – ١١ م\nالأعياد | ٩ ص – ٩ م', sub: 'أهلًا بكم دون حجز.' }),
    menu: T({ kicker: 'Coffee bar', headline: 'Our brews', items: 'Espresso | 10\nFlat white | 16\nV60 pour-over | 20\nIced spanish latte | 22' }, { kicker: 'ركن القهوة', headline: 'مشروباتنا', items: 'إسبريسو | ١٠\nفلات وايت | ١٦\nV60 مقطّرة | ٢٠\nلاتيه إسباني مثلج | ٢٢' }),
    giveaway: T({ kicker: 'Win', headline: 'A month of coffee', sub: 'Three ways to enter', items: 'Follow our page\nTag a coffee friend\nShare this post', cta: 'Ends Friday' }, { kicker: 'اربح', headline: 'قهوة لمدة شهر', sub: 'ثلاث خطوات للمشاركة', items: 'تابع صفحتنا\nاذكر صديقًا يحب القهوة\nشارك المنشور', cta: 'تنتهي الجمعة' }),
  },
  restaurant: {
    dish: T({ kicker: "Chef's special", headline: 'Slow-cooked lamb', sub: 'Saffron rice, roasted almonds and a pomegranate glaze.', big: '58', cta: 'Available tonight' }, { kicker: 'طبق الشيف', headline: 'لحم مطهو ببطء', sub: 'أرز بالزعفران ولوز محمّص وصلصة الرمان.', big: '٥٨', cta: 'متوفر الليلة' }),
    reserve: T({ kicker: 'Book a table', headline: 'Reserve your evening', sub: 'We will hold your table for 15 minutes.', items: 'Date | Fri 12 Dec\nTime | 8:00 PM\nGuests | 2 – 6\nCall | +971 50 123 4567', cta: 'Reserve now' }, { kicker: 'احجز طاولة', headline: 'احجز أمسيتك', sub: 'نحتفظ بطاولتك لمدة ١٥ دقيقة.', items: 'التاريخ | الجمعة ١٢ ديسمبر\nالوقت | ٨:٠٠ م\nالضيوف | ٢ – ٦\nاتصل | ‎+971 50 123 4567', cta: 'احجز الآن' }),
    delivery: T({ kicker: 'Delivery', headline: 'Free delivery', sub: 'On orders over 80. Hot, fast and on time.', items: '30 minutes\nHot meals\nOrder in the app', cta: 'Order now' }, { kicker: 'التوصيل', headline: 'توصيل مجاني', sub: 'للطلبات فوق ٨٠. ساخن وسريع وفي موعده.', items: '٣٠ دقيقة\nوجبات ساخنة\nاطلب من التطبيق', cta: 'اطلب الآن' }),
    menuprint: T({ kicker: 'Menu', headline: 'Food & drink', items: 'Starters\nHouse salad | 14\nSoup of the day | 12\nMains\nGrilled catch | 38\nSlow-cooked lamb | 46\nDesserts\nDate pudding | 16\nSeasonal fruit | 14' }, { kicker: 'القائمة', headline: 'الطعام والشراب', items: 'المقبلات\nسلطة البيت | ١٤\nشوربة اليوم | ١٢\nالأطباق الرئيسية\nسمك مشوي | ٣٨\nلحم مطهو ببطء | ٤٦\nالحلويات\nبودينغ التمر | ١٦\nفاكهة الموسم | ١٤' }),
    hours: T({ kicker: 'Visit us', headline: 'Kitchen hours', items: 'Lunch | 12 pm – 4 pm\nDinner | 6 pm – 11 pm\nFriday brunch | 11 am – 3 pm', sub: 'Last orders 30 minutes before closing.' }, { kicker: 'زورونا', headline: 'ساعات المطبخ', items: 'الغداء | ١٢ ظ – ٤ م\nالعشاء | ٦ م – ١١ م\nبرنش الجمعة | ١١ ص – ٣ م', sub: 'آخر طلب قبل الإغلاق بنصف ساعة.' }),
    loyalty: T({ kicker: 'Dining card', headline: 'Your 10th meal is on us', sub: 'Show this card when you pay.' }, { kicker: 'بطاقة الولاء', headline: 'وجبتك العاشرة علينا', sub: 'أبرز البطاقة عند الدفع.' }),
  },
  fashion: {
    lookbook: T({ kicker: 'Collection 04', headline: 'Autumn edit', sub: 'Soft tailoring in earth tones.', cta: 'Shop the collection' }, { kicker: 'المجموعة ٠٤', headline: 'إطلالة الخريف', sub: 'قصّات ناعمة بألوان الأرض.', cta: 'تسوّقي المجموعة' }),
    saleBanner: T({ kicker: 'Season sale', big: '40%', headline: 'Off selected pieces', sub: 'This week only, in store and online.', cta: 'Shop the sale' }, { kicker: 'تخفيضات الموسم', big: '٤٠٪', headline: 'على قطع مختارة', sub: 'هذا الأسبوع فقط، في المتجر وعبر الإنترنت.', cta: 'تسوّقي التخفيضات' }),
    hangtag: T({ kicker: 'Autumn 24', headline: 'Wool coat', sub: 'Colour: sand', items: 'Size M\n100% merino wool', big: '620' }, { kicker: 'خريف ٢٤', headline: 'معطف صوف', sub: 'اللون: رملي', items: 'المقاس M\nصوف ميرينو ١٠٠٪', big: '٦٢٠' }),
    showcase: T({ kicker: 'New arrival', headline: 'The signature bag', sub: 'Hand-stitched leather, made in small batches.', big: '480', cta: 'Discover' }, { kicker: 'وصل حديثًا', headline: 'الحقيبة الأيقونية', sub: 'جلد مخيّط يدويًا بدفعات صغيرة.', big: '٤٨٠', cta: 'اكتشفي' }),
    countdown: T({ kicker: 'New drop in', big: '03', headline: 'days', cta: 'Set a reminder' }, { kicker: 'إطلاق جديد بعد', big: '٠٣', headline: 'أيام', cta: 'فعّلي التذكير' }),
  },
  beauty: {
    showcase: T({ kicker: 'Best seller', headline: 'Glow serum', sub: 'Vitamin C and hyaluronic acid for visible radiance.', big: '145', cta: 'Shop now' }, { kicker: 'الأكثر مبيعًا', headline: 'سيروم النضارة', sub: 'فيتامين سي وحمض الهيالورونيك لإشراقة ظاهرة.', big: '١٤٥', cta: 'تسوّقي الآن' }),
    ingredients: T({ kicker: 'What is inside', headline: 'Three ingredients that work', sub: 'Gentle on skin, clear on results.', items: 'Vitamin C | Brightens dull skin\nHyaluronic acid | Holds moisture\nNiacinamide | Smooths texture' }, { kicker: 'ماذا بداخله', headline: 'ثلاثة مكوّنات فعّالة', sub: 'لطيف على البشرة وواضح في نتائجه.', items: 'فيتامين سي | يفتّح البشرة الباهتة\nحمض الهيالورونيك | يحبس الرطوبة\nالنياسيناميد | يُنعّم الملمس' }),
    loyalty: T({ kicker: 'Beauty card', headline: 'Your 10th treatment is on us', sub: 'Collect a stamp with each visit.' }, { kicker: 'بطاقة الجمال', headline: 'جلستك العاشرة علينا', sub: 'اجمعي ختمًا مع كل زيارة.' }),
    saleBanner: T({ kicker: 'Limited time', big: '25%', headline: 'Off your first order', sub: 'Use the code at checkout.', cta: 'Claim offer' }, { kicker: 'لفترة محدودة', big: '٢٥٪', headline: 'على طلبك الأول', sub: 'استخدمي الكود عند الدفع.', cta: 'احصلي على العرض' }),
    hangtag: T({ kicker: 'Skin care', headline: 'Glow serum', sub: '30 ml · Vegan', items: 'Apply morning and night\nPatch test first', big: '145' }, { kicker: 'العناية بالبشرة', headline: 'سيروم النضارة', sub: '٣٠ مل · نباتي', items: 'يُستخدم صباحًا ومساءً\nجرّبيه على منطقة صغيرة أولًا', big: '١٤٥' }),
  },
  perfume: {
    lookbook: T({ kicker: 'Oud edition', headline: 'Night of oud', sub: 'Warm, resinous and unhurried.', cta: 'Discover the scent' }, { kicker: 'إصدار العود', headline: 'ليلة العود', sub: 'دافئ وراتنجي ولا يستعجل.', cta: 'اكتشف العطر' }),
    ingredients: T({ kicker: 'Scent notes', headline: 'The pyramid', sub: 'From the first spray to the last hour.', items: 'Top | Saffron and bergamot\nHeart | Rose and oud\nBase | Amber and musk' }, { kicker: 'مكوّنات العطر', headline: 'هرم العطر', sub: 'من أول رشّة إلى آخر ساعة.', items: 'القمة | زعفران وبرغموت\nالقلب | ورد وعود\nالقاعدة | عنبر ومسك' }),
    showcase: T({ kicker: 'New edition', headline: 'Oud Royale', sub: 'Eau de parfum · 50 ml', big: '520', cta: 'Shop now' }, { kicker: 'إصدار جديد', headline: 'عود رويال', sub: 'ماء عطر · ٥٠ مل', big: '٥٢٠', cta: 'تسوّق الآن' }),
    hangtag: T({ kicker: 'Eau de parfum', headline: 'Oud Royale', sub: '50 ml', items: 'Spray on pulse points\nKeep away from heat', big: '520' }, { kicker: 'ماء عطر', headline: 'عود رويال', sub: '٥٠ مل', items: 'يُرشّ على مواضع النبض\nيُحفظ بعيدًا عن الحرارة', big: '٥٢٠' }),
    countdown: T({ kicker: 'Launching in', big: '03', headline: 'days', cta: 'Be the first to know' }, { kicker: 'الإطلاق بعد', big: '٠٣', headline: 'أيام', cta: 'كن أول من يعلم' }),
  },
  jewelry: {
    showcase: T({ kicker: 'New piece', headline: 'Solitaire ring', sub: '18k gold with a conflict-free stone.', big: '2,900', cta: 'View the piece' }, { kicker: 'قطعة جديدة', headline: 'خاتم سوليتير', sub: 'ذهب عيار ١٨ مع حجر معتمد.', big: '٢٬٩٠٠', cta: 'شاهدي القطعة' }),
    lookbook: T({ kicker: 'Bridal edit', headline: 'Forever, set in gold', sub: 'Pieces made for the day and every day after.', cta: 'Book a viewing' }, { kicker: 'إطلالة العروس', headline: 'للأبد، مرصّع بالذهب', sub: 'قطع صُنعت ليوم الزفاف وكل يوم بعده.', cta: 'احجزي موعد معاينة' }),
    hangtag: T({ kicker: '18k gold', headline: 'Solitaire ring', sub: 'Size 7', items: 'Certified stone\nLifetime polish', big: '2,900' }, { kicker: 'ذهب ١٨', headline: 'خاتم سوليتير', sub: 'المقاس ٧', items: 'حجر معتمد\nتلميع مدى الحياة', big: '٢٬٩٠٠' }),
    saleBanner: T({ kicker: 'Private sale', big: '15%', headline: 'On bridal sets', sub: 'By appointment, until the end of the month.', cta: 'Book now' }, { kicker: 'عرض خاص', big: '١٥٪', headline: 'على أطقم العروس', sub: 'بموعد مسبق حتى نهاية الشهر.', cta: 'احجزي الآن' }),
    giveaway: T({ kicker: 'Giveaway', headline: 'Win a pair of earrings', sub: 'Three ways to enter', items: 'Follow our page\nTag someone who loves gold\nShare this post', cta: 'Ends Sunday' }, { kicker: 'مسابقة', headline: 'اربحي حلقًا', sub: 'ثلاث خطوات للمشاركة', items: 'تابعي صفحتنا\nاذكري من تحب الذهب\nشاركي المنشور', cta: 'تنتهي الأحد' }),
  },
  tech: {
    appui: T({ kicker: 'Now available', headline: 'Meet the new app', sub: 'Everything your team needs, in one calm place.', cta: 'Get started' }, { kicker: 'متوفر الآن', headline: 'تعرّف على التطبيق الجديد', sub: 'كل ما يحتاجه فريقك في مكان واحد هادئ.', cta: 'ابدأ الآن' }),
    changelog: T({ kicker: "What's new", big: 'v2.4', headline: 'Release notes', items: 'Faster dashboards\nShared workspaces\nDark mode\nImproved search' }, { kicker: 'الجديد', big: 'v2.4', headline: 'ملاحظات الإصدار', items: 'لوحات أسرع\nمساحات عمل مشتركة\nالوضع الداكن\nبحث محسّن' }),
    trio: T({ kicker: 'By the numbers', headline: 'Trusted by growing teams', items: '12k | Active teams\n99.9% | Uptime\n4.8 | Average rating' }, { kicker: 'بالأرقام', headline: 'يثق بنا فرق تنمو', items: '١٢ ألف | فريق نشط\n٩٩٫٩٪ | وقت التشغيل\n٤٫٨ | متوسط التقييم' }),
    event: T({ kicker: 'Webinar · 12 DEC · 5 PM', headline: 'Ship faster with fewer tools', sub: 'A 45-minute live session with Q&A.', cta: 'Save your seat' }, { kicker: 'ندوة · ١٢ ديسمبر · ٥ م', headline: 'أنجز أسرع بأدوات أقل', sub: 'جلسة مباشرة مدتها ٤٥ دقيقة مع أسئلة وأجوبة.', cta: 'احجز مقعدك' }),
    hiring: T({ kicker: "We're hiring", headline: 'Senior engineer', sub: 'Build the product used by thousands of teams.', items: 'TypeScript and Node\nProduct sense\nRemote friendly', cta: 'Apply today' }, { kicker: 'نبحث عنك', headline: 'مهندس برمجيات أول', sub: 'ابنِ منتجًا يستخدمه آلاف الفرق.', items: 'خبرة TypeScript وNode\nحس منتجي\nالعمل عن بُعد متاح', cta: 'قدّم الآن' }),
  },
  wellness: {
    ingredients: T({ kicker: 'Daily ritual', headline: 'Three habits to feel better', sub: 'Small steps, repeated gently.', items: 'Breathe | Five minutes each morning\nMove | A slow walk after lunch\nRest | Lights out by ten' }, { kicker: 'روتين يومي', headline: 'ثلاث عادات لتشعر بتحسّن', sub: 'خطوات صغيرة تتكرر بلطف.', items: 'تنفّس | خمس دقائق كل صباح\nتحرّك | مشي هادئ بعد الغداء\nارتح | إطفاء الأنوار عند العاشرة' }),
    workout: T({ kicker: 'Class timetable', headline: 'This week at the studio', items: 'Mon | 7:00 · Gentle yoga\nTue | 18:30 · Breathwork\nWed | 7:00 · Pilates\nThu | 19:00 · Sound bath\nSat | 9:00 · Family flow', cta: 'Book your spot' }, { kicker: 'جدول الحصص', headline: 'هذا الأسبوع في المركز', items: 'الإثنين | ٧:٠٠ · يوغا هادئة\nالثلاثاء | ٦:٣٠ م · تنفّس\nالأربعاء | ٧:٠٠ · بيلاتس\nالخميس | ٧:٠٠ م · جلسة صوتية\nالسبت | ٩:٠٠ · تدفّق عائلي', cta: 'احجز مكانك' }),
    hours: T({ kicker: 'Visit us', headline: 'Studio hours', items: 'Sun – Thu | 7 am – 9 pm\nFriday | 2 pm – 8 pm\nSaturday | 8 am – 6 pm', sub: 'Please arrive ten minutes early.' }, { kicker: 'زورونا', headline: 'ساعات المركز', items: 'الأحد – الخميس | ٧ ص – ٩ م\nالجمعة | ٢ م – ٨ م\nالسبت | ٨ ص – ٦ م', sub: 'يُرجى الحضور قبل عشر دقائق.' }),
    giveaway: T({ kicker: 'Giveaway', headline: 'Win a wellness day', sub: 'Three ways to enter', items: 'Follow our page\nTag someone who needs rest\nShare this post', cta: 'Ends Friday' }, { kicker: 'مسابقة', headline: 'اربح يوم عافية', sub: 'ثلاث خطوات للمشاركة', items: 'تابع صفحتنا\nاذكر من يحتاج راحة\nشارك المنشور', cta: 'تنتهي الجمعة' }),
    loyalty: T({ kicker: 'Wellness card', headline: 'Your 10th session is on us', sub: 'Collect a stamp each visit.' }, { kicker: 'بطاقة العافية', headline: 'جلستك العاشرة علينا', sub: 'اجمع ختمًا مع كل زيارة.' }),
  },
  fitness: {
    workout: T({ kicker: 'Weekly timetable', headline: 'Train with us', items: 'Mon | 6:00 · Strength\nTue | 18:00 · HIIT\nWed | 6:00 · Mobility\nThu | 19:00 · Boxing\nSat | 8:00 · Team run', cta: 'Book a free class' }, { kicker: 'الجدول الأسبوعي', headline: 'تمرّن معنا', items: 'الإثنين | ٦:٠٠ · قوة\nالثلاثاء | ٦:٠٠ م · هيت\nالأربعاء | ٦:٠٠ · مرونة\nالخميس | ٧:٠٠ م · ملاكمة\nالسبت | ٨:٠٠ · جري جماعي', cta: 'احجز حصة مجانية' }),
    saleBanner: T({ kicker: 'Membership', big: '30%', headline: 'Off the first 3 months', sub: 'Join before the end of the month.', cta: 'Join today' }, { kicker: 'العضوية', big: '٣٠٪', headline: 'على أول ٣ أشهر', sub: 'انضم قبل نهاية الشهر.', cta: 'انضم اليوم' }),
    trio: T({ kicker: 'Our community', headline: 'Strong together', items: '1,200 | Active members\n40 | Weekly classes\n6 | Certified coaches' }, { kicker: 'مجتمعنا', headline: 'أقوى معًا', items: '١٬٢٠٠ | عضو نشط\n٤٠ | حصة أسبوعيًا\n٦ | مدربين معتمدين' }),
    countdown: T({ kicker: 'Challenge starts in', big: '03', headline: 'days', cta: 'Join the challenge' }, { kicker: 'التحدي يبدأ بعد', big: '٠٣', headline: 'أيام', cta: 'انضم للتحدي' }),
    event: T({ kicker: 'Sat 12 DEC · 8 AM', headline: 'Community run', sub: '5 km, all levels, coffee after.', cta: 'Register free' }, { kicker: 'السبت ١٢ ديسمبر · ٨ ص', headline: 'جري المجتمع', sub: '٥ كم لكل المستويات، والقهوة بعدها.', cta: 'سجّل مجانًا' }),
  },
  realestate: {
    listing: T({ kicker: 'For sale', headline: 'Marina view residence', sub: 'Dubai Marina · Ready to move in', items: '3 | Bedrooms\n3 | Bathrooms\n185 | Sq. m', big: 'AED 2.4M', cta: 'Book a viewing' }, { kicker: 'للبيع', headline: 'شقة بإطلالة المارينا', sub: 'دبي مارينا · جاهزة للسكن', items: '٣ | غرف نوم\n٣ | حمّامات\n١٨٥ | م²', big: '٢٫٤ مليون د.إ', cta: 'احجز معاينة' }),
    trio: T({ kicker: 'Why invest', headline: 'A neighbourhood on the rise', items: '8% | Average yield\n12 min | To the metro\n96% | Occupancy' }, { kicker: 'لماذا الاستثمار', headline: 'حيّ في صعود', items: '٨٪ | متوسط العائد\n١٢ دقيقة | إلى المترو\n٩٦٪ | نسبة الإشغال' }),
    event: T({ kicker: 'Open house · Sat 12 DEC', headline: 'Walk through your next home', sub: '10 am – 4 pm. Refreshments served.', cta: 'Register to attend' }, { kicker: 'بيت مفتوح · السبت ١٢ ديسمبر', headline: 'تجوّل في بيتك القادم', sub: '١٠ ص – ٤ م مع ضيافة.', cta: 'سجّل حضورك' }),
    flyer: T({ kicker: 'New launch', headline: 'Residences from 1.2M', sub: 'Register your interest today.', items: 'Studios to 3 bedrooms\nPayment plan available\nHandover next year', cta: 'Call our sales team' }, { kicker: 'إطلاق جديد', headline: 'مساكن من ١٫٢ مليون', sub: 'سجّل اهتمامك اليوم.', items: 'استوديو حتى ٣ غرف\nخطة دفع متاحة\nالتسليم العام القادم', cta: 'اتصل بفريق المبيعات' }),
    hours: T({ kicker: 'Sales gallery', headline: 'Visit our showroom', items: 'Sun – Thu | 9 am – 7 pm\nFriday | Closed\nSaturday | 10 am – 4 pm', sub: 'Private tours by appointment.' }, { kicker: 'صالة المبيعات', headline: 'زوروا معرضنا', items: 'الأحد – الخميس | ٩ ص – ٧ م\nالجمعة | مغلق\nالسبت | ١٠ ص – ٤ م', sub: 'جولات خاصة بموعد مسبق.' }),
  },
  finance: {
    trio: T({ kicker: 'Why us', headline: 'Money, made clear', items: '0 | Hidden fees\n24/7 | Support\n3 min | To open an account' }, { kicker: 'لماذا نحن', headline: 'المال بوضوح', items: '٠ | رسوم خفية\n٢٤/٧ | دعم\n٣ دقائق | لفتح حساب' }),
    appui: T({ kicker: 'Now live', headline: 'Your money, in one app', sub: 'Save, send and track spending without the paperwork.', cta: 'Open an account' }, { kicker: 'متاح الآن', headline: 'أموالك في تطبيق واحد', sub: 'ادّخر وحوّل وتابع إنفاقك بلا أوراق.', cta: 'افتح حسابًا' }),
    event: T({ kicker: 'Workshop · 12 DEC · 6 PM', headline: 'Plan your first investment', sub: 'A practical hour for beginners.', cta: 'Reserve a seat' }, { kicker: 'ورشة · ١٢ ديسمبر · ٦ م', headline: 'خطّط لأول استثمار', sub: 'ساعة عملية للمبتدئين.', cta: 'احجز مقعدك' }),
    certificate: T({ kicker: 'Certificate of completion', headline: 'Layla Haddad', sub: 'has completed the Financial Planning programme with distinction.', cta: 'Issued on 12 December' }, { kicker: 'شهادة إتمام', headline: 'ليلى حداد', sub: 'أتمّت برنامج التخطيط المالي بتميّز.', cta: 'صدرت في ١٢ ديسمبر' }),
    hiring: T({ kicker: "We're hiring", headline: 'Risk analyst', sub: 'Help keep customers money safe.', items: 'Three years in risk\nStrong analytics\nBilingual is a plus', cta: 'Apply today' }, { kicker: 'نبحث عنك', headline: 'محلل مخاطر', sub: 'ساهم في حماية أموال العملاء.', items: 'ثلاث سنوات في المخاطر\nتحليل قوي\nإتقان اللغتين ميزة', cta: 'قدّم الآن' }),
  },
  education: {
    course: T({ kicker: 'New course', headline: 'Design thinking basics', sub: 'Learn a practical method to solve problems and present ideas clearly.', items: 'Level | Beginner\nDuration | 6 weeks\nFormat | Online', cta: 'Enrol now' }, { kicker: 'دورة جديدة', headline: 'أساسيات التفكير التصميمي', sub: 'تعلّم أسلوبًا عمليًا لحل المشكلات وعرض الأفكار بوضوح.', items: 'المستوى | مبتدئ\nالمدة | ٦ أسابيع\nالنمط | عن بُعد', cta: 'سجّل الآن' }),
    certificate: T({ kicker: 'Certificate of completion', headline: 'Layla Haddad', sub: 'has successfully completed the course and met all requirements.', cta: 'Awarded on 12 December' }, { kicker: 'شهادة إتمام', headline: 'ليلى حداد', sub: 'أتمّت الدورة بنجاح واستوفت جميع المتطلبات.', cta: 'مُنحت بتاريخ ١٢ ديسمبر' }),
    event: T({ kicker: 'Open day · 12 DEC · 10 AM', headline: 'Meet our teachers', sub: 'Tour the campus and try a class.', cta: 'Register to attend' }, { kicker: 'يوم مفتوح · ١٢ ديسمبر · ١٠ ص', headline: 'التقِ بمعلمينا', sub: 'جولة في المكان وتجربة حصة.', cta: 'سجّل حضورك' }),
    trio: T({ kicker: 'Our impact', headline: 'Learning that lasts', items: '5,000 | Graduates\n92% | Completion rate\n40 | Expert teachers' }, { kicker: 'أثرنا', headline: 'تعلّم يدوم', items: '٥٬٠٠٠ | خريج\n٩٢٪ | نسبة الإتمام\n٤٠ | معلم خبير' }),
    hiring: T({ kicker: "We're hiring", headline: 'Lead instructor', sub: 'Teach small groups and shape the curriculum.', items: 'Five years of practice\nClear communicator\nArabic and English', cta: 'Apply today' }, { kicker: 'نبحث عنك', headline: 'مدرّب رئيسي', sub: 'درّس مجموعات صغيرة وشارك في بناء المنهج.', items: 'خبرة خمس سنوات\nمهارة في التواصل\nالعربية والإنجليزية', cta: 'قدّم الآن' }),
  },
  travel: {
    itinerary: T({ kicker: '4 days · Oman', headline: 'Mountains and coast', items: 'Day 1 | Arrival and old town walk\nDay 2 | Wadi hike and picnic\nDay 3 | Dhow cruise at sunset\nDay 4 | Souq and departure', cta: 'Request this trip' }, { kicker: '٤ أيام · عُمان', headline: 'جبال وساحل', items: 'اليوم ١ | الوصول وجولة في البلدة القديمة\nاليوم ٢ | رحلة في الوادي ونزهة\nاليوم ٣ | رحلة بحرية عند الغروب\nاليوم ٤ | السوق والمغادرة', cta: 'اطلب هذه الرحلة' }),
    reserve: T({ kicker: 'Book your stay', headline: 'Your room is waiting', sub: 'Breakfast and late checkout included.', items: 'Check in | 12 Dec\nCheck out | 15 Dec\nGuests | 2 adults\nCall | +971 50 123 4567', cta: 'Reserve now' }, { kicker: 'احجز إقامتك', headline: 'غرفتك بانتظارك', sub: 'الإفطار والمغادرة المتأخرة مشمولان.', items: 'الوصول | ١٢ ديسمبر\nالمغادرة | ١٥ ديسمبر\nالضيوف | ٢ بالغين\nاتصل | ‎+971 50 123 4567', cta: 'احجز الآن' }),
    saleBanner: T({ kicker: 'Early booking', big: '20%', headline: 'Off summer stays', sub: 'Book before the end of the month.', cta: 'Book now' }, { kicker: 'الحجز المبكر', big: '٢٠٪', headline: 'على إقامات الصيف', sub: 'احجز قبل نهاية الشهر.', cta: 'احجز الآن' }),
    lookbook: T({ kicker: 'Destination', headline: 'Slow down in Salalah', sub: 'Monsoon green, warm sea, no rush.', cta: 'See the getaway' }, { kicker: 'وجهة', headline: 'اهدأ في صلالة', sub: 'خضرة الخريف وبحر دافئ ولا استعجال.', cta: 'شاهد الرحلة' }),
    giveaway: T({ kicker: 'Giveaway', headline: 'Win a weekend away', sub: 'Three ways to enter', items: 'Follow our page\nTag your travel buddy\nShare this post', cta: 'Ends Sunday' }, { kicker: 'مسابقة', headline: 'اربح عطلة نهاية أسبوع', sub: 'ثلاث خطوات للمشاركة', items: 'تابع صفحتنا\nاذكر رفيق سفرك\nشارك المنشور', cta: 'تنتهي الأحد' }),
  },
  agency: {
    portfolio: T({ kicker: 'Case study', big: '+212%', headline: 'Rebrand for a growing café chain', sub: 'New identity, packaging and social templates delivered in six weeks.', items: 'Identity\nPackaging\nSocial' }, { kicker: 'دراسة حالة', big: '+٢١٢٪', headline: 'هوية جديدة لسلسلة مقاهٍ ناشئة', sub: 'هوية وتغليف وقوالب سوشال في ستة أسابيع.', items: 'هوية\nتغليف\nسوشال' }),
    trio: T({ kicker: 'Our work', headline: 'Craft you can measure', items: '120+ | Brands launched\n9 | Countries\n6 wks | Average delivery' }, { kicker: 'أعمالنا', headline: 'إتقان يمكن قياسه', items: '+١٢٠ | علامة أُطلقت\n٩ | دول\n٦ أسابيع | متوسط التسليم' }),
    hiring: T({ kicker: "We're hiring", headline: 'Brand designer', sub: 'Join a small team that cares about craft.', items: 'Two years of identity work\nStrong typography\nBilingual is a plus', cta: 'Send your portfolio' }, { kicker: 'نبحث عنك', headline: 'مصمم هوية', sub: 'انضم إلى فريق صغير يهتم بالإتقان.', items: 'خبرة سنتين في الهوية\nحس قوي بالخطوط\nإتقان اللغتين ميزة', cta: 'أرسل أعمالك' }),
    event: T({ kicker: 'Studio talk · 12 DEC', headline: 'Branding for founders', sub: 'An open session with Q&A. Coffee provided.', cta: 'Save your seat' }, { kicker: 'حديث الاستوديو · ١٢ ديسمبر', headline: 'الهوية لرواد الأعمال', sub: 'جلسة مفتوحة مع أسئلة وأجوبة والقهوة علينا.', cta: 'احجز مقعدك' }),
    bgquote: T({ headline: 'A brand is a promise you keep in every detail.', sub: 'Our belief' }, { headline: 'العلامة وعدٌ تحفظه في كل تفصيل.', sub: 'ما نؤمن به' }),
  },
  ecommerce: {
    saleBanner: T({ kicker: 'Weekend sale', big: '30%', headline: 'Off everything', sub: 'Free returns within 14 days.', cta: 'Shop the sale' }, { kicker: 'تخفيضات نهاية الأسبوع', big: '٣٠٪', headline: 'على كل شيء', sub: 'إرجاع مجاني خلال ١٤ يومًا.', cta: 'تسوّق التخفيضات' }),
    delivery: T({ kicker: 'Shipping', headline: 'Free delivery', sub: 'On orders over 150, to your door.', items: '2-day delivery\nEasy returns\nSecure payment', cta: 'Start shopping' }, { kicker: 'الشحن', headline: 'توصيل مجاني', sub: 'للطلبات فوق ١٥٠ حتى باب بيتك.', items: 'توصيل خلال يومين\nإرجاع سهل\nدفع آمن', cta: 'ابدأ التسوق' }),
    showcase: T({ kicker: 'Best seller', headline: 'The everyday tote', sub: 'Durable canvas, three colours.', big: '89', cta: 'Shop now' }, { kicker: 'الأكثر مبيعًا', headline: 'حقيبة الاستخدام اليومي', sub: 'قماش متين بثلاثة ألوان.', big: '٨٩', cta: 'تسوّق الآن' }),
    hangtag: T({ kicker: 'New in', headline: 'Everyday tote', sub: 'Colour: sand', items: 'Canvas, 40 x 35 cm\nMachine washable', big: '89' }, { kicker: 'جديد', headline: 'حقيبة يومية', sub: 'اللون: رملي', items: 'قماش، ٤٠ × ٣٥ سم\nقابلة للغسل', big: '٨٩' }),
    giveaway: T({ kicker: 'Giveaway', headline: 'Win a 200 gift card', sub: 'Three ways to enter', items: 'Follow our page\nTag a friend\nShare this post', cta: 'Ends Friday' }, { kicker: 'مسابقة', headline: 'اربح بطاقة هدية ٢٠٠', sub: 'ثلاث خطوات للمشاركة', items: 'تابع صفحتنا\nاذكر صديقًا\nشارك المنشور', cta: 'تنتهي الجمعة' }),
  },
};

// Story templates for each category. Most reuse the starter text of the matching post design in the same category
// (STORY_FROM); the ones with their own wording are in STORY_COPY.
const STORY_SETS = {
  coffee: ['dishstory', 'hoursstory', 'pollstory'], restaurant: ['dishstory', 'reservestory', 'menustory'],
  fashion: ['lookstory', 'salestory', 'pollstory'], beauty: ['productstory', 'ingredientsstory', 'salestory'],
  perfume: ['lookstory', 'ingredientsstory', 'productstory'], jewelry: ['productstory', 'lookstory', 'salestory'],
  tech: ['appstory', 'releasestory', 'triostory'], wellness: ['schedulestory', 'ingredientsstory', 'hoursstory'],
  fitness: ['schedulestory', 'salestory', 'pollstory'], realestate: ['listingstory', 'triostory', 'hoursstory'],
  finance: ['triostory', 'appstory', 'qa'], education: ['coursestory', 'triostory', 'tipstory'],
  travel: ['itinerarystory', 'reservestory', 'salestory'], agency: ['casestory', 'triostory', 'pollstory'],
  ecommerce: ['salestory', 'productstory', 'pollstory'],
};
const STORY_FROM = { dishstory: 'dish', reservestory: 'reserve', hoursstory: 'hours', lookstory: 'lookbook', salestory: 'saleBanner', productstory: 'showcase', appstory: 'appui', releasestory: 'changelog', schedulestory: 'workout', listingstory: 'listing', coursestory: 'course', itinerarystory: 'itinerary', casestory: 'portfolio', triostory: 'trio', ingredientsstory: 'ingredients' };
const STORY_COPY = {
  'pollstory:coffee': T({ kicker: 'This or that', headline: 'Which one is your morning cup?', items: 'Flat white\nIced latte', sub: 'Vote with the poll sticker' }, { kicker: 'أيهما تفضّل', headline: 'أي كوب هو كوب صباحك؟', items: 'فلات وايت\nلاتيه مثلج', sub: 'صوّت بملصق التصويت' }),
  'pollstory:fashion': T({ kicker: 'You choose', headline: 'Which look goes into production?', items: 'Sand wool coat\nOlive trench', sub: 'Vote with the poll sticker' }, { kicker: 'أنتِ تقررين', headline: 'أي إطلالة نبدأ بإنتاجها؟', items: 'معطف صوف رملي\nترينش زيتوني', sub: 'صوّتي بملصق التصويت' }),
  'pollstory:fitness': T({ kicker: 'This or that', headline: 'Pick your next class', items: 'Morning strength\nEvening HIIT', sub: 'Vote with the poll sticker' }, { kicker: 'أيهما تفضّل', headline: 'اختر حصتك القادمة', items: 'قوة صباحية\nهيت مسائي', sub: 'صوّت بملصق التصويت' }),
  'pollstory:agency': T({ kicker: 'Design debate', headline: 'Which logo style wins?', items: 'Bold wordmark\nQuiet symbol', sub: 'Vote with the poll sticker' }, { kicker: 'نقاش تصميمي', headline: 'أي أسلوب شعار يفوز؟', items: 'شعار نصي جريء\nرمز هادئ', sub: 'صوّت بملصق التصويت' }),
  'pollstory:ecommerce': T({ kicker: 'You decide', headline: 'Which colour should we restock?', items: 'Sand\nForest green', sub: 'Vote with the poll sticker' }, { kicker: 'أنت تقرر', headline: 'أي لون نعيد توفيره؟', items: 'رملي\nأخضر غابي', sub: 'صوّت بملصق التصويت' }),
  'menustory:restaurant': T({ kicker: 'Tonight', headline: 'On the menu', items: 'Saffron rice | 38\nSlow-cooked lamb | 58\nDate pudding | 16' }, { kicker: 'الليلة', headline: 'على القائمة', items: 'أرز بالزعفران | ٣٨\nلحم مطهو ببطء | ٥٨\nبودينغ التمر | ١٦' }),
  'qa:finance': T({ kicker: 'Ask us anything', headline: 'Your money questions, answered', sub: 'Type your question below' }, { kicker: 'اسألنا', headline: 'نجيب عن أسئلتك المالية', sub: 'اكتب سؤالك أدناه' }),
  'tipstory:education': T({ kicker: 'Study tip', headline: 'Three habits that help you learn', items: 'Study in short bursts\nTeach it to someone\nSleep before the exam' }, { kicker: 'نصيحة دراسية', headline: 'ثلاث عادات تساعدك على التعلّم', items: 'ادرس على فترات قصيرة\nاشرحه لغيرك\nنَم قبل الاختبار' }),
};

export const packIds = (category) => [...Object.keys(PACKS[category] || {}), ...(STORY_SETS[category] || []).filter((id) => !(PACKS[category] || {})[id])];
export const packCopy = (category, id, lang) => {
  const entry = PACKS[category]?.[id] || STORY_COPY[`${id}:${category}`] || PACKS[category]?.[STORY_FROM[id]];
  return { ...(entry?.[lang === 'ar' ? 'ar' : 'en'] || {}) };
};

// Generic starter text for a template that has no copy for this category: borrow the first pack that defines it.
export function anyPackCopy(id, lang) {
  for (const cat of Object.keys(PACKS)) if (PACKS[cat][id] || PACKS[cat][STORY_FROM[id]]) return packCopy(cat, id, lang);
  for (const key of Object.keys(STORY_COPY)) if (key.startsWith(`${id}:`)) return { ...(STORY_COPY[key][lang === 'ar' ? 'ar' : 'en'] || {}) };
  return {};
}
