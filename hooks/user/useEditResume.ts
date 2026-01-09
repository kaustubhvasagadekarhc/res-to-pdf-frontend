"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { ResumeData, ValidationErrors, AnalysisResult } from "@/lib/resume/resume.types";
import {
  formatToMonthInput,
  formatFromMonthInput,
  validateWorkExperienceDates,
  calculateDuration,
  formatNameInput,
  formatLocationInput,
  formatEducationFieldInput,
  formatMobileInput,
  getMissingFieldsForStep,
} from "@/lib/resume/resume.utils";
import {
  generatePdf,
  analyzeResume,
  renameResume,
  loadResumeFromStorage,
  saveResumeToStorage,
  savePdfResponse,
  downloadPdf,
} from "@/lib/resume/resume.api";

export const useEditResume = () => {
  const router = useRouter();
  const { refreshResumes } = useUser();
  
  // Main state
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  
  // Input states
  const [skillInput, setSkillInput] = useState("");
  const [workExpTechInputs, setWorkExpTechInputs] = useState<{ [key: string]: string }>({});
  const [projectTechInputs, setProjectTechInputs] = useState<{ [key: number]: string }>({});
  
  // Modal states
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempPdfName, setTempPdfName] = useState("");
  const [isRenameClicked, setIsRenameClicked] = useState(false);
  
  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [workExpDateErrors, setWorkExpDateErrors] = useState<ValidationErrors>({});

  // Load resume data on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const resumeId = searchParams.get("id");

    if (resumeId) {
      setCurrentResumeId(resumeId);
    }

    const loadResumeData = async () => {
      if (resumeId) {
        // This is an existing resume being edited
        try {
          console.log(`Loading existing resume with ID: ${resumeId}`);
          const storedData = loadResumeFromStorage();
          if (storedData) {
            setResumeData(storedData);
          } else {
            router.push("/user/upload");
          }
        } catch (error) {
          console.error("Error loading resume data:", error);
          router.push("/user/upload");
        }
      } else {
        // Load from sessionStorage (new resume or from upload)
        const storedData = loadResumeFromStorage();
        if (storedData) {
          setResumeData(storedData);
        } else {
          router.push("/user/upload");
        }
      }
      setLoading(false);
    };

    loadResumeData();
  }, [router]);

  // Save resume data to storage whenever it changes
  useEffect(() => {
    if (resumeData) {
      saveResumeToStorage(resumeData);
    }
  }, [resumeData]);

  // Show rename modal when entering step 1 if pdfName is not set
  useEffect(() => {
    if (currentStep === 1 && resumeData && (!resumeData.pdfName || resumeData.pdfName.trim() === "")) {
      setTempPdfName(resumeData.pdfName || "");
      setIsRenameModalOpen(true);
    }
  }, [currentStep, resumeData]);

  // Validation
  const validatePersonalDetails = (): boolean => {
    if (!resumeData) return false;
    const errors: ValidationErrors = {};
    const { name, email, mobile, designation } = resumeData.personal;

    // Full Name Validation
    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      errors.name = "Full Name is required";
    } else {
      if (nameTrimmed.length < 4) {
        errors.name = "Full name must have at least 4 characters";
      } else {
        const nameParts = nameTrimmed.split(/\s+/);
        if (nameParts.length < 2) {
          errors.name = "Please enter at least two names (First and Last name)";
        } else {
          const namePartRegex = /^[A-Z][a-z]*$/;
          const allPartsValid = nameParts.every((part) => namePartRegex.test(part));
          if (!allPartsValid) {
            errors.name = "Each name must start with a capital letter and contain only letters";
          }
        }
      }
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile Validation
    const mobileClean = mobile.replace(/\s+/g, "");
    const phoneRegex = /^\+91\d{10}$/;
    if (!mobile || mobile === "+91") {
      errors.mobile = "Mobile number is required";
    } else if (!phoneRegex.test(mobileClean)) {
      errors.mobile = "Must be +91 followed by exactly 10 digits";
    }

    // Job Title Validation
    if (!designation) {
      errors.designation = "Job Title is required";
    } else if (designation.charAt(0) !== designation.charAt(0).toUpperCase()) {
      errors.designation = "First letter must be capital";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update handlers
  const updatePersonal = (field: string, value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [field]: value },
    });
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateSummary = (value: string) => {
    if (!resumeData) return;
    setResumeData({ ...resumeData, summary: value });
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!resumeData) return;
      const newSkill = skillInput.trim();
      if (!resumeData.skills.includes(newSkill)) {
        setResumeData({
          ...resumeData,
          skills: [...resumeData.skills, newSkill],
        });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.education];

    let processedValue = value;
    if (field === "field" || field === "institution" || field === "degree") {
      processedValue = formatEducationFieldInput(value);
    }

    updated[index] = { ...updated[index], [field]: processedValue };
    setResumeData({ ...resumeData, education: updated });
  };

  const addEducation = () => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          institution: "",
          degree: "",
          field: "",
          graduation_year: "",
        },
      ],
    });
  };

  const deleteEducation = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: updated });
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "period_from" || field === "period_to") {
      const from = field === "period_from" ? value : updated[index].period_from;
      const to = field === "period_to" ? value : updated[index].period_to;
      updated[index].duration = calculateDuration(from, to);

      // Validate dates
      const errorKey = `workExp_${index}_dates`;
      const dateError = validateWorkExperienceDates(from, to);
      
      setWorkExpDateErrors((prev) => {
        const newErrors = { ...prev };
        if (dateError) {
          newErrors[errorKey] = dateError;
        } else {
          delete newErrors[errorKey];
        }
        return newErrors;
      });
    }

    setResumeData({ ...resumeData, work_experience: updated });
  };

  const addWorkExperience = () => {
    if (!resumeData) return;
    const newIndex = resumeData.work_experience.length;
    setResumeData({
      ...resumeData,
      work_experience: [
        ...resumeData.work_experience,
        {
          company: "",
          position: "",
          duration: "",
          period_from: "",
          period_to: "",
          projects: [],
        },
      ],
    });
    // Clear any existing error for this new entry
    setWorkExpDateErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`workExp_${newIndex}_dates`];
      return newErrors;
    });
  };

  const deleteWorkExperience = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.work_experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const addProject = (expIndex: number) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[expIndex].projects.push({
      name: "",
      description: "",
      responsibilities: [],
      technologies: [],
    });
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const deleteProject = (expIndex: number, projIndex: number) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[expIndex].projects = updated[expIndex].projects.filter(
      (_, i) => i !== projIndex
    );
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const updateProjectField = (
    expIndex: number,
    projIndex: number,
    field: string,
    value: string
  ) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    if (field === "technologies") {
      updated[expIndex].projects[projIndex].technologies = value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    } else if (field === "responsibilities") {
      updated[expIndex].projects[projIndex].responsibilities = value
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);
    } else {
      updated[expIndex].projects[projIndex] = {
        ...updated[expIndex].projects[projIndex],
        [field]: value,
      };
    }
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const updateStandaloneProject = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.projects];
    if (field === "technologies") {
      updated[index].technologies = value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setResumeData({ ...resumeData, projects: updated });
  };

  const addStandaloneProject = () => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          name: "",
          description: "",
          technologies: [],
        },
      ],
    });
  };

  const deleteStandaloneProject = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, projects: updated });
  };

  const addWorkExpTech = (
    e: React.KeyboardEvent<HTMLInputElement>,
    expIndex: number,
    projIndex: number
  ) => {
    const inputValue = workExpTechInputs[`${expIndex}-${projIndex}`] || "";
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!resumeData) return;
      const newTech = inputValue.trim();
      const updated = [...resumeData.work_experience];
      if (!updated[expIndex].projects[projIndex].technologies.includes(newTech)) {
        updated[expIndex].projects[projIndex].technologies.push(newTech);
        setResumeData({ ...resumeData, work_experience: updated });
      }
      setWorkExpTechInputs({
        ...workExpTechInputs,
        [`${expIndex}-${projIndex}`]: "",
      });
    }
  };

  const removeWorkExpTech = (
    expIndex: number,
    projIndex: number,
    techToRemove: string
  ) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[expIndex].projects[projIndex].technologies = updated[
      expIndex
    ].projects[projIndex].technologies.filter((t) => t !== techToRemove);
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const addProjectTech = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = projectTechInputs[index] || "";
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!resumeData) return;
      const newTech = inputValue.trim();
      const updated = [...resumeData.projects];
      if (!updated[index].technologies.includes(newTech)) {
        updated[index].technologies.push(newTech);
        setResumeData({ ...resumeData, projects: updated });
      }
      setProjectTechInputs({ ...projectTechInputs, [index]: "" });
    }
  };

  const removeProjectTech = (index: number, techToRemove: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.projects];
    updated[index].technologies = updated[index].technologies.filter(
      (t) => t !== techToRemove
    );
    setResumeData({ ...resumeData, projects: updated });
  };

  // Actions
  const handleAnalyze = async () => {
    if (!resumeData) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeResume(resumeData);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!resumeData) return;
    setGenerating(true);

    try {
      const response = await generatePdf(resumeData);
      console.log("PDF generation successful:", response);

      let downloadUrl = "";
      let downloadFileName = `${resumeData.personal.name || "resume"}.pdf`;

      if (response?.status === "success" && response?.data?.fileUrl) {
        downloadUrl = response.data.fileUrl;
        if (response.data.fileName) downloadFileName = response.data.fileName;
      }

      savePdfResponse(response, downloadUrl, downloadFileName);

      // Open and download PDF
      if (downloadUrl) {
        downloadPdf(downloadUrl, downloadFileName);
      }

      // Refresh resumes
      await refreshResumes(true);

      // Redirect
      toast.success("Resume generated and downloaded!");
      router.push("/user");
    } catch (error: unknown) {
      console.error("PDF generation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      if (currentStep === 1) {
        // Validate personal details first
        if (!validatePersonalDetails()) {
          return;
        }
        // If pdfName is not set, show modal (it should already be open, but ensure it is)
        if (!resumeData?.pdfName || resumeData.pdfName.trim() === "") {
          setTempPdfName(resumeData?.pdfName || "");
          setIsRenameModalOpen(true);
          return; // Don't proceed until name is saved
        }
      }
      // Only proceed to next step if validation passes and name is set
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSavePdfName = async () => {
    if (tempPdfName?.trim()?.length === 0) {
      toast.error("Please enter a valid name");
      return;
    }
    
    setIsRenameClicked(true);
    
    if (resumeData) {
      setResumeData({ ...resumeData, pdfName: tempPdfName });

      // If editing an existing resume, call the rename API
      if (currentResumeId && tempPdfName.trim()) {
        try {
          await renameResume(currentResumeId, tempPdfName.trim());
          toast.success("Resume name updated");
        } catch (error) {
          console.error("Failed to rename resume:", error);
        }
      }
    }
   
    setIsRenameModalOpen(false);
    setIsRenameClicked(false);
    // Don't increment step - just save the name and close modal
    // User must click "Next" button to proceed to step 2
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Check if form is complete
  const isFormComplete = resumeData
    ? [1, 2, 3, 4, 5, 6, 7].every(
        (step) => !getMissingFieldsForStep(
          ["personal", "summary", "skills", "experience", "education", "projects", "review"][step - 1],
          resumeData
        )
      )
    : false;

  return {
    // State
    resumeData,
    loading,
    generating,
    currentStep,
    setCurrentStep,
    currentResumeId,
    skillInput,
    setSkillInput,
    workExpTechInputs,
    setWorkExpTechInputs,
    projectTechInputs,
    setProjectTechInputs,
    isRenameModalOpen,
    setIsRenameModalOpen,
    tempPdfName,
    setTempPdfName,
    isRenameClicked,
    analyzing,
    analysisResult,
    validationErrors,
    workExpDateErrors,
    isFormComplete,
    
    // Actions
    updatePersonal,
    updateSummary,
    addSkill,
    removeSkill,
    updateEducation,
    addEducation,
    deleteEducation,
    updateWorkExperience,
    addWorkExperience,
    deleteWorkExperience,
    addProject,
    deleteProject,
    updateProjectField,
    updateStandaloneProject,
    addStandaloneProject,
    deleteStandaloneProject,
    addWorkExpTech,
    removeWorkExpTech,
    addProjectTech,
    removeProjectTech,
    handleAnalyze,
    handleGenerate,
    handleNext,
    handleSavePdfName,
    handleBack,
    validatePersonalDetails,
    
    // Utils
    formatToMonthInput,
    formatFromMonthInput,
    formatNameInput,
    formatLocationInput,
    formatMobileInput,
    getMissingFieldsForStep: (stepKey: string) => getMissingFieldsForStep(stepKey, resumeData),
  };
};

