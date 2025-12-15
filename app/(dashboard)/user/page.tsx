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
    <div className="min-h-[calc(100vh-100px)] p-4 flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-rose-50/30">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Text & Video (Span 7) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-8"
        >
          

          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Transform your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 relative">
              Resume
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-indigo-600/30 -z-10"
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

          

          

          {/* Feature Video with Creative Text Overlay */}
          <div className="relative mt-12 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 ring-1 ring-slate-900/5 group h-[320px]">
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10" />
             
             {/* Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            >
              <source src="/dashboard gif.mp4" type="video/mp4" />
            </video>

            {/* Creative Text Overlay */}
            {/* <div className="absolute bottom-6 left-6 right-6 z-20">
                 <div className="bg-white/10 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg transform transition-all duration-500 hover:bg-white/80 hover:scale-[1.02]">
                    <p className="text-lg font-medium text-slate-800 leading-relaxed text-center">
                        Upload your existing resume and let our <span className="text-indigo-600 font-bold bg-indigo-50/80 px-1 rounded-md">advanced AI</span> extract, format,
                        and generate a professional PDF in seconds.
                    </p>
                 </div>
            </div> */}
          </div>
        </motion.div>

        {/* Right Column: Upload Card (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 bg-white/30 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 p-8 relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
        >
          <div className="mb-8 ">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Upload Resume
            </h2>
            <p className="text-slate-500">
              Supported format: PDF (Max 10MB)
            </p>
          </div>

          <div
            className={`
                        relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-in-out
                        flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
                        ${
                          isDragOver
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-slate-300/60 hover:border-indigo-500/50 hover:bg-white/40"
                        }
                        ${file ? "bg-indigo-50/50 border-indigo-500/50" : ""}
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

            <div className="z-10 transition-transform duration-300 group-hover:scale-110 mb-6 relative">
              <div className="absolute inset-0 bg-indigo-500/0 blur-2xl rounded-full" />
              {file ? (
                <FileText className="w-20 h-20 text-indigo-600 relative" />
              ) : (
                <div className="bg-white p-5 rounded-2xl shadow-sm relative">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
              )}
            </div>

            <div className="z-10 ">
              {file ? (
                <div>
                  <p className="font-semibold text-indigo-900 text-lg truncate max-w-[200px] mx-auto">
                    {file.name}
                  </p>
                  <p className="text-sm text-indigo-600/80 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button className="mt-4 text-xs font-medium text-indigo-600 bg-indigo-100/50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                    Change File
                  </button>
                </div>
              ) : ( 
                <div className="space-y-2 ">
                  <p className="font-bold text-slate-700 text-xl">
                    Drop your resume here
                  </p>
                  <p className="text-sm text-slate-500 font-medium">or click to browse</p>
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
                className="mt-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 text-rose-700 p-4 rounded-2xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`
                        w-full mt-8 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20
                        transition-all duration-300 flex items-center justify-center space-x-2
                        ${
                          loading || !file
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
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
