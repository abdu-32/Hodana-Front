"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { FileText, UploadCloud, X, CheckCircle2, AlertCircle, FileCheck, ArrowUpRight } from "lucide-react";
import { PitchDeckFile, participantSubmissionsClient } from "../lib/participant-submissions-client";

interface PdfUploadDropzoneProps {
  value?: PitchDeckFile;
  onChange: (file?: PitchDeckFile) => void;
  maxSizeMB?: number;
}

export function PdfUploadDropzone({
  value,
  onChange,
  maxSizeMB = 25,
}: PdfUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);

    // Validate type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMsg("Invalid file format. Please upload a PDF document (.pdf).");
      return;
    }

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploaded = await participantSubmissionsClient.uploadPitchDeckPdf(
        file,
        (progress) => setUploadProgress(progress)
      );
      onChange(uploaded);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload PDF. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* If file already attached, show rich file preview card */}
      {value ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#d6e7e1] bg-white p-4 shadow-xs transition-all hover:border-[#0f6b5c]/40">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#122622] truncate">{value.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-[#16793d]">
                  <CheckCircle2 className="h-3 w-3" />
                  Attached
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#57685f]">
                {value.size} • PDF Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {value.url && (
              <a
                href={value.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#e8f3f0] px-3 py-1.5 text-xs font-bold text-[#0f6b5c] hover:bg-[#d6e7e1] transition-colors"
              >
                <span>Preview</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:text-[#c4211c] hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Card */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#0f6b5c] bg-[#e8f3f0]/50 scale-[1.01]"
              : "border-[#d6e7e1] bg-[#f3f6f4] hover:border-[#0f6b5c]/50 hover:bg-[#e8f3f0]/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs py-2">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
              <p className="text-xs font-bold text-[#122622]">Uploading Pitch Deck... {uploadProgress}%</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8f3f0]">
                <div
                  className="h-full bg-[#0f6b5c] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-[#0f6b5c] border border-[#d6e7e1]">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-[#122622]">
                  <span className="text-[#0f6b5c] underline underline-offset-2">Click to upload</span> or drag and drop your Pitch Deck PDF
                </p>
                <p className="text-[11px] font-medium text-[#57685f]">
                  PDF documents only (maximum file size: {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
