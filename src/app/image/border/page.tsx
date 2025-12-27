"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  addBorder,
  downloadImage,
  formatFileSize,
  getOutputFilename,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  BorderIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
} from "@/components/icons";

interface BorderResult {
  blob: Blob;
  filename: string;
}

const presetColors = [
  "#000000",
  "#FFFFFF",
  "#1a1a1a",
  "#f5f5f5",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function ImageBorderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState("#000000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BorderResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);

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

  const handleApply = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const bordered = await addBorder(file, borderWidth, borderColor);

      setResult({
        blob: bordered,
        filename: getOutputFilename(file.name, undefined, "_bordered"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add border");
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
          <div className="tool-icon tool-border">
            <BorderIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Add Border</h1>
            <p className="text-muted-foreground mt-1">
              Add a colored border around images
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        <div className="animate-fade-up">
          <div className="success-card">
            <div className="success-stamp">
              <span className="success-stamp-text">Done</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">Border Added!</h2>
              <p className="text-muted-foreground">
                File size: {formatFileSize(result.blob.size)}
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
                Add Border to Another
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
          {/* Preview with border preview */}
          {preview && (
            <div className="border-2 border-foreground p-4 bg-muted/30">
              <div
                style={{
                  padding: `${Math.min(borderWidth, 30)}px`,
                  backgroundColor: borderColor,
                  display: "inline-block",
                  margin: "0 auto",
                }}
                className="mx-auto block"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 object-contain block"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Preview (scaled)
              </p>
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

          {/* Border Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="input-label">Border Width</label>
              <span className="text-sm font-bold">{borderWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full h-2 bg-muted border-2 border-foreground appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Border Color */}
          <div className="space-y-3">
            <label className="input-label">Border Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBorderColor(color)}
                  className={`w-8 h-8 border-2 transition-transform ${
                    borderColor === color
                      ? "border-primary scale-110"
                      : "border-foreground hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-14 h-12 border-2 border-foreground cursor-pointer p-1"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="input-field flex-1"
                placeholder="#000000"
              />
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
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground py-4">
              <LoaderIcon className="w-4 h-4" />
              <span>Adding border...</span>
            </div>
          )}

          <button
            onClick={handleApply}
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
                <BorderIcon className="w-5 h-5" />
                Add Border
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
