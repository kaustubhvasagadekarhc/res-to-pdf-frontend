"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { authService } from "@/services/auth.services";
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
import { Button } from "@/components/ui/button";

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
    const token = authService.getToken();
    if (!token) {
      setError("Access token required. Please login again.");
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

      // TODO: Replace with typed API client call if available.
      // Using fetch here to preserve existing working logic pattern but with correct token source.
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (!result.parsed) {
          setError("Failed to parse resume data");
          return;
        }

        sessionStorage.setItem("resumeData", JSON.stringify(result.parsed));
        router.push("/user/edit");
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
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-100px)]">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Hero Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 relative">
              Career Journey
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
            Stop struggling with formatting. Upload your current resume and let our AI rigorously analyze and rebuild it into a stunning, ATS-optimized PDF document that stands out.
          </p>

          <div className="flex flex-col gap-4">
             
             <div className="flex items-center gap-4 group">
                 <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="h-6 w-6" />
                 </div>
                 <div>
                     <h4 className="font-bold text-slate-800 text-lg">ATS Optimized</h4>
                     <p className="text-sm text-slate-500 font-medium">Formats designed to pass screening software.</p>
                 </div>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-40 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-40 animate-blob animation-delay-2000"></div>

          <div className="glass-card rounded-[2rem] p-8 lg:p-12 relative overflow-hidden">
             
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">
                Upload Resume
              </h2>
              <p className="text-slate-500 font-medium">
                Support for PDF files up to 10MB
              </p>
            </div>

            <div
              className={`
                 relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-out
                 flex flex-col items-center justify-center text-center cursor-pointer
                 ${
                   isDragOver
                     ? "border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-inner"
                     : "border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/30"
                 }
                 ${file ? "bg-indigo-50/40 border-indigo-200" : "bg-white/50"}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                id="fileInput"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="z-10 transition-transform duration-300 group-hover:-translate-y-2 mb-6">
                {file ? (
                  <div className="relative">
                      <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <FileText className="w-20 h-20 text-indigo-600 relative z-10 drop-shadow-sm" />
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                      </div>
                  </div>
                ) : (
                  <div className="bg-indigo-50 p-6 rounded-full group-hover:bg-indigo-100 transition-colors shadow-sm">
                    <Upload className="w-10 h-10 text-indigo-600" />
                  </div>
                )}
              </div>

              <div className="z-10 space-y-1">
                {file ? (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <p className="font-bold text-slate-800 text-xl truncate max-w-[240px] mx-auto">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-indigo-600 mt-3 font-bold uppercase tracking-wide">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-slate-800 text-xl mb-2">
                      Drop your resume here
                    </p>
                    <p className="text-sm text-slate-500 font-medium">or click to browse from your computer</p>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`
                  w-full mt-8 py-6 text-lg font-bold rounded-xl shadow-xl shadow-indigo-500/20
                  transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700
                  ${loading || !file ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-indigo-500/40'}
              `}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Generate PDF <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
