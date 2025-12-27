"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import {
  generateQRDataURL,
  generateQRBlob,
  downloadQR,
  generateWifiString,
  generateEmailString,
  generateSmsString,
  generatePhoneString,
  QRDataType,
  WifiData,
} from "@/lib/qr-utils";
import {
  ArrowLeftIcon,
  DownloadIcon,
  LoaderIcon,
} from "@/components/icons";

// QR Icon component
function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type Tab = "generate" | "scan";

const dataTypes: { value: QRDataType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "url", label: "URL" },
  { value: "wifi", label: "WiFi" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
];

const wifiEncryptions = [
  { value: "WPA", label: "WPA/WPA2" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "None" },
];

export default function QRPage() {
  const [tab, setTab] = useState<Tab>("generate");

  // Generate state
  const [dataType, setDataType] = useState<QRDataType>("text");
  const [textValue, setTextValue] = useState("");
  const [urlValue, setUrlValue] = useState("https://");
  const [phoneValue, setPhoneValue] = useState("");
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" });
  const [smsData, setSmsData] = useState({ phone: "", message: "" });
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner";

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Get the data string based on type
  const getDataString = useCallback((): string => {
    switch (dataType) {
      case "text":
        return textValue;
      case "url":
        return urlValue;
      case "wifi":
        return generateWifiString(wifiData);
      case "email":
        return generateEmailString(emailData);
      case "phone":
        return generatePhoneString(phoneValue);
      case "sms":
        return generateSmsString(smsData);
      default:
        return "";
    }
  }, [dataType, textValue, urlValue, wifiData, emailData, phoneValue, smsData]);

  // Check if input is valid
  const isInputValid = useCallback((): boolean => {
    switch (dataType) {
      case "text":
        return textValue.trim().length > 0;
      case "url":
        return urlValue.length > 8; // more than "https://"
      case "wifi":
        return wifiData.ssid.trim().length > 0;
      case "email":
        return emailData.to.trim().length > 0;
      case "phone":
        return phoneValue.trim().length > 0;
      case "sms":
        return smsData.phone.trim().length > 0;
      default:
        return false;
    }
  }, [dataType, textValue, urlValue, wifiData, emailData, phoneValue, smsData]);

  // Generate QR code
  const handleGenerate = async () => {
    if (!isInputValid()) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const data = getDataString();
      const dataUrl = await generateQRDataURL(data, { width: 400 });
      setQrImage(dataUrl);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download QR code
  const handleDownload = async () => {
    if (!qrImage) return;

    try {
      const data = getDataString();
      const blob = await generateQRBlob(data, { width: 800 });
      downloadQR(blob, "qrcode.png");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Start scanning
  const startScanning = async () => {
    setScanError(null);
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          html5QrCode.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {} // Ignore errors during scanning
      );

      setIsScanning(true);
    } catch (err) {
      setScanError(
        err instanceof Error
          ? err.message
          : "Failed to access camera. Please allow camera permissions."
      );
    }
  };

  // Stop scanning
  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore errors
      }
    }
    setIsScanning(false);
  };

  // Copy scan result
  const handleCopy = async () => {
    if (scanResult) {
      await navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if result is a URL
  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Tools
        </Link>

        <div className="flex items-center gap-5">
          <div className="tool-icon tool-qr">
            <QRIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-display">QR Code</h1>
            <p className="text-muted-foreground mt-1">
              Generate and scan QR codes
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-foreground">
        <button
          onClick={() => {
            setTab("generate");
            if (isScanning) stopScanning();
          }}
          className={`flex-1 px-4 py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            tab === "generate"
              ? "bg-foreground text-background"
              : "hover:bg-muted"
          }`}
        >
          <QRIcon className="w-4 h-4" />
          Generate
        </button>
        <button
          onClick={() => setTab("scan")}
          className={`flex-1 px-4 py-3 font-bold text-sm flex items-center justify-center gap-2 border-l-2 border-foreground transition-colors ${
            tab === "scan"
              ? "bg-foreground text-background"
              : "hover:bg-muted"
          }`}
        >
          <ScanIcon className="w-4 h-4" />
          Scan
        </button>
      </div>

      {/* Generate Tab */}
      {tab === "generate" && (
        <div className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-3">
            <label className="input-label">Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {dataTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setDataType(type.value);
                    setQrImage(null);
                  }}
                  className={`px-3 py-2 text-xs font-bold border-2 border-foreground transition-colors ${
                    dataType === type.value
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {dataType === "text" && (
              <div className="space-y-2">
                <label className="input-label">Text</label>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter any text..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            )}

            {dataType === "url" && (
              <div className="space-y-2">
                <label className="input-label">URL</label>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com"
                  className="input-field w-full"
                />
              </div>
            )}

            {dataType === "wifi" && (
              <>
                <div className="space-y-2">
                  <label className="input-label">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) =>
                      setWifiData({ ...wifiData, ssid: e.target.value })
                    }
                    placeholder="MyWiFiNetwork"
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label">Password</label>
                  <input
                    type="text"
                    value={wifiData.password}
                    onChange={(e) =>
                      setWifiData({ ...wifiData, password: e.target.value })
                    }
                    placeholder="WiFi password"
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label">Security</label>
                  <div className="flex gap-2">
                    {wifiEncryptions.map((enc) => (
                      <button
                        key={enc.value}
                        onClick={() =>
                          setWifiData({
                            ...wifiData,
                            encryption: enc.value as WifiData["encryption"],
                          })
                        }
                        className={`px-4 py-2 text-sm font-bold border-2 border-foreground transition-colors ${
                          wifiData.encryption === enc.value
                            ? "bg-foreground text-background"
                            : "hover:bg-muted"
                        }`}
                      >
                        {enc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiData.hidden}
                    onChange={(e) =>
                      setWifiData({ ...wifiData, hidden: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-foreground"
                  />
                  <span className="text-sm font-medium">Hidden network</span>
                </label>
              </>
            )}

            {dataType === "email" && (
              <>
                <div className="space-y-2">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) =>
                      setEmailData({ ...emailData, to: e.target.value })
                    }
                    placeholder="hello@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label">Subject (optional)</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData({ ...emailData, subject: e.target.value })
                    }
                    placeholder="Email subject"
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label">Body (optional)</label>
                  <textarea
                    value={emailData.body}
                    onChange={(e) =>
                      setEmailData({ ...emailData, body: e.target.value })
                    }
                    placeholder="Email body..."
                    className="input-field w-full h-20 resize-none"
                  />
                </div>
              </>
            )}

            {dataType === "phone" && (
              <div className="space-y-2">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="+1234567890"
                  className="input-field w-full"
                />
              </div>
            )}

            {dataType === "sms" && (
              <>
                <div className="space-y-2">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    value={smsData.phone}
                    onChange={(e) =>
                      setSmsData({ ...smsData, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label">Message (optional)</label>
                  <textarea
                    value={smsData.message}
                    onChange={(e) =>
                      setSmsData({ ...smsData, message: e.target.value })
                    }
                    placeholder="Your message..."
                    className="input-field w-full h-20 resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {generateError && (
            <div className="error-box animate-shake">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{generateError}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!isInputValid() || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                Generating...
              </>
            ) : (
              <>
                <QRIcon className="w-5 h-5" />
                Generate QR Code
              </>
            )}
          </button>

          {/* QR Code Result */}
          {qrImage && (
            <div className="animate-fade-up space-y-4">
              <div className="border-2 border-foreground p-6 bg-white flex items-center justify-center">
                <img src={qrImage} alt="QR Code" className="max-w-full" />
              </div>
              <button onClick={handleDownload} className="btn-success w-full">
                <DownloadIcon className="w-5 h-5" />
                Download QR Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scan Tab */}
      {tab === "scan" && (
        <div className="space-y-6">
          {!scanResult ? (
            <>
              {/* Scanner Container */}
              <div
                id={scannerContainerId}
                className="border-2 border-foreground bg-black min-h-[300px] flex items-center justify-center"
              >
                {!isScanning && (
                  <p className="text-muted-foreground text-sm">
                    Camera preview will appear here
                  </p>
                )}
              </div>

              {scanError && (
                <div className="error-box animate-shake">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="font-medium">{scanError}</span>
                </div>
              )}

              <button
                onClick={isScanning ? stopScanning : startScanning}
                className={isScanning ? "btn-secondary w-full" : "btn-primary w-full"}
              >
                {isScanning ? (
                  <>
                    <LoaderIcon className="w-5 h-5" />
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <ScanIcon className="w-5 h-5" />
                    Start Camera
                  </>
                )}
              </button>

              <div className="info-box">
                <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <div className="text-sm">
                  <p className="font-bold text-foreground mb-1">Tip</p>
                  <p className="text-muted-foreground">
                    Point your camera at a QR code. Works best in good lighting.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-fade-up space-y-6">
              <div className="success-card">
                <div className="success-stamp">
                  <span className="success-stamp-text">Scanned</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div className="space-y-4 mb-6">
                  <h2 className="text-3xl font-display">QR Code Found!</h2>
                </div>

                <div className="bg-background border-2 border-foreground p-4 mb-6">
                  <p className="text-sm font-mono break-all">{scanResult}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isUrl(scanResult) && (
                    <a
                      href={scanResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-success flex-1 text-center"
                    >
                      Open Link
                    </a>
                  )}
                  <button
                    onClick={handleCopy}
                    className={`${isUrl(scanResult) ? "btn-secondary" : "btn-success"} flex-1`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-5 h-5" />
                        Copy Text
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setScanResult(null);
                  setScanError(null);
                }}
                className="btn-secondary w-full"
              >
                Scan Another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
