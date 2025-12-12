"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from "lucide-react";

import { getAuthToken, getApiBaseUrl } from "@/lib/auth";

const API_BASE_URL = getApiBaseUrl();

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

  // Check for token on component mount
  useEffect(() => {
    const checkToken = async () => {
      setTokenLoading(true);
      setError(""); // Clear any previous errors
      const token = await getAuthToken();
      if (!token) {
        setError("Access token required. Unable to fetch authentication token. Please check your connection and try again.");
        setHasToken(false);
      } else {
        setHasToken(true);
      }
      setTokenLoading(false);
    };
    checkToken();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }
    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    // Check for token first
    const token = await getAuthToken();
    if (!token) {
      setError("Access token required. Please refresh the page to get a new token.");
      return;
    }

    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://res-to-pdf-api.vercel.app/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Validate parsed data before storing
        if (!result.parsed) {
          setError("Failed to parse resume data");
          return;
        }

        // Store parsed data in sessionStorage for next page
        sessionStorage.setItem("resumeData", JSON.stringify(result.parsed));
        router.push("/edit");
      } else {
        setError(`Error: ${result.error || "Upload failed"}`);
      }
    } catch (err) {
      setError(
        `Network Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans text-slate-900">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <nav className="w-full max-w-7xl mx-auto p-6 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            ResToPDF
          </span>
        </div>
        <div className="text-sm font-medium text-slate-500">
          v1.0.0
        </div>
      </nav>

      <main className="flex-grow z-10 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-blue-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Parser</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Transform your <br />
              <span className="text-blue-600 relative">
                Resume
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              {" "}into a PDF
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Upload your existing resume and let our advanced AI extract, format, and generate a professional, ATS-friendly PDF in seconds.
            </p>

            <div className="space-y-4">
              {[
                "Smart Information Extraction",
                "Professional Templates",
                "Instant PDF Generation"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10 relative"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Resume</h2>
              <p className="text-slate-500 text-sm">Supported format: PDF (Max 10MB)</p>
            </div>

            <div
              className={`
                        relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
                        flex flex-col items-center justify-center text-center cursor-pointer
                        ${isDragOver
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
                }
                        ${file ? "bg-blue-50/30 border-blue-200" : ""}
                    `}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileInput"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />

              <div className="z-10 transition-transform duration-300 group-hover:scale-110 mb-4">
                {file ? (
                  <FileText className="w-16 h-16 text-blue-600" />
                ) : (
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="z-10">
                {file ? (
                  <div>
                    <p className="font-semibold text-blue-700 text-lg truncate max-w-[200px] mx-auto">{file.name}</p>
                    <p className="text-sm text-blue-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-blue-400 mt-2">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-slate-700 text-lg mb-1">
                      Drop your resume here
                    </p>
                    <p className="text-sm text-slate-500">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleUpload}
              disabled={loading || tokenLoading || !hasToken || !file}
              className={`
                        w-full mt-8 py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30
                        transition-all duration-300 flex items-center justify-center space-x-2
                        ${loading || tokenLoading || !hasToken || !file
                  ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:translate-y-[-2px] hover:shadow-blue-500/50 hover:shadow-xl active:translate-y-[0px]"
                }
                    `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tokenLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Generate PDF</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {!hasToken && !tokenLoading && (
              <p className="text-xs text-center text-red-400 mt-4">
                * Authentication failed. Check console or refresh.
              </p>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="w-full text-center p-6 text-slate-400 text-sm z-10">
        &copy; {new Date().getFullYear()} ResToPDF. All rights reserved.
      </footer>
    </div>
  );
}
