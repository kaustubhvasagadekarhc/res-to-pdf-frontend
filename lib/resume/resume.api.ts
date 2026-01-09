import { apiClient, pdfService, recommendationService } from "@/app/api/client";
import { ResumeData, ApiResponse, AnalysisResult } from "./resume.types";

/**
 * Generate PDF from resume data
 */
export const generatePdf = async (resumeData: ResumeData): Promise<ApiResponse> => {
  apiClient.refreshTokenFromCookies();
  
  const response = await pdfService.postGeneratePdf({
    requestBody: resumeData,
  });

  return response as unknown as ApiResponse;
};

/**
 * Analyze resume using recommendation service
 */
export const analyzeResume = async (resumeData: ResumeData): Promise<AnalysisResult> => {
  const response = await recommendationService.postRecommendationAnalyze({
    requestBody: resumeData,
  });

  let result: AnalysisResult = {};

  if (response && response.data) {
    result = response.data as unknown as AnalysisResult;
  }

  return {
    atsScore: result.atsScore,
    overallReview: result.overallReview,
    sectionImprovements: result.sectionImprovements,
  };
};

/**
 * Rename resume
 */
export const renameResume = async (resumeId: string, fileName: string): Promise<void> => {
  apiClient.refreshTokenFromCookies();
  
  await apiClient.patch("/dashboard/resumes/rename", {
    resumeId,
    fileName: fileName.trim(),
  });
};

/**
 * Load resume data from session storage
 */
export const loadResumeFromStorage = (): ResumeData | null => {
  if (typeof window === "undefined") return null;
  
  const storedData = sessionStorage.getItem("resumeData");
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Save resume data to session storage
 */
export const saveResumeToStorage = (resumeData: ResumeData): void => {
  if (typeof window === "undefined") return;
  
  const dataToSave = { ...resumeData };
  sessionStorage.setItem("resumeData", JSON.stringify(dataToSave));
};

/**
 * Save PDF response to session storage
 */
export const savePdfResponse = (response: unknown, downloadUrl: string, downloadFileName: string): void => {
  if (typeof window === "undefined") return;
  
  if (
    response &&
    typeof response === "object" &&
    (response as unknown as ApiResponse).status === "success" &&
    (response as unknown as ApiResponse).data &&
    (response as unknown as ApiResponse).data.fileUrl
  ) {
    const apiResponse = response as unknown as ApiResponse;
    const apiData = apiResponse.data;
    
    sessionStorage.setItem(
      "pdfResponse",
      JSON.stringify({
        success: true,
        data: apiData,
        pdfUrl: apiData.fileUrl,
        fileName: apiData.fileName || downloadFileName,
      })
    );
  } else if (response instanceof Blob) {
    sessionStorage.setItem(
      "pdfResponse",
      JSON.stringify({
        success: true,
        pdfUrl: downloadUrl,
        fileName: downloadFileName,
      })
    );
  } else {
    try {
      const maybeData =
        (response as { pdfBase64?: string }).pdfBase64 ||
        (response as { data?: string }).data ||
        response;
      if (
        typeof maybeData === "string" &&
        maybeData.startsWith("data:application/pdf;base64,")
      ) {
        const base64 = maybeData.split(",")[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        
        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({
            success: true,
            pdfUrl: blobUrl,
            fileName: downloadFileName,
          })
        );
      } else {
        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({ success: true, data: response })
        );
      }
    } catch {
      sessionStorage.setItem(
        "pdfResponse",
        JSON.stringify({ success: true, data: response })
      );
    }
  }
};

/**
 * Download PDF from URL
 */
export const downloadPdf = (url: string, fileName: string): void => {
  // Open in browser (new tab)
  window.open(url, "_blank");

  // Auto-download the PDF
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

