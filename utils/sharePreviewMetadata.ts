import type { Metadata } from "next";
import { getTranslations, type Locale } from "@/i18n/translations";

// Card links are sent to the birthday person as a surprise, so their chat
// previews must not mention birthdays, and they should stay out of search results.
export function getSharePreviewMetadata(locale: Locale): Metadata {
  const { sharePreviewTitle, sharePreviewDescription } = getTranslations(locale).celebration;

  return {
    title: sharePreviewTitle,
    description: sharePreviewDescription,
    openGraph: {
      title: sharePreviewTitle,
      description: sharePreviewDescription,
      siteName: "With Warm Wishes",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: sharePreviewTitle,
      description: sharePreviewDescription,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}
