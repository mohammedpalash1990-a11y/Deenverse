export interface JuzMetadata {
  juzNumber: number;
  nameArabic: string;
  nameBengali: string;
  nameTransliteration: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export const JUZ_LIST: JuzMetadata[] = [
  { juzNumber: 1, nameArabic: "الم", nameBengali: "আলিফ-লাম-মীম", nameTransliteration: "Alif-Lam-Meem", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { juzNumber: 2, nameArabic: "سَيَقُولُ", nameBengali: "সায়াকুলু", nameTransliteration: "Sayaqool", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juzNumber: 3, nameArabic: "تِلْكَ الرُّسُلُ", nameBengali: "তিলকার রুসুল", nameTransliteration: "Tilka ar-Rusul", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juzNumber: 4, nameArabic: "لَنْ تَنَالُوا", nameBengali: "লান তানালু", nameTransliteration: "Lan Tanaaloo", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juzNumber: 5, nameArabic: "وَالْمُحْصَنَاتُ", nameBengali: "ওয়াল মুহসানাতু", nameTransliteration: "Wal-Muhsanat", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juzNumber: 6, nameArabic: "لَا يُحِبُّ اللَّهُ", nameBengali: "লা ইউহিব্বুল্লাহ", nameTransliteration: "La Yuhibbullah", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juzNumber: 7, nameArabic: "وَإِذَا سَمِعُوا", nameBengali: "ওয়া ইযা সামিউ", nameTransliteration: "Wa Iza Sami'oo", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juzNumber: 8, nameArabic: "وَلَوْ أَنَّنَا", nameBengali: "ওয়ালাও আন্নানা", nameTransliteration: "Wa Law Annana", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juzNumber: 9, nameArabic: "قَالَ الْمَلَأُ", nameBengali: "ক্বালাল মালাউ", nameTransliteration: "Qal al-Mala'u", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juzNumber: 10, nameArabic: "وَاعْلَمُوا", nameBengali: "ওয়ায়লামু", nameTransliteration: "Wa A'lamoo", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juzNumber: 11, nameArabic: "يَعْتَذِرُونَ", nameBengali: "ইয়া'তাযিরূন", nameTransliteration: "Ya'taziroon", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juzNumber: 12, nameArabic: "وَمَا مِنْ دَابَّةٍ", nameBengali: "ওয়ামা মিন দাব্বাহ", nameTransliteration: "Wa Mamin Dabbah", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juzNumber: 13, nameArabic: "وَمَا أُبَرِّئُ", nameBengali: "ওয়ামা উবাররিউ", nameTransliteration: "Wa Ma Ubarri'u", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juzNumber: 14, nameArabic: "رُبَمَا", nameBengali: "রুবা'মা", nameTransliteration: "Rubama", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juzNumber: 15, nameArabic: "سُبْحَانَ الَّذِي", nameBengali: "সুবহানাল্লাযী", nameTransliteration: "Subhan allathee", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juzNumber: 16, nameArabic: "قَالَ أَلَمْ", nameBengali: "ক্বালা আলাম", nameTransliteration: "Qala Alam", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juzNumber: 17, nameArabic: "اقْتَرَبَ لِلنَّاسِ", nameBengali: "ইক্বতারাবা লিন্নাস", nameTransliteration: "Iqtaraba Linnaas", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juzNumber: 18, nameArabic: "قَدْ أَفْلَحَ", nameBengali: "ক্বাদ আফলাহা", nameTransliteration: "Qad Aflaha", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juzNumber: 19, nameArabic: "وَقَالَ الَّذِينَ", nameBengali: "ওয়া ক্বালা অাল্লাযীন", nameTransliteration: "Wa Qal allatheena", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juzNumber: 20, nameArabic: "أَمَّنْ خَلَقَ", nameBengali: "আম্মান খালাক্বা", nameTransliteration: "Amman Khalaq", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juzNumber: 21, nameArabic: "اتْلُ مَا أُوحِيَ", nameBengali: "উতলু মা উহিয়া", nameTransliteration: "Utlu Ma Oohiya", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juzNumber: 22, nameArabic: "وَمَنْ يَقْنُتْ", nameBengali: "ওয়া মান ইয়াকনুত", nameTransliteration: "Wa Manyaqnut", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juzNumber: 23, nameArabic: "وَمَا لِيَ", nameBengali: "ওয়ামা লিয়া", nameTransliteration: "Wa Maliya", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juzNumber: 24, nameArabic: "فَمَنْ أَظْلَمُ", nameBengali: "ফামান আজলামু", nameTransliteration: "Faman Azlam", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juzNumber: 25, nameArabic: "إِلَيْهِ يُرَدُّ", nameBengali: "ইলাইহি ইউরাদ্দু", nameTransliteration: "Ilayhi Yuraddu", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juzNumber: 26, nameArabic: "حم", nameBengali: "হা-মীম", nameTransliteration: "Ha-Meem", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juzNumber: 27, nameArabic: "قَالَ فَمَا خَطْبُكُمْ", nameBengali: "ক্বালা ফামা খাতবুকুম", nameTransliteration: "Qala Fama Khatbukum", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juzNumber: 28, nameArabic: "قَدْ سَمِعَ اللَّهُ", nameBengali: "ক্বাদ সামি'আল্লাহ", nameTransliteration: "Qad Sami'allah", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juzNumber: 29, nameArabic: "تَبَارَكَ الَّذِي", nameBengali: "তাবারাকাল্লাযী", nameTransliteration: "Tabarak allathee", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juzNumber: 30, nameArabic: "عَمَّ", nameBengali: "আম্মা (আমপারা)", nameTransliteration: "'Amma", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 }
];
