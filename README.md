# noupload

**Free, private file tools that run entirely in your browser.**

No uploads. No servers. No tracking. Your files never leave your device.

---

## Why I Made This

I saw many other similar client-side PDF tools which wanted to serve as a privacy-first alternative to [ilovepdf](https://www.ilovepdf.com/) etc, cuz most of the stuff that ilovepdf does can be done client-side and it should be. But the other tools which did this client-side were hastily built and their design and UX weren't thought through properly—it felt weird to use them even though they came up with the concept first.

So I built my own with better design and UX which could actually be used in production as an alternative to ilovepdf for most of the functions, except some. Compression isn't the best because true PDF compression requires re-encoding images and fonts with native libraries that don't run well in browsers—so don't expect massive size reductions on image-heavy PDFs.

After some days of building noupload with just PDF tools, I was randomly researching what more stuff we could do client-side. I figured out that just like we could do most of the PDF manipulation stuff client-side, we could also do the same with images, and audio too—though audio is way heavier because FFmpeg is massive, but it still works. So I built the pages for these with many tools in them. A lot of days were spent figuring out the proper flow of everything, but they both turned out pretty well and became worthy additions to noupload. Hence, noupload became a suite, and then I added QR functionality too for people who want to generate/scan/bulk generate or custom design QR codes etc. I also added Encrypt/Decrypt PDF later after figuring out about qpdf-wasm, it's amazing, allows us to do encryption and decryption client-side with ease.

I would love if people would contribute and use this.

---

## Features

### PDF Tools

| Tool | Description |
|------|-------------|
| **Organize** | Drag & drop to reorder, add, or delete pages |
| **Merge** | Combine multiple PDFs into one |
| **Split** | Extract pages or divide into multiple files |
| **Compress** | Reduce file size (metadata removal, structure optimization) |
| **Rotate** | Rotate pages in any direction |
| **Watermark** | Add text watermarks to documents |
| **Page Numbers** | Add page numbers to your PDF |
| **Sign** | Draw or upload your signature |
| **OCR** | Extract text from scanned documents |
| **PDF → Images** | Convert pages to JPG or PNG |
| **Images → PDF** | Create a PDF from images |
| **PDF → Text** | Extract text content from PDFs |
| **Sanitize** | Remove metadata and hidden data |
| **Encrypt** | Add password protection |
| **Decrypt** | Remove password from protected PDFs |
| **Reverse Pages** | Flip the order of all pages |
| **Duplicate Pages** | Copy and append pages |
| **Delete Pages** | Remove unwanted pages |

### Image Tools

| Tool | Description |
|------|-------------|
| **Compress** | Reduce image file size |
| **Resize** | Change image dimensions |
| **Convert** | Convert between formats (PNG, JPG, WebP, etc.) |
| **Crop** | Crop images to any size |
| **Rotate** | Rotate and flip images |
| **Border** | Add borders and frames |
| **Watermark** | Add text watermarks |
| **Adjust** | Brightness, contrast, saturation |
| **Filters** | Apply image filters |
| **Strip Metadata** | Remove EXIF data |
| **To Base64** | Convert to Base64 string |
| **Screenshot** | Capture webpage screenshots |
| **Favicon Generator** | Create favicons from images |
| **HEIC → JPEG** | Convert iPhone photos |
| **Bulk Compress** | Compress multiple images |
| **Bulk Resize** | Resize multiple images |
| **Bulk Convert** | Convert multiple images |

### Audio Tools

| Tool | Description |
|------|-------------|
| **Trim** | Cut audio to specific length |
| **Convert** | Convert between formats (MP3, WAV, OGG, etc.) |
| **Merge** | Combine multiple audio files |
| **Extract** | Extract audio from video |
| **Speed** | Change playback speed |
| **Volume** | Adjust audio volume |
| **Fade** | Add fade in/out effects |
| **Normalize** | Normalize audio levels |
| **Denoise** | Reduce background noise |
| **Remove Silence** | Trim silent sections |
| **Reverse** | Reverse audio playback |
| **Waveform** | Generate waveform visualization |
| **Record** | Record audio from microphone |

### QR Code Tools

| Tool | Description |
|------|-------------|
| **Generate** | Create QR codes from text/URLs |
| **Scan** | Scan QR codes from images or camera |
| **Bulk Generate** | Create multiple QR codes at once |

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework
- [React 19](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation
- [react-pdf](https://github.com/wojtekmaj/react-pdf) (PDF.js) — PDF rendering
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR engine
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) — Audio/video processing
- [qrcode](https://github.com/soldair/node-qrcode) — QR code generation
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — QR code scanning
- [heic2any](https://github.com/nicolo-ribaudo/heic2any) — HEIC conversion
- [html-to-image](https://github.com/bubkoo/html-to-image) — Screenshot capture
- [qpdf-wasm](https://github.com/nicolo-ribaudo/qpdf-wasm) — PDF encryption/decryption

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/shockz09/noupload.git
cd noupload

# Install dependencies
bun install

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
bun run build
bun start
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE)

---

## Acknowledgments

Built with these amazing open source libraries:

- [pdf-lib](https://github.com/Hopding/pdf-lib) — PDF creation and modification
- [PDF.js](https://github.com/mozilla/pdf.js) — PDF rendering
- [Tesseract.js](https://github.com/naptha/tesseract.js) — OCR engine
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) — Audio/video processing
- [shadcn/ui](https://github.com/shadcn-ui/ui) — Beautiful UI components
- [qrcode](https://github.com/soldair/node-qrcode) — QR code generation
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — QR code scanning
- [heic2any](https://github.com/alexcorvi/heic2any) — HEIC to JPEG conversion
- [html-to-image](https://github.com/bubkoo/html-to-image) — DOM to image conversion
- [qpdf-wasm](https://github.com/neslinesli93/qpdf-wasm) — PDF encryption/decryption
