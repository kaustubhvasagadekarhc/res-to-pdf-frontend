"use client";

import { apiClient, resumeService } from "@/app/api/client";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadPage() {
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
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden ">
      {/* Designer Background Blobs */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)] opacity-30 rounded-full blur-[100px] mix-blend-multiply filter animate-blob" /> */}
      {/* <div
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--warning)] opacity-30 rounded-full blur-[100px] mix-blend-multiply filter animate-blob"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-[var(--accent)] opacity-20 rounded-full blur-[100px] mix-blend-multiply filter animate-blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute -bottom-40 right-20 w-[600px] h-[600px] bg-[var(--primary)] opacity-20 rounded-full blur-[100px] mix-blend-multiply filter animate-blob"
        style={{ animationDelay: "6s" }}
      /> */}

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Creative Typography & visuals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 space-y-10"
        >
          <div className="space-y-4">
            <h1 className="text-xl lg:text-5xl font-black text-[var(--primary-900)] tracking-tight leading-[1.05]">
              Redefine your <br />
              <span className="relative inline-block text-[var(--primary-900)]">
                Professional Story
                <span className="absolute -bottom-2 left-0 w-full h-4 bg-[var(--primary-50)] -z-10 rounded-full skew-x-12 transform origin-left" />
              </span>
            </h1>

            <p className="text-xl text-[var(--primary-900)] opacity-70 max-w-lg font-medium leading-relaxed">
              Crafting perfect resumes shouldn&apos;t be hard. Upload, analyze,
              and generate industry-standard PDFs in seconds.
            </p>
          </div>

          {/* Video Showcase Frame */}
          <div className="relative rounded-2xl p-2 bg-white shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500 group max-w-lg mx-auto">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl z-20 opacity-0 group-hover:opacity-0 transition-opacity" />{" "}
            {/* Clean hover state */}
            <div className="relative rounded-xl overflow-hidden h-[260px] bg-[var(--primary-900)]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90"
              >
                <source src="/dashboard gif.mp4" type="video/mp4" />
              </video>
              {/* Decorative Overlay Gradient */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Right Column: Glassmorphism Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.1)] p-6 lg:p-8 overflow-hidden bg-[var(--primary-50)]">
            {/* Subtle Texture/Noise if clearer background */}


            <div className="mb-6 text-center space-y-2">
              <div className="w-12 h-12 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-3">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--primary-900)] tracking-tight">
                Upload Resume
              </h2>
              <p className="text-[var(--primary)] opacity-80 font-medium text-sm">
                PDF Format • Max 10MB
              </p>
            </div>

            <div
              className={`
                    relative group border-[3px] border-dashed rounded-[1.5rem] p-8 transition-all duration-300 ease-out
                    flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]
                    ${isDragOver
                  ? "border-[var(--accent-700)] bg-[var(--accent)] opacity-20 scale-[1.02] shadow-xl"
                  : "border-[var(--border)] hover:border-[var(--accent-700)] hover:bg-white/50"
                }
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

              {/* Interactive Icon State */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                {file ? (
                  <div className="relative">
                    <FileText className="w-14 h-14 text-[var(--accent)] drop-shadow-lg" />
                    <div className="absolute -right-2 -top-2 bg-[var(--success)] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--primary-50)] flex items-center justify-center group-hover:bg-[var(--accent-50)] transition-colors">
                    <ArrowRight className="w-6 h-6 text-[var(--primary-700)] group-hover:text-[var(--accent-700)] -rotate-45 group-hover:rotate-0 transition-all duration-300" />
                  </div>
                )}
              </div>

              <div className="z-10 mt-4 space-y-1">
                {file ? (
                  <>
                    <p className="font-bold text-lg text-[var(--primary-900)] truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-sm font-medium text-[var(--accent)]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-[var(--primary-900)] group-hover:text-[var(--accent-700)] transition-colors">
                      Drag & Drop
                    </p>
                    <p className="text-sm font-medium text-[var(--primary-700)] opacity-70 group-hover:text-[var(--primary-700)]">
                      or click to browse filesystem
                    </p>
                  </>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-rose-50 text-rose-600 p-3 rounded-xl flex items-center gap-3 text-sm font-bold border border-rose-100"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`
                    w-full mt-6 py-4 rounded-2xl font-bold text-lg tracking-wide shadow-lg 
                    transform transition-all duration-300 flex items-center justify-center gap-3
                    ${loading || !file
                  ? "bg-[var(--primary-50)] text-slate-300 cursor-not-allowed shadow-none"
                  : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-[1.02]"
                }
                `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-bold">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Generate Magic PDF</span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-[var(--primary)] opacity-80 font-bold">
              Secure & Confidential Parsing
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
