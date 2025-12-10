"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, getApiBaseUrl } from "@/lib/auth";

export default function ResultPage() {
  const [pdfGenerated] = useState(() => !!sessionStorage.getItem("pdfResponse"));
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(() => sessionStorage.getItem("pdfBlobUrl"));
  const router = useRouter();

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
        `${getApiBaseUrl()}/generate/pdf`,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {pdfGenerated ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Success!
              </h1>
              <p className="text-gray-600">
                Your resume PDF has been generated successfully
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">
                What&apos;s Next?
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Resume parsed successfully</li>
                <li>✓ All information formatted</li>
                <li>✓ PDF ready to download</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PDF
              </button>

              <button
                onClick={() => router.push("/edit")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Edit Resume
              </button>

              <button
                onClick={handleStartOver}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Upload New Resume
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                No Resume Generated
              </h1>
              <p className="text-gray-600">
                Please go back and complete the process
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/edit")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Back to Edit
              </button>

              <button
                onClick={handleStartOver}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Upload New Resume
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
