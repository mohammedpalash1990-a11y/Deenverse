export interface TajweedRuleItem {
  id: string;
  category: "noon_sakinah" | "meem_sakinah" | "qalqalah" | "madd" | "makharij";
  titleEnglish: string;
  titleBengali: string;
  arabicName: string;
  descriptionBengali: string;
  descriptionEnglish: string;
  letters: string[];
  ruleSummary: string;
  examples: Array<{
    arabic: string;
    surahRef: string;
    explanation: string;
  }>;
}

export const TAJWEED_RULES: TajweedRuleItem[] = [
  {
    id: "noon-izhar",
    category: "noon_sakinah",
    titleEnglish: "Izhar Halqi (Clear Pronunciation)",
    titleBengali: "ইযহারে হালক্বী (স্পষ্ট উচ্চারণ)",
    arabicName: "إظهار حلقي",
    descriptionBengali: "নূন সাকিন (نْ) বা তানভীন (-ً -ٍ -ٌ)-এর পর হলকের (কণ্ঠনালীর) ৬টি হরফের যেকোনো একটি আসলে গুন্নাহ ছাড়া স্পষ্টভাবে উচ্চারণ করতে হয়।",
    descriptionEnglish: "When Noon Sakinah or Tanween is followed by one of the 6 throat letters, it must be pronounced clearly without extra nasalization (ghunnah).",
    letters: ["ء", "هـ", "ع", "ح", "غ", "خ"],
    ruleSummary: "হলকের ৬টি হরফ: হামযা, হা, ‘আইন, হা, গ্বাইন, খা। গুন্নাহ ব্যতীত স্পষ্ট উচ্চারণ।",
    examples: [
      { arabic: "مَنْ ءَامَنَ", surahRef: "Al-Baqarah 2:62", explanation: "নূন সাকিনের পর হামযা (ء) এসেছে, তাই স্পষ্ট পড়তে হবে।" },
      { arabic: "عَذَابٌ أَلِيمٌ", surahRef: "Al-Baqarah 2:10", explanation: "তানভীনের পর হামযা এসেছে, তাই স্পষ্ট।" },
      { arabic: "مِنْ حَكِيمٍ", surahRef: "Fussilat 41:42", explanation: "নূন সাকিনের পর হা (ح) এসেছে।" }
    ]
  },
  {
    id: "noon-idgham",
    category: "noon_sakinah",
    titleEnglish: "Idgham (Merging)",
    titleBengali: "ইদগ্বাম (মিলিয়ে পড়া)",
    arabicName: "إدغام",
    descriptionBengali: "নূন সাকিন বা তানভীনের পর 'ইয়ারমালূন' (يرملون) এর ৬টি হরফের কোনো একটি আসলে নূনকে পরবর্তী হরফের সাথে মিলিয়ে পড়তে হয়।",
    descriptionEnglish: "When Noon Sakinah or Tanween is followed by any of the 6 letters of Yarmaloon (ي، ر، م، ل، و، ن), it is merged into the following letter.",
    letters: ["ي", "ر", "م", "ل", "و", "ن"],
    ruleSummary: "গুন্নাহসহ ইদগ্বাম (৪টি: ي، ن، م، و) এবং গুন্নাহ ছাড়া ইদগ্বাম (২টি: ل، ر)।",
    examples: [
      { arabic: "مَن يَقُولُ", surahRef: "Al-Baqarah 2:8", explanation: "নূন সাকিনের পর ইয়া (ي) আসায় গুন্নাহর সাথে মিলিয়ে 'মাইইয়াকূলু' পড়তে হয়।" },
      { arabic: "مِن رَّبِّهِمْ", surahRef: "Al-Baqarah 2:5", explanation: "নূন সাকিনের পর র (ر) আসায় গুন্নাহ ছাড়া 'মির রাব্বিহিম' পড়তে হয়।" }
    ]
  },
  {
    id: "noon-iqlab",
    category: "noon_sakinah",
    titleEnglish: "Iqlab (Conversion to Meem)",
    titleBengali: "ইক্বলাব (মীমে রূপান্তর)",
    arabicName: "إقلاب",
    descriptionBengali: "নূন সাকিন বা তানভীনের পর বা (ب) আসলে সেই নূনকে একটি অদৃশ্য মীম (م) দ্বারা পরিবর্তন করে গুন্নাহর সাথে পড়তে হয়।",
    descriptionEnglish: "When Noon Sakinah or Tanween is followed by the letter Ba (ب), it is converted into a hidden Meem sound with ghunnah.",
    letters: ["ب"],
    ruleSummary: "একমাত্র হরফ: বা (ب)। নূন পরিবর্তিত হয়ে মীমে পরিণত হয়।",
    examples: [
      { arabic: "مِن بَعْدِ", surahRef: "Al-Baqarah 2:27", explanation: "নূনের স্থানে মীম উচ্চারিত হয়ে 'মিম বা'দি' হবে।" },
      { arabic: "سَمِيعٌ بَصِيرٌ", surahRef: "Al-Hajj 22:75", explanation: "তানভীনের পর বা আসায় 'সামী'উম বাসীর' উচ্চারিত হয়।" }
    ]
  },
  {
    id: "noon-ikhfa",
    category: "noon_sakinah",
    titleEnglish: "Ikhfa Haqiqi (Concealment)",
    titleBengali: "ইখফা হাক্বীক্বী (গোপন করে গুন্নাহ)",
    arabicName: "إخفاء حقيقي",
    descriptionBengali: "নূন সাকিন বা তানভীনের পর ইখফার ১৫টি হরফের কোনো একটি আসলে নূনের মাখরাজকে গোপন করে নাকের বাঁশিতে গুন্নাহ করে পড়তে হয়।",
    descriptionEnglish: "When Noon Sakinah or Tanween is followed by any of the 15 Ikhfa letters, the Noon sound is concealed with a light nasalization.",
    letters: ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"],
    ruleSummary: "১৫টি হরফ। নূনের আওয়াজ হালকা গোপন করে গুন্নাহর সাথে ১ আলিফ পরিমাণ সময় ধরা।",
    examples: [
      { arabic: "مِن قَبْلُ", surahRef: "Al-Baqarah 2:25", explanation: "নূনের পর ক্বাফ আসায় ভারী গুন্নাহর সাথে ইখফা।" },
      { arabic: "أَنتُمْ", surahRef: "Al-Baqarah 2:22", explanation: "নূনের পর তা আসায় পাতলা গুন্নাহর সাথে ইখফা।" }
    ]
  },
  {
    id: "qalqalah",
    category: "qalqalah",
    titleEnglish: "Qalqalah (Echo / Bouncing Sound)",
    titleBengali: "ক্বলক্বলাহ (প্রতিধ্বনি সৃষ্টি করা)",
    arabicName: "قلقلة",
    descriptionBengali: "ক্বলক্বলাহর ৫টি হরফে সাকিন (্) বা ওয়াকফ হলে উচ্চারণের সময় ধাক্কা বা প্রতিধ্বনি সৃষ্টি করতে হয়।",
    descriptionEnglish: "When any of the five Qalqalah letters carries a Sukoon or is stopped upon (waqf), it must be pronounced with a distinctive bounce or echo.",
    letters: ["ق", "ط", "ب", "ج", "د"],
    ruleSummary: "হরফ ৫টি: ক্বুতবু জাদ্দ (قطب جد)। ছোট ক্বলক্বলাহ (শব্দের মাঝে সাকিন) এবং বড় ক্বলক্বলাহ (ওয়াকফের কারণে)।",
    examples: [
      { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", surahRef: "Al-Ikhlas 112:1", explanation: "দালের উপর ওয়াকফ করায় জোরালো ক্বলক্বলাহ হবে।" },
      { arabic: "الْفَلَقِ", surahRef: "Al-Falaq 113:1", explanation: "ক্বাফের উপর ওয়াকফ করায় স্পষ্ট ক্বলক্বলাহ।" },
      { arabic: "يَجْعَلُونَ", surahRef: "Al-Baqarah 2:19", explanation: "জীমের উপর সাকিন থাকায় মৃদু ক্বলক্বলাহ।" }
    ]
  },
  {
    id: "madd-asli",
    category: "madd",
    titleEnglish: "Madd Asli / Tabee'ee (Natural Elongation)",
    titleBengali: "মাদ্দে আসলী বা ত্বরয়ী (স্বাভাবিক টান)",
    arabicName: "مد أصلي / طبيعي",
    descriptionBengali: "মাদ্দের হরফ তিনটি: খালি আলিফের ডানে যবর, ওয়াও সাকিনের ডানে পেশ, ইয়া সাকিনের ডানে যের। এরপরে কোনো কারণ (হামযা বা সাকিন) না থাকলে ১ আলিফ পরিমাণ (প্রায় ২ হরকত) টানতে হয়।",
    descriptionEnglish: "The primary natural madd when Alif follows Fathah, Waw Sakinah follows Dammah, or Ya Sakinah follows Kasrah, elongated for 2 vowel counts (1 Alif).",
    letters: ["ا", "و", "ي"],
    ruleSummary: "টানের পরিমাণ: ১ আলিফ (২ হরকত)। যেমন: نُوحِيهَا (নূহীহা)।",
    examples: [
      { arabic: "قَالَ", surahRef: "Al-Baqarah 2:30", explanation: "যবরের পর খালি আলিফ থাকায় ১ আলিফ টান।" },
      { arabic: "يَقُولُ", surahRef: "Al-Baqarah 2:8", explanation: "পেশের পর ওয়াও সাকিন থাকায় ১ আলিফ টান।" },
      { arabic: "قِيلَ", surahRef: "Al-Baqarah 2:11", explanation: "যেরের পর ইয়া সাকিন থাকায় ১ আলিফ টান।" }
    ]
  },
  {
    id: "madd-muttasil",
    category: "madd",
    titleEnglish: "Madd Muttasil (Connected Elongation)",
    titleBengali: "মাদ্দে মুত্তাসিল (যুক্ত টান)",
    arabicName: "مد متصل",
    descriptionBengali: "মাদ্দের হরফের পর একই শব্দের মধ্যে হামযা (ء) আসলে তাকে মাদ্দে মুত্তাসিল বলে। এটিকে ৪ বা ৫ হরকত পরিমাণ টানতে হয়।",
    descriptionEnglish: "When a Madd letter is followed by a Hamzah in the very same word, elongated for 4 to 5 vowel counts.",
    letters: ["ء"],
    ruleSummary: "একই শব্দের ভিতর হামযা। টান: ৪-৫ হরকত।",
    examples: [
      { arabic: "جَاءَ", surahRef: "An-Nasr 110:1", explanation: "আলিফের পর একই শব্দে হামযা থাকায় ৪ হরকত টান।" },
      { arabic: "السَّمَاءِ", surahRef: "Al-Baqarah 2:19", explanation: "আলিফের পর হামযা আসায় চার হরকত মাদ্দ।" }
    ]
  },
  {
    id: "makharij",
    category: "makharij",
    titleEnglish: "Makharij al-Huroof (Articulation Points)",
    titleBengali: "মাখারিজুল হুরূফ (উচ্চারণের স্থানসমূহ)",
    arabicName: "مخارج الحروف",
    descriptionBengali: "আরবি ২৯টি হরফ মুখের ৫টি প্রধান অংশ (কণ্ঠনালী, জিহ্বা, ঠোঁট, নাসিকা ও মুখের খালি জায়গা) থেকে মোট ১৭টি নির্দিষ্ট মাখরাজ দিয়ে উচ্চারিত হয়।",
    descriptionEnglish: "The 17 specific articulation exit points distributed across 5 major regions of speech: Throat, Tongue, Lips, Nasal cavity, and Empty mouth.",
    letters: ["حلق", "لسان", "شفتان", "خيشوم", "جوف"],
    ruleSummary: "১. জওফ (মুখের খালি জায়গা), ২. হলক্ব (কণ্ঠনালী), ৩. লিসান (জিহ্বা), ৪. শাফাতান (দুই ঠোঁট), ৫. খাইশূম (নাকের বাঁশি)।",
    examples: [
      { arabic: "الْحَلْق (কণ্ঠনালী)", surahRef: "৬টি হরফ", explanation: "হামযা, হা, ‘আইন, হা, গ্বাইন, খা—কণ্ঠের শুরু, মধ্য ও শেষভাগ থেকে।" },
      { arabic: "اللِّسَان (জিহ্বা)", surahRef: "১৮টি হরফ", explanation: "ক্বাফ, কাফ, জীম, শীন, ইয়া, দদ, লাম, নূন, র, তা, দাল, ত্বোয়া, ইত্যাদি।" },
      { arabic: "الشَّفَتَان (দুই ঠোঁট)", surahRef: "৪টি হরফ", explanation: "ফা, বা, মীম, ওয়াও।" }
    ]
  }
];
