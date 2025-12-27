"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  compressImage,
  downloadImage,
  formatFileSize,
  getOutputFilename,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  ImageCompressIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
} from "@/components/icons";

interface CompressResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
}

export default function ImageCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Create preview
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
  }, [preview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const compressed = await compressImage(file, quality / 100);
      setProgress(90);

      setResult({
        blob: compressed,
        filename: getOutputFilename(file.name, "jpeg", "_compressed"),
        originalSize: file.size,
        compressedSize: compressed.size,
      });

      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compress image"
      );
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
    setProgress(0);
  };

  const savings = result
    ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
    : 0;

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/image" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Image Tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-image-compress">
            <ImageCompressIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Compress Image</h1>
            <p className="text-muted-foreground mt-1">
              Reduce file size while keeping quality
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
              <h2 className="text-3xl font-display">Image Compressed!</h2>

              {/* Savings Display */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Original
                  </p>
                  <p className="text-xl font-bold">
                    {formatFileSize(result.originalSize)}
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
                    Compressed
                  </p>
                  <p className="text-xl font-bold">
                    {formatFileSize(result.compressedSize)}
                  </p>
                </div>
              </div>

              {/* Savings Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm ${
                  savings > 0
                    ? "bg-[#2D5A3D] text-white border-foreground"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {savings > 0 ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
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
                Download Image
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
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Drop your image here"
            subtitle="or click to browse from your device"
          />

          <div className="info-box">
            <svg
              className="w-5 h-5 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">
                About compression
              </p>
              <p className="text-muted-foreground">
                Compresses images using JPEG encoding. For best results, adjust
                the quality slider to find the right balance between file size
                and visual quality.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          {preview && (
            <div className="border-2 border-foreground p-4 bg-muted/30">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto object-contain"
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

          {/* Quality Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="input-label">Quality</label>
              <span className="text-sm font-bold">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-muted border-2 border-foreground appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
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
                <ImageCompressIcon className="w-5 h-5" />
                Compress Image
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
