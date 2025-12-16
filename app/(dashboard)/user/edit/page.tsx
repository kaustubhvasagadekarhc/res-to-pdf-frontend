"use client";

import { apiClient, pdfService } from "@/app/api/client";
import {  motion } from "framer-motion";
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
  const [workExpTechInputs, setWorkExpTechInputs] = useState<{ [key: string]: string }>({});
  const [projectTechInputs, setProjectTechInputs] = useState<{ [key: number]: string }>({});

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
    if (e.key === 'Enter' && skillInput.trim()) {
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
      skills: resumeData.skills.filter(s => s !== skillToRemove),
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

  const addWorkExpTech = (e: React.KeyboardEvent<HTMLInputElement>, expIndex: number, projIndex: number) => {
    const inputValue = workExpTechInputs[`${expIndex}-${projIndex}`] || "";
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!resumeData) return;
      const newTech = inputValue.trim();
      const updated = [...resumeData.work_experience];
      if (!updated[expIndex].projects[projIndex].technologies.includes(newTech)) {
         updated[expIndex].projects[projIndex].technologies.push(newTech);
         setResumeData({ ...resumeData, work_experience: updated });
      }
      setWorkExpTechInputs({ ...workExpTechInputs, [`${expIndex}-${projIndex}`]: "" });
    }
  };

  const removeWorkExpTech = (expIndex: number, projIndex: number, techToRemove: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.work_experience];
    updated[expIndex].projects[projIndex].technologies = updated[expIndex].projects[projIndex].technologies.filter(t => t !== techToRemove);
    setResumeData({ ...resumeData, work_experience: updated });
  };

  const addProjectTech = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const inputValue = projectTechInputs[index] || "";
    if (e.key === 'Enter' && inputValue.trim()) {
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
    updated[index].technologies = updated[index].technologies.filter(t => t !== techToRemove);
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
      router.push("/user/result");
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
        return !resumeData.personal.name || !resumeData.personal.email || !resumeData.personal.mobile || !resumeData.personal.designation;
      case "summary":
        return !resumeData.summary || resumeData.summary.trim() === "";
      case "skills":
        return !resumeData.skills || resumeData.skills.length === 0;
      case "education":
         return !resumeData.education || resumeData.education.length === 0 || resumeData.education.some(edu => !edu.institution || !edu.degree);
      default:
        return false;
    }
  };

  const isFormComplete = STEPS.every((step) => !getMissingFieldsForStep(step.key));

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentStepInfo = STEPS.find((s) => s.id === currentStep) || STEPS[0];

  return (
    <div className="flex bg-slate-50 h-[calc(99vh-64px)] overflow-hidden font-sans text-slate-900">
      {/* Sidebar - Left Panel */}
      <aside className="hidden lg:flex flex-col w-1/3 max-w-[280px] bg-white border-r border-slate-200 h-full overflow-y-auto">
        <div className="p-6">
          {/* <h1 className="text-xl font-bold text-slate-800 tracking-tight">CVSync</h1>
          <p className="text-xs text-slate-500 mt-1">Build your resume</p> */}
        </div>

        <div className="flex-1 px-4 pb-4">
           {STEPS.map((step, index) => {
             const isActive = step.id === currentStep;
             const isCompleted = !getMissingFieldsForStep(step.key); 
             const hasError = getMissingFieldsForStep(step.key);
             const isLast = index === STEPS.length - 1;

             return (
               <div 
                 key={step.id} 
                 className="relative"
               >
                 {/* Connecting Line Segments */}
                 {index !== 0 && (
                    <div className="absolute left-8 top-0 h-1/2 w-[2px] -ml-[1px] bg-slate-200 z-0" />
                 )}
                 {!isLast && (
                    <div className="absolute left-8 top-1/2 h-1/2 w-[2px] -ml-[1px] bg-slate-200 z-0" />
                 )}

                 <div 
                   onClick={() => setCurrentStep(step.id)}
                   className={`relative z-10 flex items-center gap-4 px-4 py-4 cursor-pointer transition-all duration-200 group rounded-xl ${
                     isActive ? "bg-indigo-50/50" : "hover:bg-slate-50"
                   }`}
                 > 
                   {/* Icon/Number Circle */}
                   <div
                     className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all z-10 ${
                       isActive
                         ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                         : hasError 
                         ? "bg-white border-rose-200 text-rose-500"
                         : isCompleted
                         ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                         : "bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500"
                     }`}
                   >
                     {isCompleted && !isActive && !hasError ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                   </div>
                   
                   <span className={`text-sm flex-1 ${isActive ? 'font-bold text-indigo-900' : 'font-medium text-slate-500 group-hover:text-slate-700'}`}>
                     {step.label}
                   </span>

                   {/* Error Dot at the end */}
                   {hasError && (
                     <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-sm" />
                   )}
                 </div>
               </div>
             );
           })}
        </div>
      </aside>

      {/* Main Content - Right Panel */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50/50">
        {/* Mobile Step Indicator */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900 text-sm">Step {currentStep}</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">{currentStepInfo.label}</span>
             </div>
             <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-600">
               {Math.round((currentStep / STEPS.length) * 100)}%
             </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth">
          <div className="max-w-3xl mx-auto w-full p-6 md:p-10 pb-24">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{currentStepInfo.label}</h2>
              <p className="text-slate-500 text-sm">Please fill in the details below.</p>
            </header>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {currentStep === 1 && resumeData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={resumeData.personal.name}
                      onChange={(e) => updatePersonal("name", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${!resumeData.personal.name ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={resumeData.personal.designation}
                      onChange={(e) => updatePersonal("designation", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      value={resumeData.personal.email}
                      onChange={(e) => updatePersonal("email", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${!resumeData.personal.email ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      value={resumeData.personal.mobile}
                      onChange={(e) => updatePersonal("mobile", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${!resumeData.personal.mobile ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g. +1 234 567 890"
                    />
                  </div>
                   <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={resumeData.personal.location}
                      onChange={(e) => updatePersonal("location", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                   <div className="space-y-1.5 md:col-span-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marital Status</label>
                     <select
                        value={resumeData.personal.marital_status}
                        onChange={(e) => updatePersonal("marital_status", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                     >
                       <option value="">Select Status</option>
                       <option value="Single">Single</option>
                       <option value="Married">Married</option>
                       <option value="Divorced">Divorced</option>
                       <option value="Widowed">Widowed</option>
                     </select>
                   </div>
                </div>
              )}

              {currentStep === 2 && resumeData && (
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700">Professional Summary</label>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    className="w-full h-80 p-5 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all leading-relaxed text-base"
                    placeholder="Write a compelling summary..."
                  />
                  <div className="flex justify-end">
                     <span className="text-xs text-slate-400">{resumeData.summary.length} characters</span>
                  </div>
                </div>
              )}

              {currentStep === 3 && resumeData && (
                 <div className="space-y-4">
                   <label className="text-sm font-semibold text-slate-700">Key Skills</label>
                   <div className="p-3 border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all min-h-[120px]">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resumeData.skills.map((skill, idx) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 border border-indigo-100">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-indigo-100">
                               <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                         value={skillInput}
                         onChange={(e) => setSkillInput(e.target.value)}
                         onKeyDown={addSkill}
                        className="w-full p-2 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
                        placeholder="Type a skill and press Enter..."
                      />
                   </div>
                   <p className="text-xs text-slate-500">Press Enter to add a skill.</p>
                 </div>
              )}

              {currentStep === 4 && resumeData && (
                <div className="space-y-6">
                   {resumeData.work_experience.map((exp, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
                        <button onClick={() => deleteWorkExperience(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Company</label><input value={exp.company} onChange={(e) => updateWorkExperience(index, 'company', e.target.value)} className="w-full font-bold text-lg border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:text-slate-300 transition-colors" placeholder="Company Name" /></div>
                          <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Position</label><input value={exp.position} onChange={(e) => updateWorkExperience(index, 'position', e.target.value)} className="w-full font-semibold text-lg border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:text-slate-300 transition-colors" placeholder="Job Title" /></div>
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label><input type="date" value={exp.period_from} onChange={(e) => updateWorkExperience(index, 'period_from', e.target.value)} className="w-full text-sm border-b border-transparent focus:border-indigo-500 outline-none pb-1 text-slate-600 transition-colors" /></div>
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">End Date</label><input type="date" value={exp.period_to} onChange={(e) => updateWorkExperience(index, 'period_to', e.target.value)} className="w-full text-sm border-b border-transparent focus:border-indigo-500 outline-none pb-1 text-slate-600 transition-colors" /></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Key Highlights / Projects</h4>
                           
                           <div className="space-y-3">
                              {exp.projects.map((proj, pIdx) => (
                                <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group/proj">
                                   <input value={proj.name} onChange={(e) => updateProjectField(index, pIdx, 'name', e.target.value)} placeholder="Project Highlight Name" className="bg-transparent font-bold w-full outline-none mb-2 text-sm text-slate-800" />
                                   
                                   {/* Technologies Tag Input */}
                                   <div className="mb-2">
                                     <div className="flex flex-wrap gap-1 mb-2">
                                       {proj.technologies.map((tech, tIdx) => (
                                         <span key={tIdx} className="bg-white text-indigo-600 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-indigo-100 shadow-sm">
                                           {tech}
                                           <button onClick={() => removeWorkExpTech(index, pIdx, tech)} className="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-slate-50">
                                              <X className="w-2.5 h-2.5" />
                                           </button>
                                         </span>
                                       ))}
                                     </div>
                                     <input 
                                       value={workExpTechInputs[`${index}-${pIdx}`] || ""}
                                       onChange={(e) => setWorkExpTechInputs({ ...workExpTechInputs, [`${index}-${pIdx}`]: e.target.value })}
                                       onKeyDown={(e) => addWorkExpTech(e, index, pIdx)}
                                       placeholder="Add technology (Press Enter)" 
                                       className="bg-transparent w-full text-xs text-slate-500 outline-none border-b border-transparent focus:border-indigo-300 pb-0.5 transition-all" 
                                     />
                                   </div>

                                   <textarea value={proj.description} onChange={(e) => updateProjectField(index, pIdx, 'description', e.target.value)} placeholder="Brief description..." className="bg-transparent w-full text-sm text-slate-600 resize-none outline-none min-h-[40px]" />
                                   <button onClick={() => deleteProject(index, pIdx)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 "><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              ))}
                           </div>
                           <button onClick={() => addProject(index)} className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> Add Highlight</button>
                        </div>
                      </div>
                   ))}
                   <button onClick={addWorkExperience} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add New Experience</button>
                </div>
              )}

              {currentStep === 5 && resumeData && (
                <div className="space-y-6">
                   {resumeData.education.map((edu, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
                        <button onClick={() => deleteEducation(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Institution</label><input value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="w-full font-bold text-lg border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:text-slate-300" placeholder="University" /></div>
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Degree</label><input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="w-full font-semibold text-lg border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:text-slate-300" placeholder="Degree" /></div>
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Field of Study</label><input value={edu.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} className="w-full text-sm border-b border-transparent focus:border-indigo-500 outline-none pb-1 text-slate-600" placeholder="Major" /></div>
                            <div className="space-y-1"><label className="text-xs font-semibold text-slate-500 uppercase">Graduation Year</label><input type="text" value={edu.graduation_year} onChange={(e) => updateEducation(index, 'graduation_year', e.target.value)} className="w-full text-sm border-b border-transparent focus:border-indigo-500 outline-none pb-1 text-slate-600" placeholder="YYYY" /></div>
                        </div>
                      </div>
                   ))}
                   <button onClick={addEducation} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Education</button>
                </div>
              )}

              {currentStep === 6 && resumeData && (
                 <div className="space-y-6">
                   {resumeData.projects.map((proj, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
                        <button onClick={() => deleteStandaloneProject(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        <div className="space-y-4">
                           <div><label className="text-xs font-semibold text-slate-500 uppercase">Project Name</label><input value={proj.name} onChange={(e) => updateStandaloneProject(index, 'name', e.target.value)} className="w-full font-bold text-lg border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:text-slate-300" placeholder="Name" /></div>
                           
                           <div>
                             <label className="text-xs font-semibold text-slate-500 uppercase">Technologies</label>
                             <div className="flex flex-wrap gap-2 my-2">
                               {proj.technologies.map((tech, tIdx) => (
                                 <span key={tIdx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-indigo-100">
                                   {tech}
                                   <button onClick={() => removeProjectTech(index, tech)} className="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-indigo-100">
                                      <X className="w-3 h-3" />
                                   </button>
                                 </span>
                               ))}
                             </div>
                             <input 
                               value={projectTechInputs[index] || ""} 
                               onChange={(e) => setProjectTechInputs({ ...projectTechInputs, [index]: e.target.value })}
                               onKeyDown={(e) => addProjectTech(e, index)}
                               className="w-full text-sm border-b border-transparent focus:border-indigo-500 outline-none pb-1 text-slate-600 placeholder:text-slate-300" 
                               placeholder="Add technology (Press Enter)" 
                             />
                           </div>

                           <div><textarea value={proj.description} onChange={(e) => updateStandaloneProject(index, 'description', e.target.value)} className="w-full h-24 p-2 bg-slate-50 rounded-lg text-sm text-slate-700 border-none resize-none focus:ring-1 focus:ring-indigo-300 outline-none" placeholder="Description..." /></div>
                        </div>
                      </div>
                   ))}
                   <button onClick={addStandaloneProject} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add Project</button>
                 </div>
              )}

              {currentStep === 7 && (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-emerald-200 shadow-lg"><CheckCircle2 className="w-8 h-8" /></div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Generate!</h2>
                   <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">Review the preview below, then click Generate to finish.</p>
                   
                   {!isFormComplete && (
                     <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100 text-sm font-medium flex items-center gap-2 mb-4">
                       <AlertCircle className="w-4 h-4" /> Some required fields are missing. Please check the sidebar.
                     </div>
                   )}

                   {/* PDF Preview Area */}
                   <div className="w-full max-w-4xl mx-auto bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner h-[500px] flex items-center justify-center relative">
                      {previewLoading ? (
                        <div className="flex flex-col items-center gap-3">
                           <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                           <p className="text-slate-500 font-medium">Generating Preview...</p>
                        </div>
                      ) : previewError ? (
                         <div className="flex flex-col items-center gap-3 p-6 max-w-sm">
                           <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
                             <AlertCircle className="w-6 h-6" />
                           </div>
                           <p className="text-slate-800 font-semibold">Preview Failed</p>
                           <p className="text-slate-500 text-sm mb-2">{previewError}</p>
                           <button 
                             onClick={generatePreview}
                             className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                           >
                              <RefreshCw className="w-4 h-4" /> Retry Preview
                           </button>
                        </div>
                      ) : previewUrl ? (
                        <iframe 
                          src={previewUrl} 
                          className="w-full h-full"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                           <FileText className="w-12 h-12 opacity-50" />
                           <p>Preview will appear here</p>
                           <p className="text-xs text-slate-300">v1.1 - {resumeData ? "Data Ready" : "No Data"}</p>
                           <button 
                             onClick={generatePreview}
                             className="mt-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-2"
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

        {/* Improved Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-50">
           <div className="flex items-center gap-3">
             <button 
               onClick={handleBack} 
               disabled={currentStep === 1} 
               className={`px-6 py-2.5 rounded-xl font-semibold border transition-all flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
             >
               Back
             </button>
             {currentStep < 7 && (
               <button 
                 onClick={handleNext} 
                 className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
               >
                 Next
               </button>
             )}
           </div>

           <button 
             onClick={handleGenerate} 
             disabled={generating || !isFormComplete} 
             className="px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500"
           >
             {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> </ > : <>Generate PDF <ArrowRight className="w-5 h-5" /></>}
           </button>
        </div>
      </main>
    </div>
  );
}
