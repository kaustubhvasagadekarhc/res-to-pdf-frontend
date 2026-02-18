"use client";

import { Download, X } from "lucide-react";
import { useEffect } from "react";

interface ViewPdfModalProps {
  isOpen: boolean;
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
}

export const ViewPdfModal = ({ isOpen, pdfUrl, fileName, onClose }: ViewPdfModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">{fileName}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="p-2 hover:bg-gray-200 rounded-sm transition-colors" title="Download PDF">
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-sm transition-colors" title="Close">
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
        <iframe src={pdfUrl} className="w-full h-[calc(100%-60px)] border-0" title={fileName} />
      </div>
    </div>
  );
};
