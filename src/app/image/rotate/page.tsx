"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  rotateImage,
  flipImage,
  downloadImage,
  formatFileSize,
  getOutputFilename,
  FlipDirection,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  RotateIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
} from "@/components/icons";

type Rotation = 0 | 90 | 180 | 270;

interface TransformResult {
  blob: Blob;
  filename: string;
}

export default function ImageRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformResult | null>(null);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);

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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, [preview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const rotateLeft = () => {
    setRotation((prev) => ((prev - 90 + 360) % 360) as Rotation);
  };

  const rotateRight = () => {
    setRotation((prev) => ((prev + 90) % 360) as Rotation);
  };

  const handleApply = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      let blob: Blob = file;

      // Apply rotation
      if (rotation !== 0) {
        blob = await rotateImage(file, rotation);
      }

      // Apply horizontal flip
      if (flipH) {
        const tempFile = new File([blob], file.name, { type: blob.type });
        blob = await flipImage(tempFile, "horizontal");
      }

      // Apply vertical flip
      if (flipV) {
        const tempFile = new File([blob], file.name, { type: blob.type });
        blob = await flipImage(tempFile, "vertical");
      }

      const suffix = `_${rotation !== 0 ? `r${rotation}` : ""}${flipH ? "fh" : ""}${flipV ? "fv" : ""}`.replace("_", "_transformed");

      setResult({
        blob,
        filename: getOutputFilename(file.name, undefined, "_transformed"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transform image");
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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const hasChanges = rotation !== 0 || flipH || flipV;

  // Calculate preview transform
  const previewStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
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
          <div className="tool-icon tool-rotate-image">
            <RotateIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Rotate & Flip</h1>
            <p className="text-muted-foreground mt-1">
              Rotate 90°, 180°, 270° or flip your images
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
              <h2 className="text-3xl font-display">Image Transformed!</h2>
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
                Transform Another
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
            <div className="border-2 border-foreground p-4 bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-center h-64">
                <img
                  src={preview}
                  alt="Preview"
                  style={previewStyle}
                  className="max-h-full max-w-full object-contain transition-transform duration-300"
                />
              </div>
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

          {/* Rotation Controls */}
          <div className="space-y-3">
            <label className="input-label">Rotate</label>
            <div className="flex gap-2">
              <button
                onClick={rotateLeft}
                className="flex-1 px-4 py-3 border-2 border-foreground font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Rotate Left
              </button>
              <button
                onClick={rotateRight}
                className="flex-1 px-4 py-3 border-2 border-foreground font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                Rotate Right
              </button>
            </div>
            {rotation !== 0 && (
              <p className="text-sm text-center text-muted-foreground">
                Current rotation: {rotation}°
              </p>
            )}
          </div>

          {/* Flip Controls */}
          <div className="space-y-3">
            <label className="input-label">Flip</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`flex-1 px-4 py-3 border-2 border-foreground font-bold transition-colors flex items-center justify-center gap-2 ${
                  flipH
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground hover:text-background"
                }`}
              >
                <FlipHorizontalIcon className="w-5 h-5" />
                Flip Horizontal
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`flex-1 px-4 py-3 border-2 border-foreground font-bold transition-colors flex items-center justify-center gap-2 ${
                  flipV
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground hover:text-background"
                }`}
              >
                <FlipVerticalIcon className="w-5 h-5" />
                Flip Vertical
              </button>
            </div>
          </div>

          {/* Reset */}
          {hasChanges && (
            <button
              onClick={() => {
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
              }}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset all changes
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
              <span>Applying transformations...</span>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={isProcessing || !hasChanges}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Processing...
              </>
            ) : (
              <>
                <RotateIcon className="w-5 h-5" />
                Apply Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
