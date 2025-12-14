"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  //example usage of pdfService

  // import { pdfService } from "./api/client";
  // const handleFileChangjhasdhjvase = async(e: React.ChangeEvent<HTMLInputElement>) => {
  //   const response = await pdfService.postGeneratePdf({
  //     file: e.target.files?.[0],
  //   })
  // };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    // Validate file type and size
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://res-to-pdf-api.vercel.app/upload", {
        method: "POST",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Resume Parser
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Upload your resume to get started
        </p>

        <div className="upload-section bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition">
          <input
            type="file"
            id="fileInput"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full block mb-4 cursor-pointer"
          />
          <p className="text-sm text-gray-600 text-center mb-4">
            {file ? `Selected: ${file.name}` : "PDF files only"}
          </p>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Processing resume..." : "Upload & Parse Resume"}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
