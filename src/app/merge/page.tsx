"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { FileList } from "@/components/pdf/file-list";
import { mergePDFs, downloadBlob } from "@/lib/pdf-utils";
import { ArrowLeftIcon, MergeIcon, DownloadIcon, LoaderIcon } from "@/components/icons";

interface FileItem {
  file: File;
  id: string;
}

interface MergeResult {
  data: Uint8Array;
  filename: string;
  originalCount: number;
  totalSize: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

export default function MergePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const newItems = newFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));
    setFiles((prev) => [...prev, ...newItems]);
    setError(null);
    setResult(null);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return newFiles;
    });
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setError(null);
    setResult(null);
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(20);
      await new Promise((r) => setTimeout(r, 100));

      setProgress(40);
      const mergedPdf = await mergePDFs(files.map((f) => f.file));

      setProgress(80);
      await new Promise((r) => setTimeout(r, 100));

      const firstName = files[0].file.name.replace(".pdf", "");
      const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

      setResult({
        data: mergedPdf,
        filename: `${firstName}_merged.pdf`,
        originalCount: files.length,
        totalSize,
      });

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (result) {
      downloadBlob(result.data, result.filename);
    }
  };

  const handleStartOver = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-merge">
            <MergeIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Merge PDF</h1>
            <p className="text-muted-foreground mt-1">
              Combine multiple PDFs into a single document
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        // Success State
        <div className="animate-fade-up">
          <div className="success-card">
            {/* Stamp */}
            <div className="success-stamp">
              <span className="success-stamp-text">Complete</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display">
                PDFs Merged!
              </h2>
              <p className="text-muted-foreground">
                {result.originalCount} files combined into one PDF
              </p>
            </div>

            {/* File Info */}
            <div className="inline-flex items-center gap-4 px-5 py-4 bg-muted border-2 border-foreground mb-8">
              <div className="pdf-icon-box">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground truncate max-w-[200px]">
                  {result.filename}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(result.data.length)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-success flex-1"
              >
                <DownloadIcon className="w-5 h-5" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-secondary flex-1"
              >
                Merge More Files
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload & Process State
        <div className="space-y-6">
          {/* Dropzone */}
          <FileDropzone
            accept=".pdf"
            multiple
            onFilesSelected={handleFilesSelected}
            maxFiles={50}
            title="Drop your PDF files here"
            subtitle="or click to browse"
          />

          {/* File List */}
          <FileList
            files={files}
            onRemove={handleRemove}
            onReorder={handleReorder}
            onClear={handleClear}
          />

          {/* Error */}
          {error && (
            <div className="error-box animate-shake">
              <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-3 animate-fade-in">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <LoaderIcon className="w-4 h-4" />
                <span>Merging your PDFs...</span>
              </div>
            </div>
          )}

          {/* Merge Button */}
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Merging...
              </>
            ) : (
              <>
                <MergeIcon className="w-5 h-5" />
                Merge {files.length > 0 ? `${files.length} PDFs` : "PDFs"}
              </>
            )}
          </button>

          {/* Hint */}
          {files.length === 1 && (
            <p className="text-sm text-muted-foreground text-center font-medium">
              Add at least one more PDF to merge
            </p>
          )}
        </div>
      )}
    </div>
  );
}
