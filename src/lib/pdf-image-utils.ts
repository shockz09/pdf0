import { PDFDocument } from "pdf-lib";

export interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
}

// Detect if device is low-end (mobile or low memory)
function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // @ts-ignore - deviceMemory not in all browsers
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  return isMobile || lowMemory;
}

// Process pages in parallel with concurrency limit
async function processInParallel<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let completed = 0;
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await processor(items[index], index);
      completed++;
      onProgress?.(completed, items.length);
    }
  }

  // Start concurrent workers
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

export async function pdfToImages(
  file: File,
  options: {
    format?: "png" | "jpeg";
    quality?: number;
    scale?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<ConvertedImage[]> {
  const isLowEnd = isLowEndDevice();

  // Auto-adjust scale for low-end devices
  const defaultScale = isLowEnd ? 1.5 : 2;
  const { format = "png", quality = 0.92, scale = defaultScale, onProgress } = options;

  // Concurrency: 2 for low-end, 4 for high-end
  const concurrency = isLowEnd ? 2 : 4;

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const mimeType = format === "png" ? "image/png" : "image/jpeg";

  const images = await processInParallel(
    pageNumbers,
    async (pageNum) => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d")!;
      await page.render({ canvasContext: context, viewport, canvas }).promise;

      // Create blob first (needed for download)
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mimeType, quality);
      });

      // Use blob URL for preview instead of dataUrl (much faster)
      const dataUrl = URL.createObjectURL(blob);

      // Clean up canvas to free memory
      canvas.width = 0;
      canvas.height = 0;

      return {
        pageNumber: pageNum,
        dataUrl,
        blob,
      };
    },
    concurrency,
    onProgress
  );

  return images;
}

export async function imagesToPdf(
  files: File[],
  options: {
    pageSize?: "a4" | "letter" | "fit";
    margin?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<Uint8Array> {
  const { pageSize = "a4", margin = 20, onProgress } = options;

  const pdfDoc = await PDFDocument.create();

  // Page dimensions in points (72 points = 1 inch)
  const sizes = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
    fit: null as { width: number; height: number } | null,
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let image;
    const fileType = file.type.toLowerCase();

    if (fileType === "image/png") {
      image = await pdfDoc.embedPng(bytes);
    } else if (fileType === "image/jpeg" || fileType === "image/jpg") {
      image = await pdfDoc.embedJpg(bytes);
    } else {
      // Try to convert other formats using canvas
      const dataUrl = await fileToDataUrl(file);
      const convertedBytes = await dataUrlToJpegBytes(dataUrl);
      image = await pdfDoc.embedJpg(convertedBytes);
    }

    const imgWidth = image.width;
    const imgHeight = image.height;

    let pageWidth: number;
    let pageHeight: number;

    if (pageSize === "fit") {
      // Page size matches image size plus margins
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const size = sizes[pageSize]!;
      pageWidth = size.width;
      pageHeight = size.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate image dimensions to fit within page (with margins)
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    let drawWidth = imgWidth;
    let drawHeight = imgHeight;

    if (drawWidth > maxWidth || drawHeight > maxHeight) {
      const scaleX = maxWidth / drawWidth;
      const scaleY = maxHeight / drawHeight;
      const scale = Math.min(scaleX, scaleY);
      drawWidth *= scale;
      drawHeight *= scale;
    }

    // Center the image
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return pdfDoc.save();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function dataUrlToJpegBytes(dataUrl: string): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          const arrayBuffer = await blob!.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        },
        "image/jpeg",
        0.92
      );
    };
    img.src = dataUrl;
  });
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadImagesAsZip(
  images: ConvertedImage[],
  baseName: string,
  format: "png" | "jpeg"
) {
  // Download each image individually since we're avoiding additional dependencies
  const ext = format === "png" ? "png" : "jpg";
  images.forEach((img, index) => {
    setTimeout(() => {
      downloadImage(img.blob, `${baseName}_page${img.pageNumber}.${ext}`);
    }, index * 100);
  });
}
