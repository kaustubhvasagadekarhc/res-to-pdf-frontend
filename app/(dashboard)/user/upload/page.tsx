"use client";

import { apiClient, resumeService } from "@/app/api/client";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@/contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { downloadPdf, generatePdf, savePdfResponse } from "@/lib/resume/resume.api";

export default function UploadPage() {
  useAuthGuard("User");
  const { refreshResumes } = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [parseType, setParseType] = useState("quick");
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetModalFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      validateAndSetModalFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.includes("pdf")) {
      const errorMsg = "Please upload a PDF file only";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      const errorMsg = "File size exceeds 10MB limit";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    setFile(selectedFile);
    setError("");
    return true;
  };

  const validateAndSetModalFile = (selectedFile: File) => {
    if (!selectedFile.type.includes("pdf")) {
      const errorMsg =
        "Only PDF files are supported. Please upload a PDF resume.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      const errorMsg = "File size exceeds 10MB limit";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setFile(selectedFile);
    setError("");
    toast.success("File uploaded successfully!");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please upload a file first");
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
        toast.error("Failed to parse resume data");
        return;
      }

      sessionStorage.setItem("resumeData", JSON.stringify(response.parsed));
      setParsedData(response.parsed);
      setShowModal(false);
      setShowActionModal(true);
    } catch (error: unknown) {
      console.error("Resume upload failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = () => {
    if (parsedData) {
      sessionStorage.setItem("resumeData", JSON.stringify(parsedData));
      router.push("/user/edit-resume");
    }
  };

  const handleDirectGenerate = async () => {
    if (!parsedData) {
      toast.error("No resume data available to generate PDF");
      return;
    }

    setLoading(true);

    try {
      apiClient.refreshTokenFromCookies();
      const token = Cookies.get("auth-token") || Cookies.get("access_token");

      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/generate/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            personal: parsedData.personal,
            summary: parsedData.summary,
            skills: parsedData.skills,
            work_experience: parsedData.work_experience,
            education: parsedData.education,
            projects: parsedData.projects,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to generate PDF: ${response.statusText}`,
        );
      }

      const pdfBlob = await response.blob();

      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("Received empty PDF response");
      }

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${parsedData.pdfName || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated and downloaded successfully!");
      setShowActionModal(false);
    } catch (error: unknown) {
      console.error("PDF generation failed:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate PDF";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

const handleGenerate = async () => {
    if (!parsedData) return;
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await generatePdf(parsedData as any);
      console.log("PDF generation successful:", response);

      let downloadUrl = "";
      let downloadFileName = `${(parsedData.personal as Record<string, unknown>)?.name || "resume"}.pdf`;

      if (response?.status === "success" && response?.data?.fileUrl) {
        downloadUrl = response.data.fileUrl;
        if (response.data.fileName) downloadFileName = response.data.fileName;
      }

      savePdfResponse(response, downloadUrl, downloadFileName);

      if (downloadUrl) {
        downloadPdf(downloadUrl, downloadFileName);
      }

      if (refreshResumes) {
        await refreshResumes(true);
      }

      toast.success("Resume generated and downloaded!");
      router.push("/user");
    } catch (error: unknown) {
      console.error("PDF generation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF"
      );
    } finally {
      setLoading(false);
    }
  };







  const closeModal = () => {
    setShowModal(false);
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  console.log("resume file:", file);
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
                onClick={() => {
                  setShowModal(true);
                  setFile(null);
                  setError("");
                }}
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
                      setError("");
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
                    JSON.stringify(emptyResume),
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

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Upload Resume
                    </h2>
                    <p className="text-xs text-slate-500">
                      Import your resume data in seconds
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] ">
                {/* Parsing Mode Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    Select Parsing Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "quick",
                        icon: "⚡",
                        color: "amber",
                        title: "Quick Parse",
                        desc: "Fast extraction of basic info",
                      },
                      {
                        id: "inferred",
                        icon: "🧠",
                        color: "purple",
                        title: "Inferred Parse",
                        desc: "Deep analysis of skills & sections",
                      },
                      {
                        id: "generative",
                        icon: "✨",
                        color: "teal",
                        title: "Generative Parse",
                        desc: "AI-powered content restructuring",
                      },
                    ].map((mode) => (
                      <label
                        key={mode.id}
                        className="relative group cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="parse_type"
                          value={mode.id}
                          checked={parseType === mode.id}
                          onChange={(e) => setParseType(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 transition-all duration-200 h-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{mode.icon}</span>
                            <h3 className="font-bold text-slate-800 text-sm">
                              {mode.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {mode.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    Upload Your Resume
                  </label>

                  {file ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                          <FileText className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                              Ready to Upload
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 truncate text-sm">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="font-medium">
                              {file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(2)} KB`
                                : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>PDF Document</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null);
                            setError("");
                            if (modalFileInputRef.current) {
                              modalFileInputRef.current.value = "";
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-2 transition-all flex-shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className="relative group"
                    >
                      <input
                        ref={modalFileInputRef}
                        onChange={handleModalFileChange}
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        type="file"
                      />
                      <div
                        className={`
                          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                          ${
                            isDragOver
                              ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                              : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                          }
                        `}
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload
                            className={`w-8 h-8 ${
                              isDragOver
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-indigo-500"
                            }`}
                          />
                        </div>
                        <h4 className="text-base font-semibold text-slate-800 mb-2">
                          {isDragOver
                            ? "Drop your resume here"
                            : "Drag & drop your resume here"}
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">
                          or{" "}
                          <span className="text-indigo-600 font-semibold underline decoration-2 underline-offset-2">
                            browse files
                          </span>{" "}
                          from your computer
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 inline-flex">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            PDF only
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>Max 10MB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl text-sm"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-200 font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Parsing</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={() => setShowActionModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-6 text-center border-b border-emerald-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  Resume Parsed Successfully!
                </h3>
                <p className="text-sm text-slate-500">
                  What would you like to do next?
                </p>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={handleEditResume}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Resume
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Generate PDF Directly</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={loading}
                  className="w-full px-6 py-3.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
function refreshResumes(arg0: boolean) {
  throw new Error("Function not implemented.");
}

