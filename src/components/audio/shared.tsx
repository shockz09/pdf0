"use client";

import { ReactNode } from "react";
import { PageHeader, FileInfo, ProgressBar as BaseProgressBar } from "@/components/shared";
import { InfoIcon, AudioIcon } from "@/components/icons";
import { formatFileSize, formatDuration } from "@/lib/audio-utils";

// Re-export common components
export { ErrorBox, ProcessButton, SuccessCard } from "@/components/shared";

// ============ FFmpeg Notice (audio-specific) ============
export function FFmpegNotice() {
  return (
    <div className="flex items-start gap-3 p-3 border-2 border-foreground/30 bg-muted/30 text-sm">
      <InfoIcon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-muted-foreground">
        First use downloads the audio engine (~31MB). Subsequent uses are instant.
      </p>
    </div>
  );
}

// ============ Audio Progress Bar (converts 0-1 to 0-100) ============
interface ProgressBarProps {
  progress: number; // 0-1 range from FFmpeg
  label: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return <BaseProgressBar progress={progress * 100} label={label} />;
}

// ============ Audio Page Header (wrapper) ============
interface AudioPageHeaderProps {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
}

export function AudioPageHeader({ icon, iconClass, title, description }: AudioPageHeaderProps) {
  return (
    <PageHeader
      icon={icon}
      iconClass={iconClass}
      title={title}
      description={description}
      backHref="/audio"
      backLabel="Back to Audio Tools"
    />
  );
}

// ============ Audio File Info (with duration support) ============
interface AudioFileInfoProps {
  file: File;
  duration?: number;
  onClear: () => void;
  icon?: ReactNode;
}

export function AudioFileInfo({ file, duration, onClear, icon }: AudioFileInfoProps) {
  const sizeText = duration !== undefined && duration > 0
    ? `${formatDuration(duration)} • ${formatFileSize(file.size)}`
    : formatFileSize(file.size);

  return (
    <FileInfo
      file={file}
      fileSize={sizeText}
      onClear={onClear}
      icon={icon || <AudioIcon className="w-5 h-5 shrink-0" />}
    />
  );
}
