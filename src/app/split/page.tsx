"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { splitPDF, extractPages, getPDFPageCount, downloadBlob, downloadMultiple } from "@/lib/pdf-utils";
import { ArrowLeftIcon, SplitIcon, DownloadIcon, LoaderIcon, PdfIcon } from "@/components/icons";

type SplitMode = "extract" | "range" | "each";

interface SplitResult {
  files: { data: Uint8Array; filename: string }[];
  mode: SplitMode;
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SplitMode>("extract");
  const [extractInput, setExtractInput] = useState("");
  const [rangeInput, setRangeInput] = useState("");
  const [result, setResult] = useState<SplitResult | null>(null);

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);
      try {
        const count = await getPDFPageCount(selectedFile);
        setPageCount(count);
      } catch {
        setError("Could not read PDF file");
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setError(null);
    setResult(null);
    setExtractInput("");
    setRangeInput("");
  }, []);

  const parsePageNumbers = (input: string): number[] => {
    const pages: number[] = [];
    const parts = input.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && !pages.includes(num)) pages.push(num);
      }
    }
    return pages.sort((a, b) => a - b);
  };

  const parseRanges = (input: string): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = [];
    const parts = input.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          ranges.push({ start: start - 1, end: end - 1 });
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          ranges.push({ start: num - 1, end: num - 1 });
        }
      }
    }
    return ranges;
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const baseName = file.name.replace(".pdf", "");
      let resultFiles: { data: Uint8Array; filename: string }[] = [];

      if (mode === "extract") {
        const pages = parsePageNumbers(extractInput);
        if (pages.length === 0) {
          throw new Error("Please enter valid page numbers");
        }
        setProgress(30);
        const data = await extractPages(file, pages);
        setProgress(90);
        resultFiles = [{ data, filename: `${baseName}_pages_${pages.join("-")}.pdf` }];
      } else if (mode === "range") {
        const ranges = parseRanges(rangeInput);
        if (ranges.length === 0) {
          throw new Error("Please enter valid page ranges");
        }
        setProgress(30);
        const results = await splitPDF(file, ranges);
        setProgress(90);
        resultFiles = results.map((data, i) => ({
          data,
          filename: `${baseName}_part${i + 1}.pdf`,
        }));
      } else if (mode === "each") {
        setProgress(10);
        const ranges = Array.from({ length: pageCount }, (_, i) => ({
          start: i,
          end: i,
        }));
        const results = await splitPDF(file, ranges);
        setProgress(90);
        resultFiles = results.map((data, i) => ({
          data,
          filename: `${baseName}_page${i + 1}.pdf`,
        }));
      }

      setResult({ files: resultFiles, mode });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (result) {
      if (result.files.length === 1) {
        downloadBlob(result.files[0].data, result.files[0].filename);
      } else {
        downloadMultiple(result.files);
      }
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setPageCount(0);
    setResult(null);
    setError(null);
    setProgress(0);
    setExtractInput("");
    setRangeInput("");
  };

  const modes = [
    { value: "extract" as const, label: "Extract Pages" },
    { value: "range" as const, label: "Split by Range" },
    { value: "each" as const, label: "Every Page" },
  ];

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-split">
            <SplitIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Split PDF</h1>
            <p className="text-muted-foreground mt-1">
              Extract pages or divide into multiple files
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
              <span className="success-stamp-text">Complete</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display">
                PDF Split!
              </h2>
              <p className="text-muted-foreground">
                {result.files.length === 1
                  ? "Your extracted pages are ready"
                  : `Created ${result.files.length} PDF files`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-success flex-1"
              >
                <DownloadIcon className="w-5 h-5" />
                {result.files.length === 1 ? "Download PDF" : `Download ${result.files.length} Files`}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-secondary flex-1"
              >
                Split Another PDF
              </button>
            </div>
          </div>
        </div>
      ) : !file ? (
        <FileDropzone
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Drop your PDF file here"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="file-item">
            <div className="pdf-icon-box">
              <PdfIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages</p>
            </div>
            <button
              onClick={handleClear}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          {/* Mode Selection */}
          <div className="mode-selector">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`mode-option ${mode === m.value ? "active" : ""}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode-specific inputs */}
          {mode === "extract" && (
            <div className="space-y-2">
              <label className="input-label">Pages to extract</label>
              <input
                type="text"
                placeholder="e.g., 1, 3, 5-10"
                value={extractInput}
                onChange={(e) => setExtractInput(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-muted-foreground">
                Enter page numbers separated by commas. Use ranges like 5-10.
              </p>
            </div>
          )}

          {mode === "range" && (
            <div className="space-y-2">
              <label className="input-label">Page ranges</label>
              <input
                type="text"
                placeholder="e.g., 1-3, 4-6, 7-10"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-muted-foreground">
                Each range will become a separate PDF file.
              </p>
            </div>
          )}

          {mode === "each" && (
            <div className="info-box">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm">
                Each page will be saved as a separate PDF. This will create <strong>{pageCount} files</strong>.
              </span>
            </div>
          )}

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
                <span>Processing...</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Processing...
              </>
            ) : (
              <>
                <SplitIcon className="w-5 h-5" />
                Split PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
