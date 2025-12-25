import { PDFDocument } from "pdf-lib";

export interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
}

export async function pdfToImages(
  file: File,
  options: {
    format?: "png" | "jpeg";
    quality?: number; // 0-1 for jpeg
    scale?: number; // 1 = 72 DPI, 2 = 144 DPI, etc.
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<ConvertedImage[]> {
  const { format = "png", quality = 0.92, scale = 2, onProgress } = options;

  // Dynamically import pdf.js only on client side
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const images: ConvertedImage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d")!;
    await page.render({ canvasContext: context, viewport, canvas }).promise;

    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, quality);
    });

    images.push({
      pageNumber: i,
      dataUrl,
      blob,
    });

    if (onProgress) {
      onProgress(i, totalPages);
    }
  }

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
