import { MetadataRoute } from "next";

const BASE_URL = "https://withwarmwishes.com";
const locales = ["es", "ja", "ko", "vi", "zh", "id", "th"];

export default function sitemap(): MetadataRoute.Sitemap {
  const localePaths = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...localePaths,
  ];
}
