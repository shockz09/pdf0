"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  applyFilter,
  downloadImage,
  formatFileSize,
  getOutputFilename,
  FilterType,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  FiltersIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
} from "@/components/icons";

interface FilterResult {
  blob: Blob;
  filename: string;
  filter: FilterType;
}

const filters: { value: FilterType; label: string; cssFilter: string }[] = [
  { value: "grayscale", label: "Grayscale", cssFilter: "grayscale(100%)" },
  { value: "sepia", label: "Sepia", cssFilter: "sepia(100%)" },
  { value: "invert", label: "Invert", cssFilter: "invert(100%)" },
];

export default function ImageFiltersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FilterResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setSelectedFilter(null);

      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
    setSelectedFilter(null);
  }, [preview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const currentFilterStyle = selectedFilter
    ? { filter: filters.find((f) => f.value === selectedFilter)?.cssFilter }
    : {};

  const handleApply = async () => {
    if (!file || !selectedFilter) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const filtered = await applyFilter(file, selectedFilter);

      setResult({
        blob: filtered,
        filename: getOutputFilename(file.name, undefined, `_${selectedFilter}`),
        filter: selectedFilter,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply filter");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (result) {
      downloadImage(result.blob, result.filename);
    }
  };

  const handleStartOver = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSelectedFilter(null);
  };

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/image" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Image Tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-filters">
            <FiltersIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Image Filters</h1>
            <p className="text-muted-foreground mt-1">
              Apply grayscale, sepia, or invert effects
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        <div className="animate-fade-up">
          <div className="success-card">
            <div className="success-stamp">
              <span className="success-stamp-text">Filtered</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">Filter Applied!</h2>
              <p className="text-muted-foreground">
                {result.filter.charAt(0).toUpperCase() + result.filter.slice(1)}{" "}
                filter • {formatFileSize(result.blob.size)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-success flex-1"
              >
                <DownloadIcon className="w-5 h-5" />
                Download Image
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-secondary flex-1"
              >
                Apply to Another
              </button>
            </div>
          </div>
        </div>
      ) : !file ? (
        <div className="space-y-6">
          <FileDropzone
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Drop your image here"
            subtitle="or click to browse from your device"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          {preview && (
            <div className="border-2 border-foreground p-4 bg-muted/30">
              <img
                src={preview}
                alt="Preview"
                style={currentFilterStyle}
                className="max-h-64 mx-auto object-contain transition-all duration-300"
              />
            </div>
          )}

          {/* File Info */}
          <div className="file-item">
            <div className="pdf-icon-box">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          {/* Filter Selection */}
          <div className="space-y-3">
            <label className="input-label">Select Filter</label>
            <div className="grid grid-cols-3 gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`relative overflow-hidden border-2 border-foreground aspect-square transition-all ${
                    selectedFilter === filter.value
                      ? "ring-4 ring-primary ring-offset-2"
                      : "hover:scale-105"
                  }`}
                >
                  {preview && (
                    <img
                      src={preview}
                      alt={filter.label}
                      style={{ filter: filter.cssFilter }}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-foreground/90 py-2">
                    <span className="text-xs font-bold text-background">
                      {filter.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* No filter selected hint */}
          {selectedFilter && (
            <button
              onClick={() => setSelectedFilter(null)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filter selection
            </button>
          )}

          {error && (
            <div className="error-box animate-shake">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground py-4">
              <LoaderIcon className="w-4 h-4" />
              <span>Applying filter...</span>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing || !selectedFilter}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Processing...
              </>
            ) : (
              <>
                <FiltersIcon className="w-5 h-5" />
                {selectedFilter
                  ? `Apply ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`
                  : "Select a Filter"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
