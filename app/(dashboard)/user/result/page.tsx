"use client";

import { apiClient, pdfService } from "@/app/api/client";
import confetti from "canvas-confetti";
import { AlertCircle, Download, Edit3} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


const base64ToBlob = (base64: string, contentType = "application/pdf") => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

export default function ResultPage() {
  const [pdfGenerated] = useState(() =>
    typeof window !== "undefined"
      ? !!sessionStorage.getItem("pdfResponse")
      : false
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const pdfResponse = sessionStorage.getItem("pdfResponse");
      if (pdfResponse) {
        try {
          const parsed = JSON.parse(pdfResponse);
          // If pdfUrl already saved, return it
          if (parsed.pdfUrl) return parsed.pdfUrl;

          // Check for new API format: { data: { fileUrl: "...", ... } }
          if (parsed.data && parsed.data.fileUrl) return parsed.data.fileUrl;

          // If server returned nested data with base64 PDF string
          // attempt to convert and persist pdfUrl
          const maybeData = parsed.data || parsed;
          if (typeof maybeData === "string") {
            // data URL or base64
            if (maybeData.startsWith("data:application/pdf;base64,")) {
              const blob = base64ToBlob(
                maybeData.split(",")[1],
                "application/pdf"
              );
              const url = window.URL.createObjectURL(blob);
              sessionStorage.setItem(
                "pdfResponse",
                JSON.stringify({ success: true, pdfUrl: url })
              );
              return url;
            }
          }
          // Could not find a usable url
          return null;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Define types for the API response
  interface ApiResponse {
    status: string;
    data: {
      id: string;
      fileName: string;
      fileUrl: string;
      createdAt: string;
    };
  }

  const [previewError, setPreviewError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (pdfGenerated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [pdfGenerated]);

  const createPdfUrl = useCallback(async () => {
    try {
      const resumeData = sessionStorage.getItem("resumeData");
      if (!resumeData) return null;

      apiClient.refreshTokenFromCookies();

      const response = await pdfService.postGeneratePdf({
        requestBody: JSON.parse(resumeData),
      });

      console.log("API Response:", response);

      // Handle direct Blob response
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const pdfResponse = { success: true, pdfUrl: url };
        sessionStorage.setItem("pdfResponse", JSON.stringify(pdfResponse));
        return url;
      }

      // Check if response matches the new API format: { status: "success", data: { fileUrl: "...", ... } }
      if (response && typeof response === "object" &&
          (response as ApiResponse).status === "success" &&
          (response as ApiResponse).data &&
          (response as ApiResponse).data.fileUrl) {

        const fileUrl = (response as ApiResponse).data.fileUrl;
        const pdfResponse = {
          success: true,
          pdfUrl: fileUrl,
          data: (response as ApiResponse).data
        };
        sessionStorage.setItem("pdfResponse", JSON.stringify(pdfResponse));
        return fileUrl;
      }
      // Handle JSON response with base64 PDF (actual API format)
      else if (response && typeof response === "object") {
        const responseObj = response as Record<string, unknown>;

        // Check if response has base64 PDF data
        if (typeof responseObj === "string") {
          // Response is base64 string
          const blob = base64ToBlob(responseObj, "application/pdf");
          const url = window.URL.createObjectURL(blob);
          sessionStorage.setItem("pdfResponse", JSON.stringify({ success: true, pdfUrl: url }));
          return url;
        }

        // Check for nested base64 data
        const pdfData = responseObj.pdf || responseObj.data || responseObj.pdfBase64;
        if (typeof pdfData === "string") {
          const blob = base64ToBlob(pdfData, "application/pdf");
          const url = window.URL.createObjectURL(blob);
          sessionStorage.setItem("pdfResponse", JSON.stringify({ success: true, pdfUrl: url }));
          return url;
        }
      }
    } catch (err) {
      console.error("Error generating PDF preview:", err);
      setPreviewError(
        "Failed to generate PDF preview. You can try downloading the PDF."
      );
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPdfUrl = async () => {
      if (pdfGenerated && !pdfBlobUrl) {
        // Debug: log what's in sessionStorage
        console.log("PDF Response:", sessionStorage.getItem("pdfResponse"));

        const url = await createPdfUrl();
        if (isMounted && url) {
          setPdfBlobUrl(url);
        }
      }
    };

    fetchPdfUrl();

    return () => {
      isMounted = false;
    };
  }, [pdfGenerated, pdfBlobUrl, createPdfUrl]);

  const handleDownloadPDF = async () => {
    try {
      let finalUrl = pdfBlobUrl;

      // If no blob URL, try to create one
      if (!finalUrl) {
        finalUrl = await createPdfUrl();
        if (finalUrl) {
          setPdfBlobUrl(finalUrl);
        }
      }

      // If still no URL, make fresh API call
      if (!finalUrl) {
        const resumeData = sessionStorage.getItem("resumeData");
        if (resumeData) {
          apiClient.refreshTokenFromCookies();
          const response = await pdfService.postGeneratePdf({
            requestBody: JSON.parse(resumeData),
          });

          // Check if response matches the new API format: { status: "success", data: { fileUrl: "...", ... } }
          if (response && typeof response === "object" &&
              (response as unknown as ApiResponse).status === "success" &&
              (response as unknown as ApiResponse).data &&
              (response as unknown as ApiResponse).data.fileUrl) {

            // Use the file URL directly from the API response
            finalUrl = (response as unknown as ApiResponse).data.fileUrl;
          }
          else if (response instanceof Blob) {
            finalUrl = URL.createObjectURL(response);
          }
          else if (response && typeof response === "object") {
            const responseObj = response as Record<string, unknown>;
            const pdfData = responseObj.pdf || responseObj.data || responseObj.pdfBase64 || response;
            if (typeof pdfData === "string") {
              const blob = base64ToBlob(pdfData, "application/pdf");
              finalUrl = URL.createObjectURL(blob);
            }
          }
        }
      }

      if (finalUrl) {
        const a = document.createElement("a");
        a.href = finalUrl;
        a.download = `resume_${new Date().getTime()}.pdf`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up if it's a new blob URL
        if (finalUrl !== pdfBlobUrl) {
          setTimeout(() => URL.revokeObjectURL(finalUrl!), 1000);
        }
      } else {
        alert("Unable to generate PDF for download. Please try again.");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  // const handleStartOver = () => {
  //   sessionStorage.clear();
  //   // Revoke the stored PDF blob URL if exists
  //   if (pdfBlobUrl) {
  //     window.URL.revokeObjectURL(pdfBlobUrl);
  //     setPdfBlobUrl(null);
  //   }
  //   router.push("/");
  // };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <div className="flex flex-col h-full font-sans">
      {/* PDF View Area */}
      <div className="flex-grow flex items-center justify-center p-4  min-h-[calc(100vh-120px)] ">
        {pdfGenerated && pdfBlobUrl ? (
          <div className="w-full max-w-8xl h-[86vh] rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* PDF Viewer Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Resume Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => router.push("/user/edit-resume")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
            {/* PDF Viewer */}
            <div className="relative h-[calc(100%-60px)]">
              <iframe
                src={`${pdfBlobUrl}#toolbar=1&scrollbar=1&zoom=page-fit`}
                className="w-full h-full border-0"
                title="Generated Resume PDF"
                onError={() => setPreviewError("Failed to load PDF preview")}
                style={{ minHeight: '500px' }}
              />
              {/* PDF Controls Overlay */}
              <div className="absolute top-2 right-2 flex gap-1 bg-black/70 rounded-md p-1">
                <button
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) iframe.src = `${pdfBlobUrl}#zoom=150`;
                  }}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) iframe.src = `${pdfBlobUrl}#zoom=page-fit`;
                  }}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded"
                  title="Fit to Page"
                >
                  ⊞
                </button>
                <button
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) iframe.src = `${pdfBlobUrl}#zoom=75`;
                  }}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded"
                  title="Zoom Out"
                >
                  -
                </button>
              </div>
              {/* Fallback for browsers that don't support PDF viewing */}
              {previewError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                    <p className="text-sm text-slate-600 mb-4">{previewError}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPreviewError(null);
                          createPdfUrl().then((url) => url && setPdfBlobUrl(url));
                        }}
                        className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition text-sm"
                      >
                        Retry
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-10">
            {pdfGenerated ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-action/20 border-t-action rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading PDF...</p>
                {previewError && (
                  <p className="text-sm text-red-600 mt-3">{previewError}</p>
                )}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    className="text-sm text-slate-600 underline"
                    onClick={() => {
                      setPreviewError(null);
                      createPdfUrl().then((url) => url && setPdfBlobUrl(url));
                    }}
                  >
                    Retry Preview
                  </button>
                  <button
                    className="text-sm text-emerald-600 font-semibold"
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No PDF Generated
                </h2>
                <p className="text-muted mb-6">
                  It looks like the resume generation process was not completed.
                </p>
                <button
                  onClick={() => router.push("/user")}
                  className="bg-action text-action-foreground px-6 py-2 rounded-lg font-semibold hover:bg-action/90 transition"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Navbar */}
      {/* <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-50 p-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleStartOver}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
              New
            </button>
            <button
              onClick={() => router.push("/user/edit")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </motion.div> */}
    </div>
  );
}
