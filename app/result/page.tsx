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

  const handleDownloadPDF = async () => {
    // If we have a stored PDF blob URL, use it directly
    if (pdfBlobUrl) {
      const a = document.createElement("a");
      a.href = pdfBlobUrl;
      a.download = `resume_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      // Fallback: Fetch the PDF from your API if blob URL wasn't stored
      const resumeData = sessionStorage.getItem("resumeData");
      if (!resumeData) {
        alert("No resume data found");
        return;
      }

      // Get authentication token
      const token = await getAuthToken();
      if (!token) {
        alert("Access token required. Please refresh the page to get a new token.");
        return;
      }

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

        // Store the blob URL for future downloads
        sessionStorage.setItem("pdfBlobUrl", url);
        setPdfBlobUrl(url);

        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download PDF");
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10 relative z-10"
      >
        {pdfGenerated ? (
          <>
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 relative"
              >
                <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-75"></div>
                <CheckCircle2 className="w-12 h-12 text-green-600 relative z-10" />
              </motion.div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                Success!
              </h1>
              <p className="text-slate-500 text-lg">
                Your resume PDF has been generated successfully.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Ready for Download</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Your professional resume is ready. Download it now to apply for your dream job!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => router.push("/edit")}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={handleStartOver}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                No Resume Generated
              </h1>
              <p className="text-slate-500">
                It seems you haven't completed the process yet.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/edit")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
              >
                Go to Edit
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleStartOver}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-6 rounded-xl transition"
              >
                Upload New Resume
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
