"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { resumeService, apiClient } from "@/app/api/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserDashboard() {
  useAuthGuard("User");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

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
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      apiClient.refreshTokenFromCookies();
      
      const response = await resumeService.postUpload({
        formData: { file },
      });

      console.log("Resume upload successful:", response);

      if (!response.parsed) {
        setError("Failed to parse resume data");
        return;
      }

      sessionStorage.setItem("resumeData", JSON.stringify(response.parsed));
      router.push("/user/edit");
    } catch (error: unknown) {
      console.error("Resume upload failed:", error);
      setError(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-100px)]">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Hero Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center space-x-2 bg-action/10 border border-action/20 rounded-full px-4 py-1.5 text-action text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Parser</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Transform your <br />
            <span className="text-action relative">
              Resume
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-action/30 -z-10"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </span>{" "}
            into a PDF
          </h1>

          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Upload your existing resume and let our advanced AI extract, format,
            and generate a professional, ATS-friendly PDF in seconds.
          </p>

          <div className="space-y-4">
            {[
              "Smart Information Extraction",
              "Professional Templates",
              "Instant PDF Generation",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 text-slate-700"
              >
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
                className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`
                        w-full mt-8 py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30
                        transition-all duration-300 flex items-center justify-center space-x-2
                        ${
                          loading || !file
                            ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500"
                            : "bg-action hover:bg-action/90 hover:translate-y-[-2px] hover:shadow-action/30 hover:shadow-xl active:translate-y-[0px]"
                        }
                    `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Generate PDF</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
