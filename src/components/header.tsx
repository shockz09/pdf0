"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isImage = pathname?.startsWith("/image");

  return (
    <header className="header-main sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href={isImage ? "/image" : "/"} className="header-logo">
          noupload/<span>{isImage ? "image" : "pdf"}</span>
        </a>
      </div>
    </header>
  );
}
