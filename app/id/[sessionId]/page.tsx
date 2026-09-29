import CelebrationPageContent from "@/components/CelebrationPageContent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageFooter from "@/components/PageFooter";
import { getSharePreviewMetadata } from "@/utils/sharePreviewMetadata";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export const metadata = getSharePreviewMetadata("id");

export default async function IndonesianBirthdaySessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <>
      <LanguageSwitcher locale="id" />
      <CelebrationPageContent sessionId={sessionId} locale="id" />
      <PageFooter locale="id" />
    </>
  );
}
