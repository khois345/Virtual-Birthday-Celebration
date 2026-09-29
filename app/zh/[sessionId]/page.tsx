import CelebrationPageContent from "@/components/CelebrationPageContent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageFooter from "@/components/PageFooter";
import { getSharePreviewMetadata } from "@/utils/sharePreviewMetadata";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export const metadata = getSharePreviewMetadata("zh");

export default async function ChineseBirthdaySessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <>
      <LanguageSwitcher locale="zh" />
      <CelebrationPageContent sessionId={sessionId} locale="zh" />
      <PageFooter locale="zh" />
    </>
  );
}
