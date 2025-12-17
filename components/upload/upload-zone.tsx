"use client";

import { getAuthToken } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UploadZone() {
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
        setError(
          "Access token required. Unable to fetch authentication token. Please check your connection and try again."
        );
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
      setError(
        "Access token required. Please refresh the page to get a new token."
      );
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

      // Using hardcoded URL as in original code, but could be improved
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

        // Redirect to Edit page (Draft)
        router.push("/user/edit/draft");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className=" backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10 relative max-w-2xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Upload Resume
        </h2>
        <p className="text-slate-500 text-sm">
          Supported format: PDF (Max 10MB)
        </p>
      </div>

      <div
        className={`
                        relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
                        flex flex-col items-center justify-center text-center cursor-pointer
                        ${
                          isDragOver
                            ? "border-action bg-action/10 scale-[1.02]"
                            : "border-slate-300 hover:border-action/40 hover:bg-slate-50/50"
                        }
                        ${file ? "bg-action/20 border-action/30" : ""}
                    `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
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
            <FileText className="w-16 h-16 text-action" />
          ) : (
            <div className="bg-action/10 p-4 rounded-full">
              <Upload className="w-8 h-8 text-action" />
            </div>
          )}
        </div>

        <div className="z-10">
          {file ? (
            <div>
              <p className="font-semibold text-action text-lg truncate max-w-[200px] mx-auto">
                {file.name}
              </p>
              <p className="text-sm text-action/80 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-action/60 mt-2">
                Click to change file
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-700 text-lg mb-1">
                Drop your resume here
              </p>
              <p className="text-sm text-slate-500">or click to browse</p>
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
            className="mt-6 bg-[var(--danger-100)] border border-[#fecaca] text-[var(--danger-800)] p-4 rounded-xl flex items-start space-x-3"
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
                        w-full mt-8 py-4 px-6 rounded-xl font-bold text-white shadow-lg
                        transition-all duration-300 flex items-center justify-center space-x-2
                        ${
                          loading || tokenLoading || !hasToken || !file
                            ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500"
                            : "bg-action hover:bg-action/90 hover:translate-y-[-2px] hover:shadow-lg active:translate-y-[0px]"
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
        <p className="text-xs text-center text-[var(--danger-800)] mt-4">
          * Authentication failed. Check console or refresh.
        </p>
      )}
    </motion.div>
  );
}
