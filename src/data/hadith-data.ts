export interface HadithCollection {
  id: string;
  slug: string;
  titleArabic: string;
  titleEnglish: string;
  titleBengali: string;
  compiler: string;
  totalHadith: number;
  descriptionBengali: string;
}

export interface HadithItem {
  id: string;
  collectionSlug: string;
  bookName: string;
  bookNameBengali: string;
  hadithNumber: string;
  arabicText: string;
  narratorBengali: string;
  narratorEnglish: string;
  bengaliText: string;
  englishText: string;
  grade: string;
  gradeBengali: string;
  sourceReference: string;
  chapterNumber?: number;
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    slug: "sahih-bukhari",
    titleArabic: "صحيح البخاري",
    titleEnglish: "Sahih al-Bukhari",
    titleBengali: "সহীহুল বুখারী",
    compiler: "ইমাম মুহাম্মদ ইবনে ইসমাঈল আল-বুখারী (রহ.)",
    totalHadith: 7563,
    descriptionBengali: "কুরআনের পর বিশুদ্ধতম হাদীস গ্রন্থ হিসেবে উম্মাহর সর্বসম্মতভাবে স্বীকৃত।"
  },
  {
    id: "muslim",
    slug: "sahih-muslim",
    titleArabic: "صحيح مسلم",
    titleEnglish: "Sahih Muslim",
    titleBengali: "সহীহ মুসলিম",
    compiler: "ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নিশাপুরী (রহ.)",
    totalHadith: 7500,
    descriptionBengali: "সহীহ বুখারীর পরেই বিশুদ্ধতম হাদীস সংকলন, সুবিন্যস্ত সনদের জন্য খ্যাত।"
  },
  {
    id: "tirmidhi",
    slug: "jami-tirmidhi",
    titleArabic: "جامع الترمذي",
    titleEnglish: "Jami` at-Tirmidhi",
    titleBengali: "জামে আত-তিরমিযী",
    compiler: "ইমাম আবু ঈসা মুহাম্মদ আত-তিরমিযী (রহ.)",
    totalHadith: 3956,
    descriptionBengali: "ফিকহী অধ্যায়বিন্যাস এবং হাদীসের স্তর ও মান বর্ণনায় বিশিষ্ট সংকলন।"
  },
  {
    id: "abudawud",
    slug: "sunan-abu-dawud",
    titleArabic: "سنن أبي داود",
    titleEnglish: "Sunan Abi Dawud",
    titleBengali: "সুনানে আবু দাউদ",
    compiler: "ইমাম আবু দাউদ সুলায়মান ইবনুল আশ'আস আস-সিজিস্তানী (রহ.)",
    totalHadith: 5274,
    descriptionBengali: "আহকাম বা শরীয়তের বিধি-বিধানমূলক হাদীসের অন্যতম প্রধান উৎস।"
  },
  {
    id: "nasai",
    slug: "sunan-nasai",
    titleArabic: "سنن النسائي",
    titleEnglish: "Sunan an-Nasa'i",
    titleBengali: "সুনানে আন-নাসায়ী",
    compiler: "ইমাম আহমদ ইবনে শুআইব আন-নাসায়ী (রহ.)",
    totalHadith: 5758,
    descriptionBengali: "কঠোর শর্ত ও সূক্ষ্ম যাচাইয়ের ভিত্তিতে সংকলিত বিশুদ্ধতম সুনান গ্রন্থ।"
  },
  {
    id: "ibnmajah",
    slug: "sunan-ibn-majah",
    titleArabic: "سنن ابن ماجه",
    titleEnglish: "Sunan Ibn Majah",
    titleBengali: "সুনানে ইবনে মাজাহ",
    compiler: "ইমাম ইবনে মাজাহ মুহাম্মদ ইবনে ইয়াযীদ আল-কাযভীনি (রহ.)",
    totalHadith: 4341,
    descriptionBengali: "সিহাহ সিত্তাহ বা কুতুবে সিত্তার অন্যতম প্রধান হাদীস সংকলন।"
  },
  {
    id: "nawawi40",
    slug: "forty-hadith-nawawi",
    titleArabic: "الأربعون النووية",
    titleEnglish: "40 Hadith of Imam an-Nawawi",
    titleBengali: "ইমাম নববীর চল্লিশ হাদীস",
    compiler: "ইমাম ইয়াহইয়া ইবনে শরাফ আন-নববী (রহ.)",
    totalHadith: 42,
    descriptionBengali: "দ্বীনের মূলনীতি ও বুনিয়াদী শিক্ষা সম্বলিত ৪২টি সর্বশ্রেষ্ঠ সার্বিক হাদীস।"
  },
  {
    id: "riyad",
    slug: "riyad-as-salihin",
    titleArabic: "رياض الصالحين",
    titleEnglish: "Riyad as-Salihin",
    titleBengali: "রিয়াযুস সালিহীন",
    compiler: "ইমাম ইয়াহইয়া ইবনে শরাফ আন-নববী (রহ.)",
    totalHadith: 1896,
    descriptionBengali: "সৎকর্মপরায়ণদের বাগান—আখলাক, শিষ্টাচার ও আত্মশুদ্ধির অমূল্য রত্ন।"
  }
];

