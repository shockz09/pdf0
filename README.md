# PDF0

**Free, private PDF tools that run entirely in your browser.**

No uploads. No servers. No tracking. Your files never leave your device.

---

## Why I Built This

I've always been frustrated with online PDF tools. Services like ilovepdf are great, but they require you to upload your files to their servers. For sensitive documents, that's a dealbreaker.

The thing is—most of what these tools do can be done entirely in the browser. Merging PDFs, rotating pages, adding watermarks... none of this needs a server.

So I looked for client-side alternatives. They exist, but honestly? They felt half-baked. Hastily thrown together with clunky interfaces that made me not want to use them, even though the privacy concept was solid. The UX wasn't thought through. It felt like proof-of-concepts rather than actual tools.

So I built my own.

PDF0 is designed to be a real, production-ready alternative to ilovepdf—with a clean interface that doesn't feel like an afterthought. It handles most common PDF operations completely offline in your browser.

**One caveat:** Compression isn't as aggressive as server-side tools. That's because true PDF compression requires re-encoding images and fonts, which needs heavy native libraries that don't run well in browsers. PDF0's compression removes metadata and optimizes structure, but don't expect 90% size reductions on image-heavy PDFs.

I'd love for people to use this, break it, and contribute. PRs are welcome.

---

## Features

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

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework
- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR engine
- [Tailwind CSS](https://tailwindcss.com/) — Styling

## Getting Started

```bash
# Clone the repo
git clone https://github.com/shockz09/pdf0.git
cd pdf0

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

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE)

## Acknowledgments

Built with these open source libraries:
- [pdf-lib](https://github.com/Hopding/pdf-lib)
- [PDF.js](https://github.com/nicolo-ribaudo/pdfjs-dist)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
