"use client";

import { apiClient, resumeService } from "@/app/api/client";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function UploadPage() {
  useAuthGuard("User");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
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

      if (!response.parsed) {
        setError("Failed to parse resume data");
        return;
      }

      sessionStorage.setItem("resumeData", JSON.stringify(response.parsed));
      router.push("/user/edit-resume");
    } catch (error: unknown) {
      console.error("Resume upload failed:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        {/* Left Column: Text Content & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-600 leading-[1.1] tracking-tight">
              Redefine your <br />
              <span className="text-[var(--accent)]">Professional Story</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg pt-4">
              Crafting perfect resumes shouldn&apos;t be hard. Upload your
              existing resume, and we&apos;ll transform it into an
              industry-standard PDF in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {!file ? (
              <button
                onClick={triggerFileSelect}
                className="px-8 py-4 bg-[var(--accent)] hover:bg-indigo-600 text-white rounded-sm font-bold text-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 justify-center"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
            ) : (
              <div className="flex flex-col gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-sm shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-bold text-lg  hover:shadow-emerald-300 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 justify-center disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {loading ? "Processing..." : "Generate PDF"}
                </button>
              </div>
            )}

            {!file && (
              <button
                onClick={() => {
                  const emptyResume = {
                    personal: {
                      name: "",
                      designation: "",
                      email: "",
                      mobile: "",
                      location: "",
                      gender: "",
                      marital_status: "",
                    },
                    summary: "",
                    skills: [],
                    education: [],
                    work_experience: [],
                    projects: [],
                  };
                  sessionStorage.setItem(
                    "resumeData",
                    JSON.stringify(emptyResume)
                  );
                  sessionStorage.removeItem("resumeId");
                  sessionStorage.removeItem("resumeFileName");
                  router.push("/user/edit-resume");
                }}
                className="
  group relative inline-flex items-center justify-center
  px-8 py-4 rounded-sm font-semibold text-lg
  text-[var(--accent)]
  bg-white
  border border-slate-200
  shadow-sm
  transition-all duration-300
  hover:shadow-md
  hover:-translate-y-[1px]
  hover:bg-slate-100
  active:translate-y-0
"
              >
                <span className="relative z-10">Make Your Own Resume</span>

                <span
                  className="
    pointer-events-none absolute inset-0 rounded-sm
    bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  "
                />
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-lg text-sm font-medium w-fit"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
        </motion.div>

        {/* Right Column: Video Card */}
        <motion.div className="relative group h-[500px] lg:h-[530px] w-full">
          <Image
            src="/upload-resume-page.webp"
            alt="upload resume"
            fill
            className="object-contain mix-blend-multiply opacity-90 contrast-180 brightness-80"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
