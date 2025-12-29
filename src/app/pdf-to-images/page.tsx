"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { pdfToImages, downloadImagesAsZip, downloadImage, ConvertedImage } from "@/lib/pdf-image-utils";
import { ImageIcon, DownloadIcon, LoaderIcon } from "@/components/icons";
import { PdfPageHeader, ErrorBox } from "@/components/pdf/shared";
import { useInstantMode } from "@/components/shared/InstantModeToggle";

export default function PdfToImagesPage() {
  const { isInstant, isLoaded } = useInstantMode();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const processingRef = useRef(false);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.dataUrl));
    };
  }, [images]);

  // Auto-process when file is selected (default: JPEG medium quality)
  const processFile = useCallback(async (fileToProcess: File) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setImages([]);

    try {
      const result = await pdfToImages(fileToProcess, {
        format: "jpeg",
        quality: 0.85,
        scale: 1.5,
        onProgress: (current, total) => {
          setProgress(Math.round((current / total) * 100));
        },
      });
      setImages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF");
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, []);

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      // Cleanup previous images
      images.forEach((img) => URL.revokeObjectURL(img.dataUrl));
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setImages([]);
      // Auto-process if instant mode is on
      if (isInstant) {
        processFile(selectedFile);
      }
    }
  }, [images, processFile, isInstant]);

  const handleDownloadAll = () => {
    if (file && images.length > 0) {
      const baseName = file.name.replace(".pdf", "");
      downloadImagesAsZip(images, baseName, "jpeg");
    }
  };

  const handleDownloadSingle = (image: ConvertedImage) => {
    if (file) {
      const baseName = file.name.replace(".pdf", "");
      downloadImage(image.blob, `${baseName}_page${image.pageNumber}.jpg`);
    }
  };

  const handleStartOver = () => {
    images.forEach((img) => URL.revokeObjectURL(img.dataUrl));
    setFile(null);
    setImages([]);
    setError(null);
    setProgress(0);
  };

  if (!isLoaded) return null;

  return (
    <div className="page-enter max-w-5xl mx-auto space-y-8">
      <PdfPageHeader
        icon={<ImageIcon className="w-7 h-7" />}
        iconClass="tool-pdf-to-images"
        title="PDF to Images"
        description="Convert each page to high-quality images"
      />

      {images.length > 0 ? (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border-2 border-foreground">
            <div className="flex items-center gap-3">
              <div className="file-number">{images.length}</div>
              <span className="font-bold">images generated</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadAll} className="btn-success">
                <DownloadIcon className="w-5 h-5" />
                Download All
              </button>
              <button onClick={handleStartOver} className="btn-secondary">
                Start Over
              </button>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.pageNumber}
                className="group relative bg-white border-2 border-foreground overflow-hidden"
              >
                <img
                  src={image.dataUrl}
                  alt={`Page ${image.pageNumber}`}
                  className="w-full h-auto block"
                />
                <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDownloadSingle(image)}
                    className="px-4 py-2 bg-white text-foreground font-bold text-sm border-2 border-white hover:bg-accent transition-colors"
                  >
                    Download
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-foreground text-white text-xs font-bold py-1 text-center">
                  Page {image.pageNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isProcessing ? (
        <div className="max-w-2xl mx-auto border-2 border-foreground p-12 bg-card">
          <div className="flex flex-col items-center justify-center gap-4">
            <LoaderIcon className="w-8 h-8 animate-spin" />
            <div className="text-center">
              <p className="font-bold">Converting pages...</p>
              <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>
            <div className="w-full max-w-xs h-2 bg-muted border-2 border-foreground">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <ErrorBox message={error} />
          <button onClick={handleStartOver} className="btn-secondary w-full">
            Try Again
          </button>
        </div>
      ) : !file ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileDropzone
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Drop your PDF file here"
            subtitle="or click to browse"
          />

          <div className="info-box">
            <ImageIcon className="w-5 h-5 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">{isInstant ? "Instant conversion" : "Manual mode"}</p>
              <p className="text-muted-foreground">
                {isInstant
                  ? "Drop a PDF and all pages will be converted to JPEG images automatically."
                  : "Drop a PDF, then click to convert all pages to images."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-2 border-foreground p-4 bg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={handleStartOver} className="btn-secondary text-sm shrink-0">Clear</button>
          </div>

          <button onClick={() => processFile(file)} disabled={isProcessing} className="btn-primary w-full">
            <ImageIcon className="w-5 h-5" />Convert to Images
          </button>
        </div>
      )}
    </div>
  );
}
