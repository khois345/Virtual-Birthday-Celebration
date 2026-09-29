import CelebrationPageContent from "@/components/CelebrationPageContent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageFooter from "@/components/PageFooter";
import { getSharePreviewMetadata } from "@/utils/sharePreviewMetadata";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export const metadata = getSharePreviewMetadata("vi");

export default async function VietnameseBirthdaySessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <>
      <LanguageSwitcher locale="vi" />
      <CelebrationPageContent sessionId={sessionId} locale="vi" />
      <PageFooter locale="vi" />
    </>
  );
}
