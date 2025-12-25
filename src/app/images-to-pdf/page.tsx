"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { imagesToPdf } from "@/lib/pdf-image-utils";
import { downloadBlob } from "@/lib/pdf-utils";
import { ArrowLeftIcon, FileIcon, DownloadIcon, LoaderIcon, XIcon, GripIcon } from "@/components/icons";

interface ImageItem {
  file: File;
  id: string;
  preview: string;
}

interface ConvertResult {
  data: Uint8Array;
  filename: string;
  pageCount: number;
}

export default function ImagesToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newItems.push({
        file,
        id: crypto.randomUUID(),
        preview,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
    setError(null);
    setResult(null);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages;
    });
  }, []);

  const handleClear = useCallback(() => {
    setImages([]);
    setError(null);
    setResult(null);
  }, []);

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const data = await imagesToPdf(
        images.map((i) => i.file),
        {
          pageSize,
          onProgress: (current, total) => {
            setProgress(Math.round((current / total) * 100));
          },
        }
      );

      setResult({
        data,
        filename: "images_combined.pdf",
        pageCount: images.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PDF");
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
    setImages([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== toIndex) {
      handleReorder(fromIndex, toIndex);
    }
    setDraggingId(null);
  };

  return (
    <div className="page-enter max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-images-to-pdf">
            <FileIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">Images to PDF</h1>
            <p className="text-muted-foreground mt-1">
              Combine multiple images into a single PDF
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {result ? (
        <div className="animate-fade-up max-w-2xl mx-auto">
          <div className="success-card">
            <div className="success-stamp">
              <span className="success-stamp-text">Complete</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display">PDF Created!</h2>
              <p className="text-muted-foreground">
                {result.pageCount} images combined into one PDF
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={handleDownload} className="btn-success flex-1">
                <DownloadIcon className="w-5 h-5" />
                Download PDF
              </button>
              <button type="button" onClick={handleStartOver} className="btn-secondary flex-1">
                Create Another PDF
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dropzone */}
          <FileDropzone
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
            multiple
            onFilesSelected={handleFilesSelected}
            maxFiles={100}
            title="Drop your images here"
            subtitle="JPG, PNG, GIF, WebP, BMP"
          />

          {images.length > 0 && (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border-2 border-foreground">
                <div className="flex items-center gap-3">
                  <div className="file-number">{images.length}</div>
                  <span className="font-bold">images selected</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group border-2 border-foreground overflow-hidden cursor-move transition-all
                      ${draggingId === image.id ? "opacity-50 scale-95" : ""}
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, image.id)}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full aspect-square object-cover"
                      draggable={false}
                    />
                    {/* Index badge */}
                    <div className="absolute top-1 left-1 file-number text-xs">
                      {index + 1}
                    </div>
                    {/* Drag handle */}
                    <div className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripIcon className="w-4 h-4 text-white drop-shadow" />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(image.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center font-medium">
                Drag images to reorder them
              </p>

              {/* Page Size Options */}
              <div className="p-6 bg-card border-2 border-foreground space-y-3">
                <label className="input-label">Page Size</label>
                <div className="flex gap-2">
                  {(["a4", "letter", "fit"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size)}
                      className={`px-6 py-3 border-2 font-bold transition-all flex-1
                        ${pageSize === size
                          ? "bg-primary border-foreground text-white"
                          : "bg-muted border-foreground hover:bg-accent"
                        }
                      `}
                    >
                      {size === "a4" ? "A4" : size === "letter" ? "Letter" : "Fit to Image"}
                    </button>
                  ))}
                </div>
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
                    <span>Creating PDF... {progress}%</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={isProcessing || images.length === 0}
                className="btn-primary w-full max-w-md mx-auto block"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="w-5 h-5" />
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <FileIcon className="w-5 h-5" />
                    Create PDF from {images.length} Images
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
