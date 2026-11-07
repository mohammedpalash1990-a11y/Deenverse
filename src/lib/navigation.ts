export const sections = [
  { id: "quran", label: "Quran", description: "Read and reflect" },
  { id: "hadith", label: "Hadith", description: "Prophetic traditions" },
  { id: "cards", label: "Share Cards", description: "Create and share reminders" },
  { id: "duas", label: "Duas & Adhkar", description: "Daily remembrance" },
  { id: "learn", label: "Learn", description: "Build your knowledge" },
  { id: "bookmarks", label: "Bookmarks", description: "Your saved places" },
  { id: "settings", label: "Settings", description: "Personalise your space" }
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function getSection(id: string) {
  return sections.find((section) => section.id === id) ?? sections[0];
}
