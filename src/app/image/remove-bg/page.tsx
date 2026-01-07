"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon } from "@/components/icons";
import {
	ErrorBox,
	ImageFileInfo,
	ImagePageHeader,
	ProcessButton,
	ProgressBar,
	SuccessCard,
} from "@/components/image/shared";
import { FileDropzone } from "@/components/pdf/file-dropzone";
import { useInstantMode } from "@/components/shared/InstantModeToggle";
import {
	useBackgroundRemoval,
	compositeOnColor,
	compositeOnImage,
	MODEL_DESCRIPTIONS,
	type ModelQuality,
} from "@/lib/background-removal/useBackgroundRemoval";
import { downloadImage, formatFileSize } from "@/lib/image-utils";

// Remove background icon
function RemoveBgIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="12" cy="10" r="3" />
			<path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
			<path d="M1 1l22 22" strokeWidth="2.5" />
		</svg>
	);
}

type BackgroundType = "transparent" | "color" | "image";

interface RemoveResult {
	blob: Blob;
	url: string;
	filename: string;
	originalSize: number;
}

const PRESET_COLORS = [
	"#FFFFFF",
	"#000000",
	"#EF4444",
	"#F97316",
	"#EAB308",
	"#22C55E",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
];

export default function RemoveBgPage() {
	const { isInstant, isLoaded } = useInstantMode();
	const { removeBackground, isProcessing, progress, error: bgError } = useBackgroundRemoval();

	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<RemoveResult | null>(null);
	const [modelQuality, setModelQuality] = useState<ModelQuality>("medium");

	// Background options
	const [bgType, setBgType] = useState<BackgroundType>("transparent");
	const [bgColor, setBgColor] = useState("#FFFFFF");
	const [bgImageFile, setBgImageFile] = useState<File | null>(null);
	const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

	// Foreground result (before background applied)
	const [foregroundUrl, setForegroundUrl] = useState<string | null>(null);

	const processingRef = useRef(false);
	const instantTriggeredRef = useRef(false);

	const processFile = useCallback(
		async (fileToProcess: File, model: ModelQuality = "medium") => {
			if (processingRef.current) return;
			processingRef.current = true;
			setError(null);
			setResult(null);

			try {
				const { blob, url } = await removeBackground(fileToProcess, model);
				setForegroundUrl(url);

				// Get image dimensions
				const img = new Image();
				img.src = url;
				await new Promise((resolve) => {
					img.onload = resolve;
				});
				setImageDimensions({ width: img.width, height: img.height });

				// Default to transparent
				setResult({
					blob,
					url,
					filename: fileToProcess.name.replace(/\.[^.]+$/, "_nobg.png"),
					originalSize: fileToProcess.size,
				});
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to remove background");
			} finally {
				processingRef.current = false;
			}
		},
		[removeBackground],
	);

	// Apply background when type/color/image changes
	const applyBackground = useCallback(async () => {
		if (!foregroundUrl || !imageDimensions) return;

		try {
			let finalBlob: Blob;
			let finalUrl: string;

			if (bgType === "transparent") {
				// Use original foreground
				const response = await fetch(foregroundUrl);
				finalBlob = await response.blob();
				finalUrl = foregroundUrl;
			} else if (bgType === "color") {
				finalBlob = await compositeOnColor(
					foregroundUrl,
					bgColor,
					imageDimensions.width,
					imageDimensions.height,
				);
				finalUrl = URL.createObjectURL(finalBlob);
			} else if (bgType === "image" && bgImagePreview) {
				finalBlob = await compositeOnImage(
					foregroundUrl,
					bgImagePreview,
					imageDimensions.width,
					imageDimensions.height,
				);
				finalUrl = URL.createObjectURL(finalBlob);
			} else {
				return;
			}

			setResult((prev) =>
				prev
					? {
							...prev,
							blob: finalBlob,
							url: finalUrl,
						}
					: null,
			);
		} catch (err) {
			console.error("Failed to apply background:", err);
		}
	}, [foregroundUrl, imageDimensions, bgType, bgColor, bgImagePreview]);

	// Re-apply background when options change
	useEffect(() => {
		if (foregroundUrl) {
			applyBackground();
		}
	}, [bgType, bgColor, bgImagePreview, applyBackground, foregroundUrl]);

	const handleFileSelected = useCallback(
		(files: File[]) => {
			if (files.length > 0) {
				const selectedFile = files[0];
				setFile(selectedFile);
				setError(null);
				setResult(null);
				setForegroundUrl(null);
				instantTriggeredRef.current = false;
				const url = URL.createObjectURL(selectedFile);
				setPreview(url);
			}
		},
		[],
	);

	// Instant mode
	useEffect(() => {
		if (isInstant && file && !instantTriggeredRef.current && !isProcessing && !result) {
			instantTriggeredRef.current = true;
			processFile(file, modelQuality);
		}
	}, [isInstant, file, isProcessing, result, processFile, modelQuality]);

	const handleClear = useCallback(() => {
		if (preview) URL.revokeObjectURL(preview);
		if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
		setFile(null);
		setPreview(null);
		setError(null);
		setResult(null);
		setForegroundUrl(null);
		setBgImageFile(null);
		setBgImagePreview(null);
	}, [preview, bgImagePreview]);

	const handleBgImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files[0]) {
			if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
			const url = URL.createObjectURL(files[0]);
			setBgImageFile(files[0]);
			setBgImagePreview(url);
			setBgType("image");
		}
	};

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
			if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
		};
	}, [preview, bgImagePreview]);

	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of items) {
				if (item.type.startsWith("image/")) {
					const file = item.getAsFile();
					if (file) handleFileSelected([file]);
					break;
				}
			}
		};
		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [handleFileSelected]);

	const handleProcess = async () => {
		if (!file) return;
		processFile(file, modelQuality);
	};

	const handleDownload = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (result) downloadImage(result.blob, result.filename);
	};

	const handleStartOver = () => {
		if (preview) URL.revokeObjectURL(preview);
		if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
		setFile(null);
		setPreview(null);
		setResult(null);
		setForegroundUrl(null);
		setError(null);
		setBgType("transparent");
		setBgImageFile(null);
		setBgImagePreview(null);
		instantTriggeredRef.current = false;
	};

	const displayError = error || bgError;

	if (!isLoaded) return null;

	return (
		<div className="page-enter max-w-2xl mx-auto space-y-8">
			<ImagePageHeader
				icon={<RemoveBgIcon className="w-7 h-7" />}
				iconClass="tool-remove-bg"
				title="Remove Background"
				description="Remove image backgrounds with AI"
			/>

			{result ? (
				<div className="space-y-6">
					<SuccessCard
						stampText="Removed"
						title="Background Removed!"
						downloadLabel="Download Image"
						onDownload={handleDownload}
						onStartOver={handleStartOver}
						startOverLabel="Remove Another"
					>
						<div className="relative">
							{/* Checkerboard pattern for transparency */}
							<div
								className="absolute inset-0 opacity-20"
								style={{
									backgroundImage: `
										linear-gradient(45deg, #808080 25%, transparent 25%),
										linear-gradient(-45deg, #808080 25%, transparent 25%),
										linear-gradient(45deg, transparent 75%, #808080 75%),
										linear-gradient(-45deg, transparent 75%, #808080 75%)
									`,
									backgroundSize: "20px 20px",
									backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
								}}
							/>
							<img
								src={result.url}
								alt="Result"
								className="relative max-h-64 mx-auto object-contain"
							/>
						</div>
					</SuccessCard>

					{/* Background Options */}
					<div className="border-2 border-foreground p-4 space-y-4">
						<h3 className="font-bold text-sm">Background</h3>

						{/* Type selector */}
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setBgType("transparent")}
								className={`px-3 py-2 text-sm font-medium border-2 transition-all ${
									bgType === "transparent"
										? "border-foreground bg-foreground text-background"
										: "border-muted-foreground/30 hover:border-foreground"
								}`}
							>
								Transparent
							</button>
							<button
								type="button"
								onClick={() => setBgType("color")}
								className={`px-3 py-2 text-sm font-medium border-2 transition-all ${
									bgType === "color"
										? "border-foreground bg-foreground text-background"
										: "border-muted-foreground/30 hover:border-foreground"
								}`}
							>
								Color
							</button>
							<button
								type="button"
								onClick={() => setBgType("image")}
								className={`px-3 py-2 text-sm font-medium border-2 transition-all ${
									bgType === "image"
										? "border-foreground bg-foreground text-background"
										: "border-muted-foreground/30 hover:border-foreground"
								}`}
							>
								Image
							</button>
						</div>

						{/* Color picker */}
						{bgType === "color" && (
							<div className="space-y-3">
								<div className="flex flex-wrap gap-2">
									{PRESET_COLORS.map((color) => (
										<button
											key={color}
											type="button"
											onClick={() => setBgColor(color)}
											className={`w-8 h-8 border-2 transition-all ${
												bgColor === color
													? "border-foreground scale-110"
													: "border-muted-foreground/30"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={bgColor}
										onChange={(e) => setBgColor(e.target.value)}
										className="w-10 h-10 border-2 border-foreground cursor-pointer"
									/>
									<input
										type="text"
										value={bgColor}
										onChange={(e) => setBgColor(e.target.value)}
										className="flex-1 px-3 py-2 border-2 border-foreground bg-background font-mono text-sm"
										placeholder="#FFFFFF"
									/>
								</div>
							</div>
						)}

						{/* Image upload */}
						{bgType === "image" && (
							<div className="space-y-3">
								{bgImagePreview ? (
									<div className="relative">
										<img
											src={bgImagePreview}
											alt="Background"
											className="max-h-32 mx-auto object-contain border-2 border-muted-foreground/30"
										/>
										<button
											type="button"
											onClick={() => {
												if (bgImagePreview) URL.revokeObjectURL(bgImagePreview);
												setBgImageFile(null);
												setBgImagePreview(null);
											}}
											className="absolute top-1 right-1 p-1 bg-foreground text-background text-xs font-bold"
										>
											X
										</button>
									</div>
								) : (
									<label className="block border-2 border-dashed border-muted-foreground/50 p-4 text-center cursor-pointer hover:border-foreground transition-colors">
										<input
											type="file"
											accept="image/*"
											onChange={handleBgImageSelected}
											className="hidden"
										/>
										<span className="text-sm text-muted-foreground">
											Click to upload background image
										</span>
									</label>
								)}
							</div>
						)}
					</div>
				</div>
			) : !file ? (
				<div className="space-y-6">
					<FileDropzone
						accept=".jpg,.jpeg,.png,.webp"
						multiple={false}
						onFilesSelected={handleFileSelected}
						title="Drop your image here"
						subtitle="or click to browse · Ctrl+V to paste"
					/>

					{/* Model Quality Selector */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-foreground">
							Quality
						</label>
						<div className="grid grid-cols-2 gap-3">
							{(["medium", "high"] as ModelQuality[]).map((quality) => (
								<button
									key={quality}
									type="button"
									onClick={() => setModelQuality(quality)}
									className={`p-3 rounded-lg border-2 transition-all text-left ${
										modelQuality === quality
											? "border-primary bg-primary/5"
											: "border-border hover:border-muted-foreground/50"
									}`}
								>
									<div className="font-medium capitalize text-sm">
										{quality}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										{quality === "medium" && "Faster, good quality"}
										{quality === "high" && "Slower, best quality"}
									</div>
								</button>
							))}
						</div>
						<p className="text-xs text-muted-foreground">
							{MODEL_DESCRIPTIONS[modelQuality]}
						</p>
					</div>

					<div className="info-box">
						<svg
							aria-hidden="true"
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
							<p className="font-bold text-foreground mb-1">
								{isInstant ? "Instant removal" : "AI-powered background removal"}
							</p>
							<p className="text-muted-foreground">
								{isInstant
									? "Drop an image and the background will be removed automatically."
									: "Uses AI to detect and remove backgrounds. Model downloads once and is cached."}
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-6">
					{preview && (
						<div className="border-2 border-foreground p-4 bg-muted/30">
							<img
								src={preview}
								alt="Preview"
								className="max-h-64 mx-auto object-contain"
							/>
						</div>
					)}

					<ImageFileInfo
						file={file}
						fileSize={formatFileSize(file.size)}
						onClear={handleClear}
						icon={<ImageIcon className="w-5 h-5" />}
					/>

					{/* Model Quality Selector */}
					{!isProcessing && (
						<div className="space-y-3">
							<label className="text-sm font-medium text-foreground">
								Quality
							</label>
							<div className="grid grid-cols-2 gap-3">
								{(["medium", "high"] as ModelQuality[]).map((quality) => (
									<button
										key={quality}
										type="button"
										onClick={() => setModelQuality(quality)}
										className={`p-3 rounded-lg border-2 transition-all text-left ${
											modelQuality === quality
												? "border-primary bg-primary/5"
												: "border-border hover:border-muted-foreground/50"
										}`}
									>
										<div className="font-medium capitalize text-sm">
											{quality}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{quality === "medium" && "Faster, good quality"}
											{quality === "high" && "Slower, best quality"}
										</div>
									</button>
								))}
							</div>
						</div>
					)}

					{displayError && <ErrorBox message={displayError} />}
					{isProcessing && (
						<ProgressBar progress={-1} label={progress || "Processing..."} />
					)}

					<ProcessButton
						onClick={handleProcess}
						isProcessing={isProcessing}
						processingLabel={progress || "Processing..."}
						icon={<RemoveBgIcon className="w-5 h-5" />}
						label="Remove Background"
					/>
				</div>
			)}
		</div>
	);
}
