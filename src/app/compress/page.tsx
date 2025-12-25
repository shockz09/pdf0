"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { compressPDF, downloadBlob } from "@/lib/pdf-utils";
import { ArrowLeftIcon, CompressIcon, DownloadIcon, LoaderIcon, PdfIcon } from "@/components/icons";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

interface CompressResult {
  data: Uint8Array;
  filename: string;
  originalSize: number;
  compressedSize: number;
}

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setError(null);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const compressed = await compressPDF(file);
      setProgress(90);

      const baseName = file.name.replace(".pdf", "");
      setResult({
        data: compressed,
        filename: `${baseName}_compressed.pdf`,
        originalSize: file.size,
        compressedSize: compressed.length,
      });

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF");
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
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const savings = result
    ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
    : 0;

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-compress">
            <CompressIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Compress PDF</h1>
            <p className="text-muted-foreground mt-1">
              Reduce file size while preserving quality
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        <div className="animate-fade-up">
          <div className="success-card">
            {/* Stamp */}
            <div className="success-stamp">
              <span className="success-stamp-text">Optimized</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">
                PDF Compressed!
              </h2>

              {/* Savings Display */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Original</p>
                  <p className="text-xl font-bold">{formatFileSize(result.originalSize)}</p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-foreground text-background">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Compressed</p>
                  <p className="text-xl font-bold">{formatFileSize(result.compressedSize)}</p>
                </div>
              </div>

              {/* Savings Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm ${
                savings > 0
                  ? "bg-[#2D5A3D] text-white border-foreground"
                  : "bg-muted text-muted-foreground border-border"
              }`}>
                {savings > 0 ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="17 11 12 6 7 11" />
                      <path d="M12 6v12" />
                    </svg>
                    {savings}% smaller
                  </>
                ) : (
                  "Already optimized"
                )}
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
                Compress Another
              </button>
            </div>
          </div>
        </div>
      ) : !file ? (
        <div className="space-y-6">
          <FileDropzone
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Drop your PDF file here"
          />

          <div className="info-box">
            <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">About compression</p>
              <p className="text-muted-foreground">Client-side compression removes metadata and applies object stream optimization. For image-heavy PDFs, consider using dedicated tools.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="file-item">
            <div className="pdf-icon-box">
              <PdfIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={handleClear}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          {error && (
            <div className="error-box animate-shake">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-3">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <LoaderIcon className="w-4 h-4" />
                <span>Compressing...</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Compressing...
              </>
            ) : (
              <>
                <CompressIcon className="w-5 h-5" />
                Compress PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
