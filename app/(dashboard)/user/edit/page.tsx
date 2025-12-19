"use client";

import { apiClient, pdfService } from "@/app/api/client";
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
  RefreshCw,
  Trash2,
  User,
  X,
} from "lucide-react";
// import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ResumeData {
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

export default function EditPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [, setError] = useState("");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [workExpTechInputs, setWorkExpTechInputs] = useState<{
    [key: string]: string;
  }>({});
  const [projectTechInputs, setProjectTechInputs] = useState<{
    [key: number]: string;
  }>({});

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

  const [previewError, setPreviewError] = useState<string | null>(null);

  const generatePreview = async () => {
    if (!resumeData) return;

    // reset states
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl(null);

    try {
      console.log("Generating preview for data:", resumeData);
      apiClient.refreshTokenFromCookies();
      const response = await pdfService.postGeneratePdf({
        requestBody: resumeData,
      });
      console.log("Preview response:", response);

      let url = "";

      if (
        response &&
        typeof response === "object" &&
        (response as unknown as ApiResponse).status === "success" &&
        (response as unknown as ApiResponse).data &&
        (response as unknown as ApiResponse).data.fileUrl
      ) {
        url = (response as unknown as ApiResponse).data.fileUrl;
      } else if (response instanceof Blob) {
        url = URL.createObjectURL(response);
      } else {
        const maybeData =
          (response as { pdfBase64?: string }).pdfBase64 ||
          (response as { data?: string }).data ||
          response;

        if (typeof maybeData === "string") {
          // Handle both prefixed and non-prefixed base64
          const base64 = maybeData.startsWith("data:application/pdf;base64,")
            ? maybeData.split(",")[1]
            : maybeData;

          try {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            url = URL.createObjectURL(blob);
          } catch (e) {
            console.error("Failed to decode base64 PDF", e);
            throw new Error("Invalid PDF data received");
          }
        }
      }

      if (url) {
        setPreviewUrl(url);
      } else {
        throw new Error("Could not parse PDF from response");
      }
    } catch (error: unknown) {
      console.error("Preview generation failed", error);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to generate preview"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to generate preview when entering step 7
    if (currentStep === 7 && resumeData) {
      generatePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, resumeData]);

  const updatePersonal = (field: string, value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [field]: value },
    });
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
    updated[index] = { ...updated[index], [field]: value };
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

  const calculateDuration = (from: string, to: string): string => {
    if (!from) return "";
    const fromYear = from.split("-")[0];
    const toYear = to ? to.split("-")[0] : "Present";
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
    }

    setResumeData({ ...resumeData, work_experience: updated });
  };

  const addWorkExperience = () => {
    if (!resumeData) return;
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

      if (
        response &&
        typeof response === "object" &&
        (response as unknown as ApiResponse).status === "success" &&
        (response as unknown as ApiResponse).data &&
        (response as unknown as ApiResponse).data.fileUrl
      ) {
        const apiResponse = response as unknown as ApiResponse;
        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({
            success: true,
            data: apiResponse.data,
            pdfUrl: apiResponse.data.fileUrl,
            fileName:
              apiResponse.data.fileName ||
              `${resumeData!.personal.name || "resume"}.pdf`,
          })
        );
      } else if (response instanceof Blob) {
        const pdfUrl = URL.createObjectURL(response);
        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({
            success: true,
            pdfUrl,
            fileName: `${resumeData!.personal.name || "resume"}.pdf`,
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
            const pdfUrl = URL.createObjectURL(blob);
            sessionStorage.setItem(
              "pdfResponse",
              JSON.stringify({
                success: true,
                pdfUrl,
                fileName: `${resumeData!.personal.name || "resume"}.pdf`,
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
      // router.push("/user/result");
      // Instead of redirecting, just ensure preview is updated and show success
      // We can trigger a refresh of the preview Url from the session storage we just set
      const pdfResponseStr = sessionStorage.getItem("pdfResponse");
      if (pdfResponseStr) {
        const parsed = JSON.parse(pdfResponseStr);
        if (parsed.pdfUrl) {
          setPreviewUrl(parsed.pdfUrl);
        }
      }
      setCurrentStep(7); // Ensure we are on the last step
    } catch (error: unknown) {
      console.error("PDF generation failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate PDF"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      // Removed window.scrollTo because we want internal scroll
    }
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
          resumeData.education.some((edu) => !edu.institution || !edu.degree)
        );
      // Experience and Projects are optional, so they are always "valid" for navigation purposes
      case "experience":
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
        "Start with your basic contact information so employers can reach you. A professional photo is optional but recommended for some regions.",
    },
    summary: {
      title: "Summarize your professional story",
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
              <div className="px-4 md:px-4 pt-6 md:pt-8 pb-4 shrink-0">

              </div>

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
                      <div className="space-y-1 ">
                        <label className="text-md px-2 font-semibold text-slate-700 ">
                          Full Name
                        </label>
                        <input
                          value={resumeData?.personal.name || ""}
                          onChange={(e) =>
                            updatePersonal("name", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Job Title
                        </label>
                        <input
                          value={resumeData?.personal.designation || ""}
                          onChange={(e) =>
                            updatePersonal("designation", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700 ">
                          Email
                        </label>
                        <input
                          value={resumeData?.personal.email || ""}
                          onChange={(e) =>
                            updatePersonal("email", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700 ">
                          Mobile
                        </label>
                        <input
                          value={resumeData?.personal.mobile || ""}
                          onChange={(e) =>
                            updatePersonal("mobile", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-md px-2 font-semibold text-slate-700">
                          Location
                        </label>
                        <input
                          value={resumeData?.personal.location || ""}
                          onChange={(e) =>
                            updatePersonal("location", e.target.value)
                          }
                          className="w-full bg-white border rounded-sm border-slate-300  px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200  focus:outline-none  focus:border-b-2  focus:border-[var(--primary)]  placeholder:text-slate-300 transition-all"
                          placeholder="New York, USA"
                        />
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
                          Professional Summary <span className="text-rose-500">*</span>
                        </label>
                        <textarea
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
                        <div className="p-4 border border-slate-200 rounded-sm bg-white min-h-[120px] mb-3">
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.length === 0 && (
                              <p className="text-slate-400 text-sm italic">No skills added yet...</p>
                            )}
                            {resumeData.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1 border border-slate-200"
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
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={addSkill}
                          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                          placeholder="Type a skill and press Enter..."
                        />
                      </div>
                      <p className="text-xs text-slate-500 px-2">
                        Press Enter to add a skill. Keywords help ATS systems find you.
                      </p>
                    </div>
                  )}

                  {currentStep === 4 && resumeData && (
                    <div className="space-y-6 pl-4">
                      {resumeData.work_experience.map((exp, index) => (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-sm border border-slate-300 shadow-sm relative group hover:shadow-md transition-all"
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
                                type="date"
                                value={exp.period_from}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "period_from",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] text-slate-700"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={exp.period_to}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "period_to",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] text-slate-700"
                              />
                            </div>
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
                                      Technologies
                                    </label>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {proj.technologies.map((tech, tIdx) => (
                                        <span
                                          key={tIdx}
                                          className="bg-white text-slate-700 px-2 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200 shadow-sm"
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
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-sm px-2 font-semibold text-slate-700">
                                      Description / Responsibilities
                                    </label>
                                    <textarea
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
                                      className="w-full bg-white border rounded-sm border-slate-300 px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-sm min-h-[80px] resize-none"
                                    />
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
                          className="bg-white p-6 rounded-sm border border-slate-300 shadow-sm relative group hover:shadow-md transition-all"
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
                                Institution
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
                                Degree
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
                                value={edu.field}
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
                                Graduation Year
                              </label>
                              <input
                                type="text"
                                value={edu.graduation_year}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "graduation_year",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                                placeholder="YYYY"
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
                          className="bg-white p-6 rounded-sm border border-slate-300 shadow-sm relative group hover:shadow-md transition-all"
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
                                Technologies
                              </label>
                              <div className="p-3 border border-slate-200 rounded-sm bg-slate-50 mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {proj.technologies.map((tech, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="bg-white text-slate-700 px-2.5 py-1 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200 shadow-sm"
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
                            </div>

                            <div className="space-y-1">
                              <label className="text-md px-2 font-semibold text-slate-700">
                                Description
                              </label>
                              <textarea
                                value={proj.description}
                                onChange={(e) =>
                                  updateStandaloneProject(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[100px] resize-none"
                                placeholder="Briefly describe what you built..."
                              />
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
                    <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                      {/* <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-emerald-200 shadow-lg"><CheckCircle2 className="w-8 h-8" /></div> */}
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Ready to Generate!
                      </h2>
                      <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                        Review the preview below, then click Generate to finish.
                      </p>

                      {!isFormComplete && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-sm border border-rose-100 text-sm font-bold flex items-center gap-2 mb-4">
                          <AlertCircle className="w-4 h-4" /> Some required
                          fields are missing. Please check the sidebar.
                        </div>
                      )}

                      {/* PDF Preview Area */}
                      <div className="w-full max-w-4xl mx-auto bg-slate-200 rounded-sm overflow-hidden border border-slate-300 shadow-inner h-[500px] flex items-center justify-center relative">
                        {previewLoading ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
                            <p className="text-slate-500 font-medium">
                              Generating Preview...
                            </p>
                          </div>
                        ) : previewError ? (
                          <div className="flex flex-col items-center gap-3 p-6 max-w-sm">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
                              <AlertCircle className="w-6 h-6" />
                            </div>
                            <p className="text-slate-800 font-semibold">
                              Preview Failed
                            </p>
                            <p className="text-slate-500 text-sm mb-2">
                              {previewError}
                            </p>
                            <button
                              onClick={generatePreview}
                              className="px-4 py-2 bg-[var(--primary)] text-white rounded-sm text-sm font-bold hover:bg-[var(--primary-700)] transition-colors flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" /> Retry Preview
                            </button>
                          </div>
                        ) : previewUrl ? (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full "
                            title="Resume Preview"
                          />
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center gap-2">
                            <FileText className="w-12 h-12 opacity-50" />
                            <p>Preview will appear here</p>
                            <p className="text-xs text-slate-300">
                              v1.1 - {resumeData ? "Data Ready" : "No Data"}
                            </p>
                            <button
                              onClick={generatePreview}
                              className="mt-2 px-4 py-2 bg-white border border-slate-300 rounded-sm text-sm font-bold hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" /> Load Preview
                            </button>
                          </div>
                        )}
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
      {/* Sticky Footer with Progress Bar */}
      <div className="bg-white border-t border-slate-200 flex flex-col z-50 shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.1)] shrink-0 relative">
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
                className="px-8 py-2.5 rounded-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating || !isFormComplete}
                className="px-8 py-2.5 rounded-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-slate-300 disabled:text-slate-500"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                  </>
                ) : previewUrl ? (
                  <>
                    Regenerate PDF <RefreshCw className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Generate PDF <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
