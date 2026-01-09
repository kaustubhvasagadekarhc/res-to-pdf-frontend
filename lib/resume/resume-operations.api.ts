import { apiClient, resumeService } from "@/app/api/client";
import { Resume } from "@/contexts/UserContext";

/**
 * Delete a resume
 */
export const deleteResume = async (resumeId: string): Promise<void> => {
  apiClient.refreshTokenFromCookies();
  await resumeService.deleteResume({ id: resumeId });
};

/**
 * Rename a resume
 */
export const renameResumeFile = async (
  resumeId: string,
  fileName: string
): Promise<void> => {
  apiClient.refreshTokenFromCookies();
  await apiClient.patch("/dashboard/resumes/rename", {
    resumeId,
    fileName: fileName.trim(),
  });
};

/**
 * Prepare resume data for editing
 */
export const prepareResumeForEdit = (resume: Resume): void => {
  if (typeof window === "undefined") return;
  
  sessionStorage.setItem("resumeId", resume.id);
  sessionStorage.setItem("resumeFileName", resume.fileName);

  if (resume.content) {
    sessionStorage.setItem("resumeData", resume.content);
  }
};

/**
 * Download resume file
 */
export const downloadResumeFile = (resume: Resume): void => {
  if (resume.fileUrl) {
    const link = document.createElement("a");
    link.href = resume.fileUrl;
    link.download = resume.fileName;
    link.click();
  }
};

/**
 * View resume in new tab
 */
export const viewResume = (resume: Resume): void => {
  if (resume.fileUrl) {
    window.open(resume.fileUrl, "_blank");
  }
};

