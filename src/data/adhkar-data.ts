export interface DhikrItem {
  id: string;
  category: "morning" | "evening" | "sleep" | "salah" | "anxiety" | "daily";
  categoryBengali: string;
  titleEnglish: string;
  titleBengali: string;
  arabicText: string;
  transliteration: string;
  translationBengali: string;
  translationEnglish: string;
  reference: string;
  targetCount: number;
  virtue?: string;
}

export const ADHKAR_LIST: DhikrItem[] = [
  {
    id: "m-1",
    category: "morning",
    categoryBengali: "সকালের যিকির",
    titleEnglish: "Ayat al-Kursi (Morning Protection)",
    titleBengali: "আয়াতুল কুরসী (সকালের নিরাপত্তা)",
    arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi-idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhitoona bi-shay'in min 'ilmihi illa bima sha'a, wasi'a kursiyyuhus-samawati wal-arda, wa la ya'ooduhu hifzuhuma, wa huwal-'Aliyyul-'Azeem.",
    translationBengali: "আল্লাহ্, তিনি ছাড়া কোনো সত্য ইলাহ নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তন্দ্রা ও নিদ্রা তাঁকে স্পর্শ করে না। আকাশমণ্ডলে ও পৃথিবীতে যা কিছু আছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর নিকট সুপারিশ করবে? তাদের সামনে ও পেছনে যা কিছু আছে তা তিনি জানেন। আর তাঁর জ্ঞানের কোনো কিছুকেই তারা পরিবেষ্টন করতে পারে না, কেবল যতটুকু তিনি ইচ্ছে করেন। তাঁর কুরসী আসমানসমূহ ও জমিনকে পরিব্যাপ্ত করে আছে; আর এ দুটোর রক্ষণাবেক্ষণ তাঁর জন্য কোনো বোঝা নয়। আর তিনি অতি উচ্চ, অতি মহান।",
    translationEnglish: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth...",
    reference: "সূরা আল-বাক্বারা: ২৫৫; হাকেম ১/৫৬২, সহীহ আত-তারগীব ১/২৭৩",
    targetCount: 1,
    virtue: "যে ব্যক্তি সকালে এটি পাঠ করবে সে সন্ধ্যা পর্যন্ত জিন-শয়তান থেকে সংরক্ষিত থাকবে।"
  },
  {
    id: "m-2",
    category: "morning",
    categoryBengali: "সকালের যিকির",
    titleEnglish: "Sayyidul Istighfar (Chief of Prayers for Forgiveness)",
    titleBengali: "সাইয়েদুল ইস্তিগফার (ক্ষমা প্রার্থনার শ্রেষ্ঠ দো‘আ)",
    arabicText: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'oodhu bika min sharri ma sana'tu, aboo'u laka bini'matika 'alayya, wa aboo'u laka bidhanbi, faghfir li fa-innahu la yaghfirudh-dhunooba illa Ant.",
    translationBengali: "হে আল্লাহ! আপনি আমার প্রতিপালক। আপনি ছাড়া কোনো সত্য ইলাহ নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি আমার সাধ্যমতো আপনার অঙ্গীকার ও প্রতিশ্রুতির উপর আছি। আমি যা করেছি তার মন্দ পরিণাম থেকে আপনার আশ্রয় চাই। আমার উপর আপনার যে নেয়ামত রয়েছে তা আমি স্বীকার করছি এবং আমার অপরাধও স্বীকার করছি। অতএব আপনি আমাকে ক্ষমা করে দিন; কারণ আপনি ছাড়া গুনাহ মাফ করার আর কেউ নেই।",
    translationEnglish: "O Allah, You are my Lord, there is no deity except You. You created me, and I am Your servant, and I abide by Your covenant and promise as best I can...",
    reference: "সহীহ আল-বুখারী: ৬৩০৬",
    targetCount: 1,
    virtue: "যে ব্যক্তি দৃঢ় বিশ্বাসের সাথে সকালে এটি পড়বে এবং সে দিন সন্ধ্যায় পূর্বে মারা যাবে, সে জান্নাতীদের অন্তর্ভুক্ত হবে।"
  },
  {
    id: "m-3",
    category: "morning",
    categoryBengali: "সকালের যিকির",
    titleEnglish: "Seeking Protection from Harm",
    titleBengali: "অকস্মাৎ বিপদ ও ক্ষতি থেকে সুরক্ষা",
    arabicText: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Aleem.",
    translationBengali: "আল্লাহর নামে, যাঁর নামের বরকতে আসমান ও জমিনের কোনো বস্তুই কোনো ক্ষতি করতে পারে না; আর তিনি সর্বশ্রোতা, সর্বজ্ঞ।",
    translationEnglish: "In the name of Allah, with whose name nothing on earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    reference: "আবু দাউদ: ৫০৮৮, তিরমিযী: ৩৩৮৮ (সহীহ)",
    targetCount: 3,
    virtue: "সকালে ও সন্ধ্যায় ৩ বার পাঠ করলে কোনো কিছুই তার ক্ষতি করতে পারবে না।"
  },
  {
    id: "m-4",
    category: "morning",
    categoryBengali: "সকালের যিকির",
    titleEnglish: "Praise & Glory",
    titleBengali: "আল্লাহর পবিত্রতা ও প্রশংসা",
    arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhan-Allahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
    translationBengali: "আল্লাহর পবিত্রতা ও প্রশংসা ঘোষণা করছি—তাঁর সৃষ্টির সংখ্যার সমপরিমাণ, তাঁর সন্তুষ্টির সমপরিমাণ, তাঁর আরশের ওজনের সমপরিমাণ এবং তাঁর বাক্যসমূহের কালির সমপরিমাণ।",
    translationEnglish: "Glory and praise is to Allah, as much as the number of His creation, according to His pleasure, by the weight of His Throne, and by the ink of His words.",
    reference: "সহীহ মুসলিম: ২৭২৬",
    targetCount: 3,
    virtue: "রাসূলুল্লাহ ﷺ বলেছেন এটি পুরো সকালের সকল যিকিরের চেয়েও ওজনদার ও শ্রেষ্ঠ।"
  },
  {
    id: "e-1",
    category: "evening",
    categoryBengali: "সন্ধ্যার যিকির",
    titleEnglish: "Evening Entrance Prayer",
    titleBengali: "সন্ধ্যার আগমনী দো‘আ",
    arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadeer.",
    translationBengali: "আমরা সন্ধ্যায় উপনীত হয়েছি এবং সমস্ত রাজত্বও আল্লাহর জন্য সন্ধ্যায় উপনীত হয়েছে। সমস্ত প্রশংসা আল্লাহর। আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই, তিনি একক, তাঁর কোনো অংশীদার নেই। রাজত্ব তাঁরই, প্রশংসাও তাঁরই এবং তিনি সকল কিছুর উপর সর্বশক্তিমান।",
    translationEnglish: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah...",
    reference: "সহীহ মুসলিম: ২৭২৩",
    targetCount: 1
  },
  {
    id: "e-2",
    category: "evening",
    categoryBengali: "সন্ধ্যার যিকির",
    titleEnglish: "Protection through the Perfect Words",
    titleBengali: "আল্লাহর পরিপূর্ণ বাণীর মাধ্যমে সুরক্ষা",
    arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'oodhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
    translationBengali: "আমি আল্লাহর পরিপূর্ণ বাক্যসমূহের সাহায্যে তাঁর সৃষ্টির অনিষ্ট থেকে আশ্রয় চাই।",
    translationEnglish: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    reference: "সহীহ মুসলিম: ২৭০৯",
    targetCount: 3,
    virtue: "সন্ধ্যার সময় ৩ বার বললে ওই রাতে কোনো বিষধর প্রাণী বা অনিষ্টকারী ক্ষতি করতে পারবে না।"
  },
  {
    id: "s-1",
    category: "salah",
    categoryBengali: "নামাযের পরের যিকির",
    titleEnglish: "Tasbeeh, Tahmeed & Takbeer",
    titleBengali: "তাসবীহ, তাহমীদ ও তাকবীর",
    arabicText: "سُبْحَانَ اللَّهِ (٣٣) ، الْحَمْدُ لِلَّهِ (٣٣) ، اللَّهُ أَكْبَرُ (٣٣)",
    transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x).",
    translationBengali: "আল্লাহ পবিত্র (৩৩ বার), সকল প্রশংসা আল্লাহর (৩৩ বার), আল্লাহ সর্বশ্রেষ্ঠ (৩৩ বার)।",
    translationEnglish: "Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (33x).",
    reference: "সহীহ মুসলিম: ৫৯৭",
    targetCount: 33,
    virtue: "ফরজ সালাত শেষে এটি পাঠ করে ১ বার 'লা ইলাহা ইল্লাল্লাহু...' পাঠ করলে সমুদ্রের ফেনা পরিমাণ গুনাহও ক্ষমা করা হয়।"
  },
  {
    id: "sl-1",
    category: "sleep",
    categoryBengali: "ঘুমানোর দো‘আ",
    titleEnglish: "Dua Before Sleeping",
    titleBengali: "ঘুমানোর আগের দো‘আ",
    arabicText: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amootu wa ahya.",
    translationBengali: "হে আল্লাহ! আপনারই নামে আমি মৃত্যুবরণ করি (ঘুমাই) এবং আপনারই নামে জীবিত (জাগ্রত) হই।",
    translationEnglish: "In Your name, O Allah, I die and I live.",
    reference: "সহীহ আল-বুখারী: ৬৩১২, সহীহ মুসলিম: ২৭১১",
    targetCount: 1
  },
  {
    id: "sl-2",
    category: "sleep",
    categoryBengali: "ঘুম থেকে ওঠার দো‘আ",
    titleEnglish: "Dua Upon Waking Up",
    titleBengali: "ঘুম থেকে জাগ্রত হওয়ার দো‘আ",
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushoor.",
    translationBengali: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদেরকে মৃত্যু (ঘুম) দেওয়ার পর পুনরায় জীবিত করলেন, আর তাঁর কাছেই সবার পুনরুত্থান।",
    translationEnglish: "All praise is for Allah who gave us life after causing us to die, and unto Him is the resurrection.",
    reference: "সহীহ আল-বুখারী: ৬৩১২",
    targetCount: 1
  },
  {
    id: "a-1",
    category: "anxiety",
    categoryBengali: "বিপদ ও দুশ্চিন্তা মুক্তির দো‘আ",
    titleEnglish: "Dua of Prophet Yunus (A.S.) in Distress",
    titleBengali: "বিপদের মুহূর্তে নবী ইউনুস (আ.)-এর দো‘আ",
    arabicText: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimeen.",
    translationBengali: "আপনি ছাড়া কোনো সত্য ইলাহ নেই; আপনি পবিত্র-মহান। নিশ্চয় আমি যালিমদের অন্তর্ভুক্ত ছিলাম।",
    translationEnglish: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: "সূরা আল-আম্বিয়া: ৮৭; জামে আত-তিরমিযী: ৩৫০৫ (সহীহ)",
    targetCount: 1,
    virtue: "কোনো মুসলিম বিপদে পড়ে এই দো‘আ দ্বারা আল্লাহর কাছে প্রার্থনা করলে অবশ্যই আল্লাহ তার প্রার্থনা কবুল করেন।"
  },
  {
    id: "d-1",
    category: "daily",
    categoryBengali: "দৈনন্দিন যিকির",
    titleEnglish: "Light upon the tongue, Heavy on the Scale",
    titleBengali: "জিহ্বায় সহজ ও মীযানে ভারী দুটি বাক্য",
    arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-'Azeem.",
    translationBengali: "আল্লাহর পবিত্রতা ও প্রশংসা ঘোষণা করছি; মহান আল্লাহর পবিত্রতা ঘোষণা করছি।",
    translationEnglish: "Glory be to Allah and His is the praise, Glory be to Allah the Supreme.",
    reference: "সহীহ আল-বুখারী: ৬৬৮২, সহীহ মুসলিম: ২৬৯৪",
    targetCount: 100,
    virtue: "উচ্চারণে অতি সহজ, দাঁড়িপাল্লায় অতি ভারী এবং পরম দয়ালু আল্লাহর নিকট অত্যন্ত প্রিয় দুটি বাক্য।"
  }
];
