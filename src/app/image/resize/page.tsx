"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  resizeImage,
  downloadImage,
  formatFileSize,
  getOutputFilename,
  getImageDimensions,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  ResizeIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
} from "@/components/icons";

interface ResizeResult {
  blob: Blob;
  filename: string;
  originalDimensions: { width: number; height: number };
  newDimensions: { width: number; height: number };
}

const presets = [
  { label: "Instagram Square", width: 1080, height: 1080 },
  { label: "Instagram Portrait", width: 1080, height: 1350 },
  { label: "Twitter Post", width: 1200, height: 675 },
  { label: "Facebook Cover", width: 820, height: 312 },
  { label: "HD (1920×1080)", width: 1920, height: 1080 },
  { label: "4K (3840×2160)", width: 3840, height: 2160 },
];

export default function ImageResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResizeResult | null>(null);

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);

      // Get dimensions
      const dims = await getImageDimensions(selectedFile);
      setOriginalDimensions(dims);
      setWidth(dims.width);
      setHeight(dims.height);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setOriginalDimensions(null);
    setError(null);
    setResult(null);
  }, [preview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const applyPreset = (preset: { width: number; height: number }) => {
    setMaintainAspect(false);
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleResize = async () => {
    if (!file || !originalDimensions) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const resized = await resizeImage(file, width, height, false);
      setProgress(90);

      setResult({
        blob: resized,
        filename: getOutputFilename(file.name, undefined, `_${width}x${height}`),
        originalDimensions,
        newDimensions: { width, height },
      });

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resize image");
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
    setOriginalDimensions(null);
    setResult(null);
    setError(null);
    setProgress(0);
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
          <div className="tool-icon tool-resize">
            <ResizeIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Resize Image</h1>
            <p className="text-muted-foreground mt-1">
              Change image dimensions with presets or custom sizes
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
              <span className="success-stamp-text">Resized</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">Image Resized!</h2>

              {/* Dimensions Display */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Original
                  </p>
                  <p className="text-xl font-bold">
                    {result.originalDimensions.width}×
                    {result.originalDimensions.height}
                  </p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-foreground text-background">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    New Size
                  </p>
                  <p className="text-xl font-bold">
                    {result.newDimensions.width}×{result.newDimensions.height}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                File size: {formatFileSize(result.blob.size)}
              </p>
            </div>

            {/* Actions */}
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
                Resize Another
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
                className="max-h-48 mx-auto object-contain"
              />
              {originalDimensions && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Original: {originalDimensions.width}×{originalDimensions.height}
                </p>
              )}
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

          {/* Presets */}
          <div className="space-y-3">
            <label className="input-label">Quick Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-xs font-bold border-2 border-foreground hover:bg-foreground hover:text-background transition-colors text-left"
                >
                  <span className="block">{preset.label}</span>
                  <span className="text-muted-foreground">
                    {preset.width}×{preset.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-4">
            <label className="input-label">Custom Size</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Width
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="input-field w-full"
                />
              </div>
              <div className="pt-6 text-muted-foreground font-bold">×</div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Height
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Maintain Aspect Ratio */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="w-5 h-5 border-2 border-foreground bg-background checked:bg-foreground"
              />
              <span className="text-sm font-medium">Maintain aspect ratio</span>
            </label>
          </div>

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
            <div className="space-y-3">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <LoaderIcon className="w-4 h-4" />
                <span>Resizing...</span>
              </div>
            </div>
          )}

          <button
            onClick={handleResize}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Resizing...
              </>
            ) : (
              <>
                <ResizeIcon className="w-5 h-5" />
                Resize to {width}×{height}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
