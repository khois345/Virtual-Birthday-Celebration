import CelebrationPageContent from "@/components/CelebrationPageContent";
import PageFooter from "@/components/PageFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSharePreviewMetadata } from "@/utils/sharePreviewMetadata";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export const metadata = getSharePreviewMetadata("en");

export default async function BirthdaySessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <>
      <LanguageSwitcher locale="en" />
      <CelebrationPageContent sessionId={sessionId} locale="en" />
      <PageFooter locale="en" />
    </>
  );
}