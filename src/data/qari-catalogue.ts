export interface Qari {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  nameBengali: string;
  style: string;
  subfolder: string;
  bitrate: string;
  attribution: string;
  getSurahAudioUrl: (surahNumber: number) => string;
}

export const QARI_LIST: Qari[] = [
  {
    id: "alafasy",
    nameEnglish: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    nameBengali: "মিশারী রাশিদ আল-আফাসী",
    style: "Murattal",
    subfolder: "ar.alafasy",
    bitrate: "128kbps",
    attribution: "Mishary Rashid Alafasy / EveryAyah audio archive",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`
  },
  {
    id: "shatri",
    nameEnglish: "Abu Bakr Al-Shatri",
    nameArabic: "أبو بكر الشاطري",
    nameBengali: "আবু বকর আশ-শাতরী",
    style: "Murattal",
    subfolder: "ar.shaatree",
    bitrate: "128kbps",
    attribution: "Abu Bakr Ash-Shatri / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.shaatree/${surahNumber}.mp3`
  },
  {
    id: "husary",
    nameEnglish: "Mahmoud Khalil Al-Husary",
    nameArabic: "محمود خليل الحصري",
    nameBengali: "মাহমুদ খলীল আল-হুসারী",
    style: "Murattal",
    subfolder: "ar.husary",
    bitrate: "128kbps",
    attribution: "Shaykh Al-Husary / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.husary/${surahNumber}.mp3`
  },
  {
    id: "abdulbasit",
    nameEnglish: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    nameBengali: "আব্দুল বাসিত আব্দুল সামাদ",
    style: "Murattal",
    subfolder: "ar.abdulbasitmurattal",
    bitrate: "128kbps",
    attribution: "Abdul Basit (Murattal) / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`
  },
  {
    id: "ghamidi",
    nameEnglish: "Saad Al-Ghamdi",
    nameArabic: "سعد الغامدي",
    nameBengali: "সা'দ আল-গামদী",
    style: "Murattal",
    subfolder: "ar.saadalghamidi",
    bitrate: "128kbps",
    attribution: "Saad Al-Ghamdi / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.saadalghamidi/${surahNumber}.mp3`
  },
  {
    id: "muaiqly",
    nameEnglish: "Maher Al-Muaiqly",
    nameArabic: "ماهر المعيقلي",
    nameBengali: "মাহের আল-মুয়াইক্বলী",
    style: "Murattal",
    subfolder: "ar.mahermuaiqly",
    bitrate: "128kbps",
    attribution: "Maher Al-Muaiqly / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.mahermuaiqly/${surahNumber}.mp3`
  },
  {
    id: "sudais",
    nameEnglish: "Abdur-Rahman As-Sudais",
    nameArabic: "عبد الرحمن السديس",
    nameBengali: "আব্দুর রহমান আস-সুদাইস",
    style: "Murattal",
    subfolder: "ar.abdurrahmaansudais",
    bitrate: "128kbps",
    attribution: "Abdur-Rahman As-Sudais / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.abdurrahmaansudais/${surahNumber}.mp3`
  },
  {
    id: "shuraim",
    nameEnglish: "Saud Al-Shuraim",
    nameArabic: "سعود الشريم",
    nameBengali: "সউদ আশ-শুরাইম",
    style: "Murattal",
    subfolder: "ar.saudalshuraim",
    bitrate: "128kbps",
    attribution: "Saud Ash-Shuraim / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.saudalshuraim/${surahNumber}.mp3`
  },
  {
    id: "aldosari",
    nameEnglish: "Yasser Al-Dosari",
    nameArabic: "ياسر الدوسري",
    nameBengali: "ইয়াসির আদ-দাওসারী",
    style: "Murattal",
    subfolder: "ar.aldosari",
    bitrate: "128kbps",
    attribution: "Yasser Al-Dosari / EveryAyah audio archive",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://download.quranicaudio.com/qdc/yasser_dussary/murattal/${surahNumber}.mp3`
  },
  {
    id: "rifai",
    nameEnglish: "Hani Ar-Rifai",
    nameArabic: "هاني الرفاعي",
    nameBengali: "হানী আর-রিফায়ী",
    style: "Murattal",
    subfolder: "ar.hanirifai",
    bitrate: "128kbps",
    attribution: "Hani Ar-Rifai / Islamic Network CDN",
    getSurahAudioUrl: (surahNumber: number) =>
      `https://cdn.islamic.network/quran/audio-surah/128/ar.hanirifai/${surahNumber}.mp3`
  }
];

export function getQariById(id: string): Qari {
  return QARI_LIST.find((q) => q.id === id) || QARI_LIST[0];
}
