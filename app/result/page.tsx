"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, getApiBaseUrl } from "@/lib/auth";
import { motion } from "framer-motion";
import {
  Download,
  RotateCcw,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ResultPage() {
  const [pdfGenerated] = useState(() => !!sessionStorage.getItem("pdfResponse"));
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(() => sessionStorage.getItem("pdfBlobUrl"));
  const router = useRouter();

  useEffect(() => {
    if (pdfGenerated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [pdfGenerated]);

  const generatePdfBlob = async () => {
    if (pdfBlobUrl) return;

    try {
      const resumeData = sessionStorage.getItem("resumeData");
      if (!resumeData) return;

      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(
        `https://res-to-pdf-api.vercel.app/generate/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: resumeData,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        sessionStorage.setItem("pdfBlobUrl", url);
        setPdfBlobUrl(url);
      }
    } catch (err) {
      console.error("Error generating PDF preview:", err);
    }
  };

  useEffect(() => {
    if (pdfGenerated && !pdfBlobUrl) {
      generatePdfBlob();
    }
  }, [pdfGenerated, pdfBlobUrl]);

  const handleDownloadPDF = async () => {
    if (!pdfBlobUrl) {
      await generatePdfBlob();
    }

    // Check again if we have the URL after attempting generation
    const currentUrl = sessionStorage.getItem("pdfBlobUrl") || pdfBlobUrl;

    if (currentUrl) {
      const a = document.createElement("a");
      a.href = currentUrl;
      a.download = `resume_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Unable to generate PDF for download. Please try again.");
    }
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    // Revoke the stored PDF blob URL if exists
    if (pdfBlobUrl) {
      window.URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    router.push("/");
  };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">

      {/* PDF View Area */}
      <div className="flex-grow flex items-center justify-center p-4 pb-24 h-screen">
        {pdfGenerated && pdfBlobUrl ? (
          <div className="w-full max-w-5xl h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full"
              title="Generated Resume PDF"
            />
          </div>
        ) : (
          <div className="text-center p-10">
            {pdfGenerated ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading PDF...</p>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No PDF Generated</h2>
                <p className="text-slate-500 mb-6">It looks like the resume generation process wasn't completed.</p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Navbar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-50 p-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleStartOver}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
              New
            </button>
            <button
              onClick={() => router.push("/edit")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </motion.div>

    </div>
  );
}
