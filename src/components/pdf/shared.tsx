import { ReactNode } from "react";
import { PageHeader, FileInfo } from "@/components/shared";

// Re-export common components
export { ErrorBox, ProgressBar, ProcessButton, SuccessCard, ComparisonDisplay, SavingsBadge } from "@/components/shared";

// ============ PDF Page Header (wrapper) ============
interface PdfPageHeaderProps {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
}

export function PdfPageHeader({ icon, iconClass, title, description }: PdfPageHeaderProps) {
  return (
    <PageHeader
      icon={icon}
      iconClass={iconClass}
      title={title}
      description={description}
      backHref="/"
      backLabel="Back to tools"
    />
  );
}

// ============ PDF File Info (alias) ============
export const PdfFileInfo = FileInfo;
