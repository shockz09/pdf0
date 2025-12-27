"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { imageToBase64, formatFileSize } from "@/lib/image-utils";
import {
  ArrowLeftIcon,
  Base64Icon,
  LoaderIcon,
  ImageIcon,
  CheckIcon,
} from "@/components/icons";

export default function ImageToBase64Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setBase64(null);
      setCopied(false);

      const url = URL.createObjectURL(selectedFile);
      setPreview(url);

      // Auto-convert
      setIsProcessing(true);
      try {
        const result = await imageToBase64(selectedFile);
        setBase64(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to convert");
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setBase64(null);
    setError(null);
    setCopied(false);
  }, [preview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleCopy = async () => {
    if (base64) {
      await navigator.clipboard.writeText(base64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyDataUrl = async () => {
    if (base64) {
      await navigator.clipboard.writeText(base64);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBase64Only = async () => {
    if (base64) {
      // Remove data:image/xxx;base64, prefix
      const base64Only = base64.split(",")[1];
      await navigator.clipboard.writeText(base64Only);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          <div className="tool-icon tool-base64">
            <Base64Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Image to Base64</h1>
            <p className="text-muted-foreground mt-1">
              Convert images to Base64 string for embedding
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!file ? (
        <div className="space-y-6">
          <FileDropzone
            accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
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
              <p className="font-bold text-foreground mb-1">When to use Base64</p>
              <p className="text-muted-foreground">
                Base64 is useful for embedding small images directly in HTML, CSS,
                or JavaScript. For large images, hosting them separately is more
                efficient.
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

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground py-4">
              <LoaderIcon className="w-4 h-4" />
              <span>Converting...</span>
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

          {base64 && (
            <div className="space-y-4">
              {/* Base64 Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="input-label">Base64 Output</label>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(base64.length)} characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={base64}
                    readOnly
                    className="input-field w-full h-32 font-mono text-xs resize-none"
                  />
                </div>
              </div>

              {/* Copy Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyDataUrl}
                  className="btn-primary flex-1"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Data URL
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyBase64Only}
                  className="btn-secondary flex-1"
                >
                  Copy Base64 Only
                </button>
              </div>

              {/* Usage Examples */}
              <div className="space-y-3 pt-4">
                <label className="input-label">Usage Examples</label>

                <div className="bg-muted/50 border-2 border-foreground p-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1">HTML</p>
                  <code className="text-xs font-mono break-all">
                    {`<img src="${base64.substring(0, 50)}..." />`}
                  </code>
                </div>

                <div className="bg-muted/50 border-2 border-foreground p-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1">CSS</p>
                  <code className="text-xs font-mono break-all">
                    {`background-image: url("${base64.substring(0, 40)}...");`}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
