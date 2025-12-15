"use client";

import { getAuthToken } from "@/lib/auth";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { AlertCircle, Download, Edit3, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ResultPage() {
  const [pdfGenerated] = useState(() =>
    typeof window !== "undefined"
      ? !!sessionStorage.getItem("pdfResponse")
      : false
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("pdfBlobUrl") : null
  );
  const router = useRouter();

  useEffect(() => {
    if (pdfGenerated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [pdfGenerated]);

  const createPdfUrl = useCallback(async () => {
    try {
      const resumeData = sessionStorage.getItem("resumeData");
      if (!resumeData) return null;

      const token = await getAuthToken();
      if (!token) return null;

      const response = await fetch(
        "https://res-to-pdf-api.vercel.app/generate/pdf",
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
        return url;
      }
    } catch (err) {
      console.error("Error generating PDF preview:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    if (pdfGenerated && !pdfBlobUrl) {
      createPdfUrl().then((url) => {
        if (url) {
          setPdfBlobUrl(url);
        }
      });
    }
  }, [pdfGenerated, pdfBlobUrl, createPdfUrl]);

  const handleDownloadPDF = async () => {
    let currentUrl = pdfBlobUrl;
    if (!currentUrl) {
      currentUrl = await createPdfUrl();
      if (currentUrl) {
        setPdfBlobUrl(currentUrl);
      }
    }

    // Check again if we have the URL after attempting generation
    const storedUrl = sessionStorage.getItem("pdfBlobUrl");
    const finalUrl = currentUrl || storedUrl;

    if (finalUrl) {
      const a = document.createElement("a");
      a.href = finalUrl;
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
    <div className="flex flex-col h-full font-sans text-foreground bg-card">
      {/* PDF View Area */}
      <div className="flex-grow flex items-center justify-center p-4 pb-24 min-h-[calc(100vh-100px)]">
        {pdfGenerated && pdfBlobUrl ? (
          <div className="w-full max-w-5xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
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
                <div className="w-12 h-12 border-4 border-action/20 border-t-action rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading PDF...</p>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No PDF Generated
                </h2>
                <p className="text-muted mb-6">
                  It looks like the resume generation process was not completed.
                </p>
                <button
                  onClick={() => router.push("/user")}
                  className="bg-action text-action-foreground px-6 py-2 rounded-lg font-semibold hover:bg-action/90 transition"
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
        className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-50 p-4"
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
              onClick={() => router.push("/user/edit")}
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
