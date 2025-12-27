"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import {
  stripMetadata,
  downloadImage,
  formatFileSize,
  getOutputFilename,
} from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  MetadataIcon,
  DownloadIcon,
  LoaderIcon,
  ImageIcon,
  ShieldIcon,
} from "@/components/icons";

interface StripResult {
  blob: Blob;
  filename: string;
  originalSize: number;
}

export default function StripMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StripResult | null>(null);

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

  const handleStrip = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const stripped = await stripMetadata(file);

      setResult({
        blob: stripped,
        filename: getOutputFilename(file.name, undefined, "_clean"),
        originalSize: file.size,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to strip metadata"
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
          <div className="tool-icon tool-strip-metadata">
            <MetadataIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Strip Metadata</h1>
            <p className="text-muted-foreground mt-1">
              Remove EXIF data and GPS location from photos
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        <div className="animate-fade-up">
          <div className="success-card">
            <div className="success-stamp">
              <span className="success-stamp-text">Clean</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-display">Metadata Removed!</h2>

              {/* What was removed */}
              <div className="bg-muted/50 border-2 border-foreground p-4 text-left">
                <p className="font-bold text-sm mb-2">Removed data includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Camera make and model</li>
                  <li>• GPS coordinates and location</li>
                  <li>• Date and time taken</li>
                  <li>• Software used</li>
                  <li>• Other EXIF metadata</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                New file size: {formatFileSize(result.blob.size)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-success flex-1"
              >
                <DownloadIcon className="w-5 h-5" />
                Download Clean Image
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="btn-secondary flex-1"
              >
                Clean Another
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
            <ShieldIcon className="w-5 h-5 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">Protect your privacy</p>
              <p className="text-muted-foreground">
                Photos from smartphones contain hidden data like GPS location,
                device info, and timestamps. Remove this data before sharing
                images online.
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

          {/* Warning */}
          <div className="bg-[#FEF3C7] border-2 border-foreground p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="text-sm">
                <p className="font-bold text-[#92400E] mb-1">What will be removed</p>
                <p className="text-[#92400E]/80">
                  All EXIF metadata including camera info, GPS location, date
                  taken, and any other embedded data. The image quality remains
                  unchanged.
                </p>
              </div>
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
              <span>Removing metadata...</span>
            </div>
          )}

          <button
            onClick={handleStrip}
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
                <ShieldIcon className="w-5 h-5" />
                Remove All Metadata
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
