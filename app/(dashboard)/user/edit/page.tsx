"use client";

import { toast } from "sonner";

import { apiClient, pdfService, recommendationService } from "@/app/api/client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Code,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
// import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResumeData {
  pdfName: string;
  personal: {
    name: string;
    designation: string;
    email: string;
    mobile: string;
    location: string;
    gender: string;
    marital_status: string;
  };
  summary: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduation_year: string;
  }>;
  work_experience: Array<{
    company: string;
    position: string;
    duration: string;
    period_from: string;
    period_to: string;
    projects: Array<{
      name: string;
      description: string;
      responsibilities: string[];
      technologies: string[];
    }>;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

interface ApiResponse {
  status: string;
  data: {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  };
}

const AutoHeightTextarea = ({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${className} overflow-y-auto`}
      placeholder={placeholder}
      style={{ maxHeight: "700px" }}
    />
  );
};

export default function EditPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [, setError] = useState("");
  const router = useRouter();
  const { refreshResumes } = useUser();
  const [currentStep, setCurrentStep] = useState(1);

  const [skillInput, setSkillInput] = useState("");
  const [workExpTechInputs, setWorkExpTechInputs] = useState<{
    [key: string]: string;
  }>({});
  const [projectTechInputs, setProjectTechInputs] = useState<{
    [key: number]: string;
  }>({});
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // PDF Rename State`
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(true);
  const [tempPdfName, setTempPdfName] = useState("");

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [isRenameClicked, setIsRenameClicked] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    atsScore?: number;
    overallReview?: string;
    sectionImprovements?: {
      summary?: string;
      skills?: string;
      experience?: string;
      education?: string;
      projects?: string;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    if (!resumeData) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await recommendationService.postRecommendationAnalyze({
        requestBody: resumeData,
      });

      interface AnalysisResponse {
        atsScore?: number;
        overallReview?: string;
        sectionImprovements?: {
          summary?: string;
          skills?: string;
          experience?: string;
          education?: string;
          projects?: string;
        };
      }

      let result: AnalysisResponse = {};

      if (response && response.data) {
        result = response.data as unknown as AnalysisResponse;
      }

      setAnalysisResult({
        atsScore: result.atsScore,
        overallReview: result.overallReview,
        sectionImprovements: result.sectionImprovements,
      });
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const STEPS = [
    { id: 1, key: "personal", label: "Personal Details", icon: User },
    { id: 2, key: "summary", label: "Professional Summary", icon: FileText },
    { id: 3, key: "skills", label: "Skills", icon: Code },
    { id: 4, key: "experience", label: "Work Experience", icon: Briefcase },
    { id: 5, key: "education", label: "Education", icon: GraduationCap },
    { id: 6, key: "projects", label: "Projects", icon: Code },
    { id: 7, key: "review", label: "Review & Generate", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const resumeId = searchParams.get("id");

    // Store resumeId for later use (e.g., renaming)
    if (resumeId) {
      setCurrentResumeId(resumeId);
    }

    const loadResumeData = async () => {
      if (resumeId) {
        // This is an existing resume being edited
        try {
          // TODO: Implement API call to fetch existing resume data by ID
          // This would require a backend API endpoint to get resume by ID
          // For now, we'll use a placeholder approach
          console.log(`Loading existing resume with ID: ${resumeId}`);

          // In a real implementation, you would fetch the resume data:
          // const resumeData = await apiClient.get(`/api/resumes/${resumeId}`);
          // setResumeData(resumeData.data);

          // For now, fall back to session storage if available
          const storedData = sessionStorage.getItem("resumeData");
          if (storedData) {
            setResumeData(JSON.parse(storedData));
          } else {
            // If no data is found, redirect to upload
            router.push("/user/upload");
          }
        } catch (error) {
          console.error("Error loading resume data:", error);
          setError("Failed to load resume data");
          router.push("/user/upload");
        }
      } else {
        // Load from sessionStorage as before (new resume or from upload)
        const storedData = sessionStorage.getItem("resumeData");
        if (storedData) {
          setResumeData(JSON.parse(storedData));
        } else {
          router.push("/user/upload");
        }
      }
      setLoading(false);
    };

    loadResumeData();
  }, [router]);

  useEffect(() => {
    if (resumeData) {
      const dataToSave = { ...resumeData };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("resumeData", JSON.stringify(dataToSave));
      }
    }
  }, [resumeData]);

  // const [previewError, setPreviewError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [workExpDateErrors, setWorkExpDateErrors] = useState<{
    [key: string]: string;
  }>({});

  const validatePersonalDetails = (): boolean => {
    if (!resumeData) return false;
    const errors: { [key: string]: string } = {};
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
          const allPartsValid = nameParts.every((part) =>
            namePartRegex.test(part)
          );
          if (!allPartsValid) {
            errors.name =
              "Each name must start with a capital letter and contain only letters";
          }
        }
      }
    }

    // Email Validation
    // "proper email format" is required.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile Validation
    // "keep by default +91 as default and after valid 10 digit only"
    const mobileClean = mobile.replace(/\s+/g, "");
    const phoneRegex = /^\+91\d{10}$/;
    if (!mobile || mobile === "+91") {
      errors.mobile = "Mobile number is required";
    } else if (!phoneRegex.test(mobileClean)) {
      errors.mobile = "Must be +91 followed by exactly 10 digits";
    }

    // Job Title Validation
    // "First letter capital"
    if (!designation) {
      errors.designation = "Job Title is required";
    } else if (designation.charAt(0) !== designation.charAt(0).toUpperCase()) {
      errors.designation = "First letter must be capital";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      // Allow only text (a-z, A-Z), spaces, periods, commas, and hyphens
      processedValue = value.replace(/[^a-zA-Z\s.,-]/g, "");
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

  // Helper function to convert "month - yyyy" to "YYYY-MM" format for month input
  const formatToMonthInput = (value: string): string => {
    if (!value || value.toLowerCase() === "present") return "";
    
    // Try to parse "month - yyyy" or "month yyyy" format
    const match = value.match(/^([a-zA-Z]+)\s*-\s*(\d{4})$|^([a-zA-Z]+)\s+(\d{4})$/);
    if (match) {
      const monthName = (match[1] || match[3]).toLowerCase();
      const year = match[2] || match[4];
      
      const monthMap: { [key: string]: number } = {
        'january': 1, 'jan': 1,
        'february': 2, 'feb': 2,
        'march': 3, 'mar': 3,
        'april': 4, 'apr': 4,
        'may': 5,
        'june': 6, 'jun': 6,
        'july': 7, 'jul': 7,
        'august': 8, 'aug': 8,
        'september': 9, 'sep': 9, 'sept': 9,
        'october': 10, 'oct': 10,
        'november': 11, 'nov': 11,
        'december': 12, 'dec': 12,
      };
      
      const monthNum = monthMap[monthName];
      if (monthNum && year) {
        return `${year}-${String(monthNum).padStart(2, '0')}`;
      }
    }
    
    // If already in YYYY-MM format, return as-is
    if (/^\d{4}-\d{2}$/.test(value)) {
      return value;
    }
    
    return "";
  };

  // Helper function to convert "YYYY-MM" to "month - yyyy" format
  const formatFromMonthInput = (value: string): string => {
    if (!value) return "";
    
    // Parse YYYY-MM format
    const match = value.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = match[1];
      const monthNum = parseInt(match[2], 10);
      
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      if (monthNum >= 1 && monthNum <= 12) {
        return `${monthNames[monthNum - 1]} - ${year}`;
      }
    }
    
    return value;
  };

  // Helper function to parse "month - yyyy" format to Date object
  const parseDateFromFormat = (value: string): Date | null => {
    if (!value || value.toLowerCase() === "present") return null;
    
    const match = value.match(/^([a-zA-Z]+)\s*-\s*(\d{4})$/);
    if (match) {
      const monthName = match[1].toLowerCase();
      const year = parseInt(match[2], 10);
      
      const monthMap: { [key: string]: number } = {
        'january': 0, 'jan': 0,
        'february': 1, 'feb': 1,
        'march': 2, 'mar': 2,
        'april': 3, 'apr': 3,
        'may': 4,
        'june': 5, 'jun': 5,
        'july': 6, 'jul': 6,
        'august': 7, 'aug': 7,
        'september': 8, 'sep': 8, 'sept': 8,
        'october': 9, 'oct': 9,
        'november': 10, 'nov': 10,
        'december': 11, 'dec': 11,
      };
      
      const monthIndex = monthMap[monthName];
      if (monthIndex !== undefined && !isNaN(year)) {
        return new Date(year, monthIndex, 1);
      }
    }
    
    return null;
  };

  // Date validation function for work experience
  const validateWorkExperienceDates = (
    index: number,
    periodFrom: string,
    periodTo: string
  ): string | null => {
    if (!periodFrom) {
      return null; // Start date is optional, no error
    }

    if (periodTo.toLowerCase() === "present") {
      return null; // Present is always valid
    }

    if (!periodTo) {
      return null; // End date is optional, no error
    }

    const startDate = parseDateFromFormat(periodFrom);
    const endDate = parseDateFromFormat(periodTo);

    if (!startDate) {
      return `Start date is invalid`;
    }

    if (!endDate) {
      return `End date is invalid`;
    }

    // Check if end date is before start date
    if (endDate < startDate) {
      return `End date cannot be before start date`;
    }

    // Check if dates are in the future (optional validation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate > today) {
      return `Start date cannot be in the future`;
    }

    if (endDate > today && periodTo.toLowerCase() !== "present") {
      return `End date cannot be in the future. Use "Present" for current positions`;
    }

    return null; // No errors
  };

  const calculateDuration = (from: string, to: string): string => {
    if (!from) return "";
    // Extract year from month name format (e.g., "Jan 2020" -> "2020")
    const fromYearMatch = from.match(/\d{4}/);
    const toYearMatch = to ? to.match(/\d{4}/) : null;
    const fromYear = fromYearMatch ? fromYearMatch[0] : from;
    const toYear = to ? (toYearMatch ? toYearMatch[0] : to === "Present" ? "Present" : to) : "Present";
    return `${fromYear}-${toYear}`;
  };

  const updateWorkExperience = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "period_from" || field === "period_to") {
      const from = field === "period_from" ? value : updated[index].period_from;
      const to = field === "period_to" ? value : updated[index].period_to;
      updated[index].duration = calculateDuration(from, to);

      // Validate dates
      const errorKey = `workExp_${index}_dates`;
      const dateError = validateWorkExperienceDates(index, from, to);
      
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

  const updateStandaloneProject = (
    index: number,
    field: string,
    value: string
  ) => {
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
      if (
        !updated[expIndex].projects[projIndex].technologies.includes(newTech)
      ) {
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

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      apiClient.refreshTokenFromCookies();

      const response = await pdfService.postGeneratePdf({
        requestBody: resumeData!,
      });

      console.log("PDF generation successful:", response);

      let downloadUrl = "";
      let downloadFileName = `${resumeData!.personal.name || "resume"}.pdf`;

      if (
        response &&
        typeof response === "object" &&
        (response as unknown as ApiResponse).status === "success" &&
        (response as unknown as ApiResponse).data &&
        (response as unknown as ApiResponse).data.fileUrl
      ) {
        const apiResponse = response as unknown as ApiResponse;
        const apiData = apiResponse.data;
        downloadUrl = apiData.fileUrl;
        if (apiData.fileName) downloadFileName = apiData.fileName;

        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({
            success: true,
            data: apiData,
            pdfUrl: downloadUrl,
            fileName: downloadFileName,
          })
        );
      } else if (response instanceof Blob) {
        downloadUrl = URL.createObjectURL(response);
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
            downloadUrl = URL.createObjectURL(blob);

            sessionStorage.setItem(
              "pdfResponse",
              JSON.stringify({
                success: true,
                pdfUrl: downloadUrl,
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

      // 0. Open in browser (new tab)
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }

      // 1. Auto-download the PDF
      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = downloadFileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // 2. Refresh resumes (so dashboard is up to date)
      await refreshResumes(true);

      // 3. Redirect to /user (as requested)
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
    if (currentStep < STEPS.length) {
      if (currentStep === 1) {
        if (!validatePersonalDetails()) return;
        // Show rename modal only if pdfName is not already set
        if (!resumeData?.pdfName || resumeData.pdfName.trim() === "") {
          setTempPdfName(resumeData?.pdfName || "");
          setIsRenameModalOpen(true);
          return; // Stop here, modal will handle the move to next step
        }
        // If pdfName already exists, proceed to next step directly
      }
      setCurrentStep((prev) => prev + 1);
      // Removed window.scrollTo because we want internal scroll
    }
  };

  const handleSavePdfName = async () => {
    if(tempPdfName?.trim()?.length === 0) {
      toast.error("Please enter a valid name");
      return;
    }
    
    setIsRenameClicked(true);
    
    if (resumeData) {
      setResumeData({ ...resumeData, pdfName: tempPdfName });

      // If editing an existing resume, call the rename API
      if (currentResumeId && tempPdfName.trim()) {
        try {
          apiClient.refreshTokenFromCookies();
          await apiClient.patch("/dashboard/resumes/rename", {
            resumeId: currentResumeId,
            fileName: tempPdfName.trim(),
          });
          toast.success("Resume name updated");
        } catch (error) {
          console.error("Failed to rename resume:", error);
          // Don't show error toast here as it's not critical - the name is saved locally
          // The rename will happen when the PDF is generated
        }
      }
    }
   
    setIsRenameModalOpen(false);
    setIsRenameClicked(false);
    setCurrentStep(currentStep + 1);
    // window.scrollTo(0, 0); // Removed as per existing code style
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getMissingFieldsForStep = (stepKey: string) => {
    if (!resumeData) return true;
    switch (stepKey) {
      case "personal":
        return (
          !resumeData.personal.name ||
          !resumeData.personal.email ||
          !resumeData.personal.mobile ||
          !resumeData.personal.designation
        );
      case "summary":
        return !resumeData.summary || resumeData.summary.trim() === "";
      case "skills":
        return !resumeData.skills || resumeData.skills.length === 0;
      case "education":
        return (
          !resumeData.education ||
          resumeData.education.length === 0 ||
          resumeData.education.some(
            (edu) => !edu.institution || !edu.degree
          )
        );
      // Experience and Projects are optional, so they are always "valid" for navigation purposes
      case "experience":
        if (
          !resumeData.work_experience ||
          resumeData.work_experience.length === 0
        ) {
          return false;
        }
        return resumeData.work_experience.some(
          (exp) =>
            !exp.company || !exp.position || !exp.period_from || !exp.period_to
        );
      case "projects":
      default:
        return false;
    }
  };

  // Calculate progress based on current step relative to total steps
  const progress = (currentStep / STEPS.length) * 100;

  const isFormComplete = STEPS.every(
    (step) => !getMissingFieldsForStep(step.key)
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const currentStepInfo = STEPS.find((s) => s.id === currentStep) || STEPS[0];

  const STEP_DESCRIPTIONS: Record<
    string,
    { title: string; subtitle: string; context: string }
  > = {
    personal: {
      title: "Tell us about yourself",
      subtitle: "Personal Details",
      context:
        "Start with your basic contact information so employers can reach you.",
    },
    summary: {
      title: "Your professional Summary",
      subtitle: "Professional Summary",
      context:
        "Write a short, compelling summary of your career. scalable, and efficient software solutions.",
    },
    skills: {
      title: "Showcase your expertise",
      subtitle: "Key Skills",
      context:
        "List your technical and soft skills. These keywords help Applicant Tracking Systems (ATS) identify you as a match.",
    },
    experience: {
      title: "Detail your work history",
      subtitle: "Work Experience",
      context:
        "Add your relevant work experience, focusing on achievements and responsibilities. Use action verbs and metrics where possible.",
    },
    education: {
      title: "List your academic background",
      subtitle: "Education",
      context:
        "Include your degrees, schools, and graduation years. You can also mention relevant coursework or honors.",
    },
    projects: {
      title: "Highlight your key projects",
      subtitle: "Projects",
      context:
        "Showcase specific projects that demonstrate your skills. describe your role and the technologies used.",
    },
    review: {
      title: "Final Review",
      subtitle: "Review & Generate",
      context:
        "Check everything carefully. Once you're satisfied, generate your PDF resume.",
    },
  };

  const stepContent =
    STEP_DESCRIPTIONS[currentStepInfo.key] || STEP_DESCRIPTIONS.personal;

  return (
    <div
      className="h-full bg-slate-50 flex flex-col text-slate-900 overflow-hidden"
      style={{
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Main Content Grid */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8 lg:p-8 overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-12 gap-12 h-full">
          {/* Left Column: Context & Help */}
          <div className="lg:col-span-5 h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="space-y-4">
              <span className="text-sm font-semibold text-slate-500 tracking-wide">
                <span className="font-bold text-slate-700">
                  {" "}
                  {currentStep}/{STEPS.length}{" "}
                </span>
                &nbsp; {stepContent.subtitle}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                {stepContent.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {stepContent.context}
              </p>
            </div>

            {/* Large Illustration / Preview Card */}
            <div className="hidden lg:flex flex-1 min-h-[400px] items-center justify-center p-2 relative overflow-hidden group">
              <div className="relative w-full h-full">
                <Image
                  src="/resume-screen.png"
                  alt="Resume "
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-4 md:px-4  pb-4 shrink-0"></div>

              <div className="pt-4 overflow-y-auto flex-1 pr-2">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {currentStep === 1 && resumeData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Full Name
                        </label>
                        <input
                          value={resumeData?.personal.name || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // 1. Allow only letters and spaces, replace multiple spaces with single space
                            const filtered = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");

                            // 2. Title Case: Capitalize first letter of each word, rest lowercase
                            const parts = filtered.split(" ");
                            const formatted = parts
                              .map(
                                (p) =>
                                  p.charAt(0).toUpperCase() +
                                  p.slice(1).toLowerCase()
                              )
                              .join(" ");

                            updatePersonal("name", formatted);
                          }}
                          className={`w-full bg-white border rounded-sm ${validationErrors.name
                            ? "border-rose-500"
                            : "border-slate-300"
                            } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
                          placeholder="John Doe"
                        />
                        {validationErrors.name && (
                          <p className="text-xs text-rose-500 px-2 mt-1">
                            {validationErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Job Title
                        </label>
                        <input
                          value={resumeData?.personal.designation || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // 1. Allow only letters and spaces, replace multiple spaces with single space
                            const filtered = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");

                            // 2. Title Case: Capitalize first letter of each word, rest lowercase
                            const parts = filtered.split(" ");
                            const formatted = parts
                              .map(
                                (p) =>
                                  p.charAt(0).toUpperCase() +
                                  p.slice(1).toLowerCase()
                              )
                              .join(" ");

                            updatePersonal("designation", formatted);
                          }}
                          className={`w-full bg-white border rounded-sm ${validationErrors.designation
                            ? "border-rose-500"
                            : "border-slate-300"
                            } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
                          placeholder="Software Engineer"
                        />
                        {validationErrors.designation && (
                          <p className="text-xs text-rose-500 px-2 mt-1">
                            {validationErrors.designation}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Email
                        </label>
                        <input
                          value={resumeData?.personal.email || ""}
                          onChange={(e) =>
                            updatePersonal("email", e.target.value)
                          }
                          className={`w-full bg-white border rounded-sm ${validationErrors.email
                            ? "border-rose-500"
                            : "border-slate-300"
                            } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
                          placeholder="john@example.com"
                        />
                        {validationErrors.email && (
                          <p className="text-xs text-rose-500 px-2 mt-1">
                            {validationErrors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Mobile
                        </label>
                        <input
                          value={resumeData?.personal.mobile || "+91"}
                          onChange={(e) => {
                            let val = e.target.value;

                            // 1. Ensure it always starts with +91
                            if (!val.startsWith("+91")) {
                              // If user tries to delete the prefix or change it, enforce it
                              // But allow them to type if they are adding digits
                              const digitsOnly = val.replace(/\D/g, "");
                              // If they cleared it, keep +91
                              if (digitsOnly.length === 0) {
                                val = "+91";
                              } else {
                                // If they pasted something without +91
                                val = "+91" + digitsOnly.slice(-10);
                              }
                            } else {
                              // 2. Allow only digits after +91 and limit to 10 digits
                              const prefix = "+91";
                              const rest = val
                                .slice(prefix.length)
                                .replace(/[^0-9]/g, "")
                                .slice(0, 10);
                              val = prefix + rest;
                            }

                            updatePersonal("mobile", val);
                          }}
                          className={`w-full bg-white border rounded-sm ${validationErrors.mobile
                            ? "border-rose-500"
                            : "border-slate-300"
                            } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
                          placeholder="+91 00000 00000"
                        />
                        {validationErrors.mobile && (
                          <p className="text-xs text-rose-500 px-2 mt-1">
                            {validationErrors.mobile}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Location
                        </label>
                        <input
                          value={resumeData?.personal.location || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Allow only letters, numbers, spaces, commas, ', . , ", and :
                            const filtered = val.replace(
                              /[^a-zA-Z0-9,\s'.":]/g,
                              ""
                            );
                            updatePersonal("location", filtered);
                          }}
                          className={`w-full bg-white border rounded-sm ${validationErrors.location
                            ? "border-rose-500"
                            : "border-slate-300"
                            } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
                          placeholder="New York, USA"
                        />
                        {validationErrors.location && (
                          <p className="text-xs text-rose-500 px-2 mt-1">
                            {validationErrors.location}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2  font-semibold text-slate-700 ">
                          Gender
                        </label>
                        <select
                          value={resumeData?.personal.gender || ""}
                          onChange={(e) =>
                            updatePersonal("gender", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && resumeData && (
                    <div className="space-y-4 pl-4">
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Professional Summary{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <AutoHeightTextarea
                          value={resumeData?.summary}
                          onChange={(e) => updateSummary(e.target.value)}
                          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[250px] resize-none"
                          placeholder="Write a brief summary of your career highlights..."
                        />
                      </div>
                      <div className="flex justify-end pr-2">
                        <span className="text-xs text-slate-400">
                          {resumeData.summary.length} characters
                        </span>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && resumeData && (
                    <div className="space-y-4 pl-4">
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Key Skills
                        </label>
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={addSkill}
                          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                          placeholder="Type a skill and press Enter..."
                        />
                        <div className="p-4 border border-slate-200 rounded-sm bg-white min-h-[120px] mb-3">
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.length === 0 && (
                              <p className="text-slate-400 text-sm italic">
                                No skills added yet...
                              </p>
                            )}
                            {resumeData.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-blue-600 px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1 border border-slate-200"
                              >
                                {skill}
                                <button
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-slate-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && resumeData && (
                    <div className="space-y-6 pl-4">
                      {resumeData.work_experience.map((exp, index) => (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
                        >
                          <button
                            onClick={() => deleteWorkExperience(index)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Company
                              </label>
                              <input
                                value={exp.company}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="Company Name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Position
                              </label>
                              <input
                                value={exp.position}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "position",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="Job Title"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={formatToMonthInput(exp.period_from)}
                                onChange={(e) => {
                                  const monthValue = e.target.value;
                                  const formattedValue = formatFromMonthInput(monthValue);
                                  updateWorkExperience(
                                    index,
                                    "period_from",
                                    formattedValue
                                  );
                                }}
                                className={`w-full bg-white border rounded-sm px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 text-slate-700 ${
                                  workExpDateErrors[`workExp_${index}_dates`]
                                    ? "border-rose-500 focus:border-rose-500"
                                    : "border-slate-300 focus:border-[var(--primary)]"
                                }`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                End Date
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="month"
                                  value={exp.period_to.toLowerCase() === "present" ? "" : formatToMonthInput(exp.period_to)}
                                  onChange={(e) => {
                                    const monthValue = e.target.value;
                                    const formattedValue = formatFromMonthInput(monthValue);
                                    updateWorkExperience(
                                      index,
                                      "period_to",
                                      formattedValue
                                    );
                                  }}
                                  disabled={exp.period_to.toLowerCase() === "present"}
                                  className={`flex-1 bg-white border rounded-sm px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    workExpDateErrors[`workExp_${index}_dates`]
                                      ? "border-rose-500 focus:border-rose-500"
                                      : "border-slate-300 focus:border-[var(--primary)]"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (exp.period_to.toLowerCase() === "present") {
                                      updateWorkExperience(index, "period_to", "");
                                    } else {
                                      updateWorkExperience(index, "period_to", "Present");
                                    }
                                  }}
                                  className={`px-4 py-3 border rounded-sm border-slate-300 transition-all duration-200 text-sm font-medium ${
                                    exp.period_to.toLowerCase() === "present"
                                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                      : "bg-white text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  Present
                                </button>
                              </div>
                            </div>
                            {workExpDateErrors[`workExp_${index}_dates`] && (
                              <div className="col-span-2">
                                <p className="text-xs text-rose-500 px-2 mt-1">
                                  {workExpDateErrors[`workExp_${index}_dates`]}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                              Key Highlights / Projects
                            </h4>

                            <div className="space-y-3">
                              {exp.projects.map((proj, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="bg-slate-50 p-6 rounded-sm border border-slate-200 relative group/proj space-y-4"
                                >
                                  <div className="space-y-1">
                                    <label className="text-sm px-2 font-semibold text-slate-700">
                                      Highlight Name
                                    </label>
                                    <input
                                      value={proj.name}
                                      onChange={(e) =>
                                        updateProjectField(
                                          index,
                                          pIdx,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g. Lead Frontend Development"
                                      className="w-full bg-white border rounded-sm border-slate-300 px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-sm px-2 font-semibold text-slate-700">
                                      Description / Responsibilities
                                    </label>
                                    <AutoHeightTextarea
                                      value={proj.description}
                                      onChange={(e) =>
                                        updateProjectField(
                                          index,
                                          pIdx,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      placeholder="What did you achieve? Use bullet points if needed..."
                                      className="w-full bg-white border rounded-sm border-slate-300 px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-sm min-h-[100px] resize-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-sm px-2 font-semibold text-slate-700">
                                      Technologies
                                    </label>
                                    <input
                                      value={
                                        workExpTechInputs[`${index}-${pIdx}`] ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        setWorkExpTechInputs({
                                          ...workExpTechInputs,
                                          [`${index}-${pIdx}`]: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) =>
                                        addWorkExpTech(e, index, pIdx)
                                      }
                                      placeholder="Add tech (Press Enter)"
                                      className="w-full bg-white border rounded-sm border-slate-300 px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-xs"
                                    />
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {proj.technologies.map((tech, tIdx) => (
                                        <span
                                          key={tIdx}
                                          className="bg-white text-slate-700 px-2 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200"
                                        >
                                          {tech}
                                          <button
                                            onClick={() =>
                                              removeWorkExpTech(
                                                index,
                                                pIdx,
                                                tech
                                              )
                                            }
                                            className="hover:text-rose-500 transition-colors p-0.5"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => deleteProject(index, pIdx)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => addProject(index)}
                              className="mt-4 text-sm font-bold text-[var(--primary)] flex items-center gap-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 px-4 py-2 rounded-sm transition-all"
                            >
                              <Plus className="w-4 h-4" /> Add Highlight
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addWorkExperience}
                        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
                        Add New Experience
                      </button>
                    </div>
                  )}

                  {currentStep === 5 && resumeData && (
                    <div className="space-y-6 pl-4">
                      {resumeData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
                        >
                          <button
                            onClick={() => deleteEducation(index)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Institution{" "}
                                <span className="text-rose-500">*</span>
                              </label>
                              <input
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="University Name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Degree{" "}
                                <span className="text-rose-500">*</span>
                              </label>
                              <input
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="e.g. Bachelor's in CS"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Field of Study
                              </label>
                              <input
                                value={edu.field || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "field",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="Major"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Graduation Date
                              </label>
                              <input
                                type="month"
                                value={formatToMonthInput(edu.graduation_year)}
                                onChange={(e) => {
                                  const monthValue = e.target.value;
                                  const formattedValue = formatFromMonthInput(monthValue);
                                  updateEducation(
                                    index,
                                    "graduation_year",
                                    formattedValue
                                  );
                                }}
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] text-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addEducation}
                        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
                        Add Education
                      </button>
                    </div>
                  )}

                  {currentStep === 6 && resumeData && (
                    <div className="space-y-6 pl-4">
                      {resumeData.projects.map((proj, index) => (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
                        >
                          <button
                            onClick={() => deleteStandaloneProject(index)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Project Name
                              </label>
                              <input
                                value={proj.name}
                                onChange={(e) =>
                                  updateStandaloneProject(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="Project Name"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Description
                              </label>
                              <AutoHeightTextarea
                                value={proj.description}
                                onChange={(e) =>
                                  updateStandaloneProject(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[120px] resize-none"
                                placeholder="Briefly describe what you built..."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Technologies
                              </label>
                              <input
                                value={projectTechInputs[index] || ""}
                                onChange={(e) =>
                                  setProjectTechInputs({
                                    ...projectTechInputs,
                                    [index]: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => addProjectTech(e, index)}
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="Add technology (Press Enter)"
                              />
                              <div className="mt-3 flex flex-wrap gap-2">
                                {proj.technologies.map((tech, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="bg-white text-blue-600 px-2.5 py-1 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200 shadow-sm"
                                  >
                                    {tech}
                                    <button
                                      onClick={() =>
                                        removeProjectTech(index, tech)
                                      }
                                      className="hover:text-rose-500 transition-colors p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addStandaloneProject}
                        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
                        Add Project
                      </button>
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="flex flex-col items-center justify-center h-full py-0 text-center">
                      {!isFormComplete && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-0 rounded-sm border border-rose-100 text-sm font-bold flex items-center gap-2 mb-4">
                          <AlertCircle className="w-4 h-4" />
                          Some required fields are missing. Please check.
                        </div>
                      )}

                      {/* Analysis Section */}
                      <div className="w-full max-w-4xl mx-auto mb-6">
                        {analysisResult && (
                          <div className="bg-white border-2 border-indigo-100 rounded-sm p-6 shadow-sm mb-6 animate-in slide-in-from-top-2">
                            {/* ATS Score Display */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 pb-6 border-b border-indigo-50">
                              <div className="flex-shrink-0 relative">
                                <div className="relative h-24 w-24 flex items-center justify-center">
                                  {/* Circular Progress Ring */}
                                  <svg
                                    className="absolute inset-0 h-full w-full -rotate-90 transform"
                                    viewBox="0 0 36 36"
                                  >
                                    {/* Background Circle */}
                                    <path
                                      className="text-indigo-100"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    />
                                    {/* Progress Circle */}
                                    <path
                                      className={
                                        (analysisResult.atsScore || 0) >= 70
                                          ? "text-emerald-500"
                                          : (analysisResult.atsScore || 0) >= 50
                                          ? "text-amber-500"
                                          : "text-rose-500"
                                      }
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeDasharray={`${(analysisResult.atsScore || 0)}, 100`}
                                      strokeLinecap="round"
                                      strokeWidth="2.5"
                                    />
                                  </svg>
                                  {/* Score Text */}
                                  <div className="relative z-10 flex flex-col items-center justify-center">
                                    <span
                                      className={`text-2xl font-bold ${
                                        (analysisResult.atsScore || 0) >= 70
                                          ? "text-emerald-600"
                                          : (analysisResult.atsScore || 0) >= 50
                                          ? "text-amber-600"
                                          : "text-rose-600"
                                      }`}
                                    >
                                      {analysisResult.atsScore || 0}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 -mt-1">
                                      %
                                    </span>
                                  </div>
                                  {/* Outer Ring */}
                                  <div className="absolute inset-0 rounded-full ring-4 ring-indigo-50" />
                                </div>
                              </div>
                              <div className="text-center sm:text-left flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-1">
                                  Resume Analysis Score
                                </h3>           
                                <p className="text-slate-500 text-sm">
                                  Based on industry standards and ATS
                                  compatibility
                                </p>
                                {/* Score Label */}
                                <div className="mt-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      (analysisResult.atsScore || 0) >= 70
                                        ? "bg-emerald-100 text-emerald-700"
                                        : (analysisResult.atsScore || 0) >= 50
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {(analysisResult.atsScore || 0) >= 70
                                      ? "Excellent"
                                      : (analysisResult.atsScore || 0) >= 50
                                      ? "Good"
                                      : "Needs Improvement"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Overall Review Section */}
                            {analysisResult.overallReview && (
                              <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-sm">
                                <div className="flex items-start gap-3">
                                  {(analysisResult.atsScore || 0) >= 70 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800 mb-2">
                                      Overall Review
                                    </h4>
                                    <p className="text-slate-700 text-sm leading-relaxed text-left whitespace-pre-line">
                                      {analysisResult.overallReview}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section Improvements */}
                            {analysisResult.sectionImprovements &&
                              Object.keys(analysisResult.sectionImprovements).length > 0 ? (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
                                 
                                  Section-Specific Improvements
                                </h4>

                                {/* Summary Section */}
                                {analysisResult.sectionImprovements.summary && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200" 
                                  onClick={() => { setCurrentStep(2) }}
                                  title="Click to edit summary">
                                    <div className="flex items-start gap-3">
                                      <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-slate-800 mb-2">
                                          Summary Section
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed text-left whitespace-pre-line">
                                          {analysisResult.sectionImprovements.summary}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Skills Section */}
                                {analysisResult.sectionImprovements.skills && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200" 
                                  onClick={() => { setCurrentStep(3) }}
                                  title="Click to edit skills">
                                    <div className="flex items-start gap-3">
                                      <Code className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-slate-800 mb-2">
                                          Skills Section
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed text-left whitespace-pre-line">
                                          {analysisResult.sectionImprovements.skills}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Experience Section */}
                                {analysisResult.sectionImprovements.experience && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200" 
                                  onClick={() => { setCurrentStep(4) }}
                                  title="Click to edit work experience">
                                    <div className="flex items-start gap-3">
                                      <Briefcase className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-slate-800 mb-2">
                                          Work Experience
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed text-left whitespace-pre-line">
                                          {analysisResult.sectionImprovements.experience}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Education Section */}
                                {analysisResult.sectionImprovements.education && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200" 
                                  onClick={() => { setCurrentStep(5) }}
                                  title="Click to edit education">
                                    <div className="flex items-start gap-3">
                                      <GraduationCap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-slate-800 mb-2">
                                          Education
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed text-left whitespace-pre-line">
                                          {analysisResult.sectionImprovements.education}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Projects Section */}
                                {analysisResult.sectionImprovements.projects && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200" 
                                  onClick={() => { setCurrentStep(6) }}
                                  title="Click to edit projects">
                                    <div className="flex items-start gap-3">
                                      <Code className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-slate-800 mb-2">
                                          Projects
                                        </h5>
                                        <p className="text-slate-600 text-sm leading-relaxed text-left whitespace-pre-line">
                                          {analysisResult.sectionImprovements.projects}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-500 text-sm italic">
                                No specific improvements detected. Your resume
                                looks good!
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Finalize Action Card */}
                      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="text-center space-y-6 max-w-lg w-full px-6">
                          {/* 1. Pre-Analysis Action (Only show if not analyzed yet) */}
                          {!analysisResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                              <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="w-full bg-white text-blue-600 border border-blue-300 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {analyzing ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : null}
                                {analyzing ? "Analyzing..." : "Analyze Resume"}
                              </button>

                              {/* Styled Divider */}
                              <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs font-bold uppercase tracking-wider">
                                  OR SKIP TO FINALIZATION
                                </span>
                                <div className="flex-grow border-t border-gray-300"></div>
                              </div>
                            </div>
                          )}

                          {/* 2. Final Generation Action */}
                          <div className="space-y-4">
                            {!analysisResult && (
                              <h2 className="text-2xl font-bold text-gray-800">
                                Ready to Download?
                              </h2>
                            )}
                            {analysisResult && (
                              <div className="w-16 h-16 bg-emerald-100 rounded-md flex items-center justify-center mx-auto text-emerald-600 mb-4 shadow-sm animate-in zoom-in">
                                <CheckCircle2 className="w-8 h-8" />
                              </div>
                            )}

                            <p className="text-gray-600 text-sm leading-relaxed">
                              {analysisResult
                                ? "Great! Your resume has been analyzed and is ready for export."
                                : "You can generate your PDF now, but we recommend analyzing it first."}
                            </p>

                            <button
                              onClick={handleGenerate}
                              disabled={generating || !isFormComplete}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-base font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
                            >
                              {generating ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  Generate Resume
                                  <ArrowRight className="w-5 h-5" />
                                </>
                              )}
                            </button>

                            {!isFormComplete && (
                              <p className="text-rose-500 text-sm font-medium mt-4 bg-rose-50 p-2 rounded-lg inline-block">
                                Please complete all required fields before
                                generating.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Progress Bar */}
      <div className="bg-white border-t border-slate-200 flex flex-col z-50 shrink-0 relative">
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-6 py-2 flex justify-between items-center w-full max-w-[1400px] mx-auto">
          <div className="flex-1">
            {" "}
            {/* Left Side - Back Button */}
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-8 py-2.5 rounded-sm font-bold border transition-all flex items-center gap-2 ${currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                }`}
            >
              Back
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            {" "}
            {/* Right Side - Next/Generate Button */}
            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                disabled={getMissingFieldsForStep(currentStepInfo.key)}
                className="px-8 py-2.5 rounded-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => router.push("/user/resumes")}
                className="px-8 py-2.5 rounded-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Rename Modal */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Your PDF</DialogTitle>
            <DialogDescription>
              Give your resume a name. This will be the file name when you
              download the generated PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={tempPdfName}
                onChange={(e) => setTempPdfName(e.target.value)}
                placeholder="e.g. My_Resume_2024"
                className="col-span-3 h-10 border-slate-200 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <button
              onClick={() => {
                // Save tempPdfName even when skipping (preserves any partial input)
                if (resumeData) {
                  setResumeData({ ...resumeData, pdfName: tempPdfName });
                }
                setIsRenameModalOpen(false);
                setCurrentStep(currentStep + 1);
                // Removed window.scrollTo as per existing code style
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-sm border border-slate-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSavePdfName}
              disabled={isRenameClicked || tempPdfName.trim().length === 0}
              className="px-4 py-2 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
            >
              Save & Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
