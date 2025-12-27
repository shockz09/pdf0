"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  convertFormat,
  downloadImage,
  formatFileSize,
  ImageFormat,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  ConvertIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
} from "@/components/icons";

interface ConvertResult {
  blob: Blob;
  filename: string;
  originalFormat: string;
  newFormat: ImageFormat;
}

const formats: { value: ImageFormat; label: string; description: string }[] = [
  { value: "jpeg", label: "JPEG", description: "Best for photos, smaller files" },
  { value: "png", label: "PNG", description: "Lossless, supports transparency" },
  { value: "webp", label: "WebP", description: "Modern format, great compression" },
];

export default function ImageConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);

      // Auto-select a different format as target
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "png") {
        setTargetFormat("jpeg");
      } else if (ext === "jpg" || ext === "jpeg") {
        setTargetFormat("png");
      } else if (ext === "webp") {
        setTargetFormat("jpeg");
      }
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const converted = await convertFormat(file, targetFormat, quality / 100);
      setProgress(90);

      const baseName = file.name.split(".").slice(0, -1).join(".");
      const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
      const originalExt = file.name.split(".").pop()?.toUpperCase() || "Unknown";

      setResult({
        blob: converted,
        filename: `${baseName}.${ext}`,
        originalFormat: originalExt,
        newFormat: targetFormat,
      });

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert image");
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

  const showQualitySlider = targetFormat === "jpeg" || targetFormat === "webp";

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/image" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Image Tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-convert">
            <ConvertIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Convert Image</h1>
            <p className="text-muted-foreground mt-1">
              Convert between PNG, JPEG, and WebP formats
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
              <span className="success-stamp-text">Converted</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">Image Converted!</h2>

              {/* Format Display */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Original
                  </p>
                  <p className="text-xl font-bold">{result.originalFormat}</p>
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
                    New Format
                  </p>
                  <p className="text-xl font-bold">
                    {result.newFormat.toUpperCase()}
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
                Download {result.newFormat.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-secondary flex-1"
              >
                Convert Another
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
              <p className="font-bold text-foreground mb-1">Format guide</p>
              <p className="text-muted-foreground">
                <strong>JPEG:</strong> Best for photos, smaller files.{" "}
                <strong>PNG:</strong> Lossless with transparency.{" "}
                <strong>WebP:</strong> Modern format with best compression.
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
                className="max-h-48 mx-auto object-contain"
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

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="input-label">Convert to</label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setTargetFormat(format.value)}
                  className={`px-4 py-3 text-sm font-bold border-2 border-foreground transition-colors ${
                    targetFormat === format.value
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="block">{format.label}</span>
                  <span
                    className={`text-xs ${
                      targetFormat === format.value
                        ? "text-background/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG and WebP) */}
          {showQualitySlider && (
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
            <div className="space-y-3">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <LoaderIcon className="w-4 h-4" />
                <span>Converting...</span>
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Converting...
              </>
            ) : (
              <>
                <ConvertIcon className="w-5 h-5" />
                Convert to {targetFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