export const FEATURED_HADITH_LIST: HadithItem[] = [
  {
    id: "bukhari-1",
    collectionSlug: "sahih-bukhari",
    bookName: "Book of Revelation",
    bookNameBengali: "ওহীর সূচনা অধ্যায়",
    hadithNumber: "1",
    arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    narratorBengali: "আমীরুল মুমিনীন উমর ইবনুল খাত্তাব (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by 'Umar bin Al-Khattab (R.A.)",
    bengaliText: "নিশ্চয়ই সমস্ত কাজের ফলাফল নিয়তের উপর নির্ভরশীল, আর প্রতিটি মানুষ যা নিয়ত করে তাই সে পায়। সুতরাং যার হিজরত হবে দুনিয়া লাভের উদ্দেশ্যে কিংবা কোনো নারীকে বিবাহ করার উদ্দেশ্যে, তার হিজরত সেই উদ্দেশ্যেই গণ্য হবে যার জন্য সে হিজরত করেছে।",
    englishText: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended...",
    grade: "Sahih (Muttafaqun 'Alayh)",
    gradeBengali: "সহীহ (মুত্তাফাক্বুন ‘আলাইহ)",
    sourceReference: "সহীহ আল-বুখারী: ১; সহীহ মুসলিম: ১৯০৭",
    chapterNumber: 1
  },
  {
    id: "muslim-1",
    collectionSlug: "sahih-muslim",
    bookName: "Book of Faith (Kitab Al-Iman)",
    bookNameBengali: "ঈমান অধ্যায়",
    hadithNumber: "8",
    arabicText: "الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا",
    narratorBengali: "উমর ইবনুল খাত্তাব (রা.) কর্তৃক জিবরীল (আ.)-এর হাদীস হতে বর্ণিত",
    narratorEnglish: "Narrated from 'Umar bin Al-Khattab (R.A.) in Hadith Jibril",
    bengaliText: "রাসূলুল্লাহ ﷺ জিবরীল (আ.)-কে বললেন: ইসলাম হলো এই সাক্ষ্য দেওয়া যে, আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই এবং নিশ্চয় মুহাম্মদ ﷺ আল্লাহর রাসূল; সালাত কায়েম করা, যাকাত প্রদান করা, রমাযানের সিয়াম পালন করা এবং সামর্থ্য থাকলে বায়তুল্লাহর হজ পালন করা।",
    englishText: "Islam is to testify that there is no god but Allah and Muhammad is the Messenger of Allah, to establish prayer, give zakah, fast Ramadan, and make pilgrimage...",
    grade: "Sahih",
    gradeBengali: "সহীহ",
    sourceReference: "সহীহ মুসলিম: ৮; সহীহ বুখারী: ৫০",
    chapterNumber: 1
  },
  {
    id: "nawawi-13",
    collectionSlug: "forty-hadith-nawawi",
    bookName: "The 40 Hadith",
    bookNameBengali: "চল্লিশ হাদীস",
    hadithNumber: "13",
    arabicText: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    narratorBengali: "আনাস ইবনে মালিক (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by Anas bin Malik (R.A.)",
    bengaliText: "তোমাদের কেউ ততক্ষণ পর্যন্ত পূর্ণ ঈমানদার হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে যা সে নিজের জন্য পছন্দ করে।",
    englishText: "None of you truly believes until he loves for his brother what he loves for himself.",
    grade: "Sahih (Muttafaqun 'Alayh)",
    gradeBengali: "সহীহ (মুত্তাফাক্বুন ‘আলাইহ)",
    sourceReference: "সহীহ আল-বুখারী: ১৩; সহীহ মুসলিম: ৪৫",
    chapterNumber: 1
  },
  {
    id: "bukhari-5027",
    collectionSlug: "sahih-bukhari",
    bookName: "Virtues of the Quran",
    bookNameBengali: "কুরআনের ফযীলত অধ্যায়",
    hadithNumber: "5027",
    arabicText: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    narratorBengali: "উসমান ইবনে আফফান (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by 'Uthman bin 'Affan (R.A.)",
    bengaliText: "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে তা শিক্ষা দেয়।",
    englishText: "The best among you are those who learn the Quran and teach it to others.",
    grade: "Sahih",
    gradeBengali: "সহীহ",
    sourceReference: "সহীহ আল-বুখারী: ৫০২৭",
    chapterNumber: 66
  },
  {
    id: "tirmidhi-1987",
    collectionSlug: "jami-tirmidhi",
    bookName: "Righteousness and Social Relations",
    bookNameBengali: "সৎকাজ ও সদাচার অধ্যায়",
    hadithNumber: "1987",
    arabicText: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا، وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ",
    narratorBengali: "আবু হুরায়রা (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by Abu Hurairah (R.A.)",
    bengaliText: "ঈমানের দিক দিয়ে মুমিনদের মধ্যে সবচেয়ে পরিপূর্ণ ব্যক্তি সে, যার চরিত্র সবচেয়ে সুন্দর। আর তোমাদের মধ্যে সর্বোত্তম তারা, যারা নিজেদের স্ত্রীদের কাছে সর্বোত্তম।",
    englishText: "The most complete of believers in faith are those with the best character, and the best of you are the best to their women.",
    grade: "Hasan Sahih",
    gradeBengali: "হাসান সহীহ",
    sourceReference: "জামে আত-তিরমিযী: ১১৬২ (সহীহ আত-তিরমিযী)",
    chapterNumber: 11
  },
  {
    id: "bukhari-6018",
    collectionSlug: "sahih-bukhari",
    bookName: "Good Manners and Form (Al-Adab)",
    bookNameBengali: "শিষ্টাচার অধ্যায়",
    hadithNumber: "6018",
    arabicText: "مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ",
    narratorBengali: "জারীর ইবনে আব্দুল্লাহ (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by Jarir bin 'Abdullah (R.A.)",
    bengaliText: "যে ব্যক্তি মানুষের প্রতি দয়া প্রদর্শন করে না, আল্লাহ তা'আলাও তার প্রতি দয়া প্রদর্শন করেন না।",
    englishText: "He who does not show mercy to the people, Allah will not show mercy to him.",
    grade: "Sahih",
    gradeBengali: "সহীহ",
    sourceReference: "সহীহ আল-বুখারী: ৬০১৮; সহীহ মুসলিম: ২৩১৯",
    chapterNumber: 78
  },
  {
    id: "muslim-2564",
    collectionSlug: "sahih-muslim",
    bookName: "Virtue, Good Manners and Joining Ties",
    bookNameBengali: "সদ্ব্যবহার ও সদাচার অধ্যায়",
    hadithNumber: "2564",
    arabicText: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    narratorBengali: "আবু হুরায়রা (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by Abu Hurairah (R.A.)",
    bengaliText: "নিশ্চয়ই আল্লাহ তোমাদের বাহ্যিক চেহারা ও ধন-সম্পদের দিকে তাকান না; বরং তিনি দৃষ্টিপাত করেন তোমাদের অন্তর এবং তোমাদের কর্মের দিকে।",
    englishText: "Verily Allah does not look at your appearances or your wealth, but rather He looks at your hearts and your deeds.",
    grade: "Sahih",
    gradeBengali: "সহীহ",
    sourceReference: "সহীহ মুসলিম: ২৫৬৪",
    chapterNumber: 45
  },
  {
    id: "riyad-1",
    collectionSlug: "riyad-as-salihin",
    bookName: "Book of Sincerity & Sincere Repentance",
    bookNameBengali: "ইখলাস ও তাওবাহ অধ্যায়",
    hadithNumber: "14",
    arabicText: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ",
    narratorBengali: "আব্দুল্লাহ ইবনে মাসউদ (রা.) হতে বর্ণিত",
    narratorEnglish: "Narrated by 'Abdullah bin Mas'ud (R.A.)",
    bengaliText: "গুনাহ থেকে আন্তরিকভাবে তওবাকারী ব্যক্তি এমন হয়ে যায়, যেন তার কোনো গুনাহই ছিল না।",
    englishText: "The one who repents from sin is like the one who has no sin.",
    grade: "Hasan",
    gradeBengali: "হাসান",
    sourceReference: "সুনানে ইবনে মাজাহ: ৪২৫০; সহীহ আত-তারগীব: ৩১৪৬",
    chapterNumber: 1
  }
];
