"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

// Audio icons
function AudioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function TrimIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2v20M18 2v20M6 12h12" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17H5" />
      <path d="M12 12V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M12 21v-6" />
    </svg>
  );
}

function FadeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h4l3-9 6 18 3-9h4" />
    </svg>
  );
}

function ReverseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function WaveformIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h2l2-7 3 14 3-7 2 3h8" />
    </svg>
  );
}

const tools = [
  {
    name: "Trim Audio",
    description: "Cut audio to specific start and end time",
    href: "/audio/trim",
    icon: TrimIcon,
    color: "tool-audio",
  },
  {
    name: "Record",
    description: "Record audio from your microphone",
    href: "/audio/record",
    icon: MicIcon,
    color: "tool-audio",
  },
  {
    name: "Volume",
    description: "Increase or decrease audio volume",
    href: "/audio/volume",
    icon: VolumeIcon,
    color: "tool-audio",
  },
  {
    name: "Speed",
    description: "Speed up or slow down audio",
    href: "/audio/speed",
    icon: SpeedIcon,
    color: "tool-audio",
  },
  {
    name: "Fade",
    description: "Add fade in and fade out effects",
    href: "/audio/fade",
    icon: FadeIcon,
    color: "tool-audio",
  },
  {
    name: "Reverse",
    description: "Play audio backwards",
    href: "/audio/reverse",
    icon: ReverseIcon,
    color: "tool-audio",
  },
  {
    name: "Waveform",
    description: "Generate waveform image from audio",
    href: "/audio/waveform",
    icon: WaveformIcon,
    color: "tool-audio",
  },
];

export default function AudioPage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="border-b-2 border-foreground pb-16 mb-12">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="back-link mb-8">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display leading-[1.1] tracking-tight">
                noupload/
                <span className="text-primary">audio</span>
              </h1>

              <p className="text-lg text-muted-foreground mt-6 max-w-xl">
                Trim, record, adjust, and transform audio files.
                <span className="block mt-2 font-semibold text-foreground">
                  Everything happens in your browser.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="tool-card"
            >
              <div className={`tool-icon ${tool.color}`}>
                <tool.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 border-2 border-foreground p-6 bg-muted/30">
          <div className="flex gap-4">
            <AudioIcon className="w-6 h-6 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">Audio Processing Notes</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All audio is exported as WAV for maximum compatibility</li>
                <li>• Works best with files under 5 minutes (larger files use more memory)</li>
                <li>• Supported formats: MP3, WAV, OGG, M4A, WebM</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
