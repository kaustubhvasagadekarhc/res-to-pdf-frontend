"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAuthToken } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Code,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";

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

export default function EditPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Load data from sessionStorage
    const storedData = sessionStorage.getItem("resumeData");
    if (storedData) {
      setResumeData(JSON.parse(storedData));
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Saving data to sessionStorage whenever it changes
    if (resumeData) {
      const dataToSave = { ...resumeData }; // Create a copy to avoid mutation if needed
      if (typeof window !== "undefined") {
        sessionStorage.setItem("resumeData", JSON.stringify(dataToSave));
      }
    }
  }, [resumeData]);

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

  const updateSkills = (value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      skills: value.split(",").map((s) => s.trim()),
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

    // Auto-calculate duration when period_from or period_to changes
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

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      setError("Authentication required. Please refresh the page.");
      setGenerating(false);
      return;
    }

    try {
      const response = await fetch(
        "https://res-to-pdf-api.vercel.app/generate/pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resumeData),
        }
      );

      if (response.ok) {
        // Store generated PDF response and navigate to result page
        sessionStorage.setItem(
          "pdfResponse",
          JSON.stringify({ success: true })
        );
        router.push("/result");
      } else {
        setError("Failed to generate PDF");
      }
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-action" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl text-slate-500 font-medium">
          No resume data found
        </p>
      </div>
    );
  }

  const isEmpty = (val?: string | null) =>
    !val || !val.toString().trim().length;
  const isValidMonth = (val?: string | null) =>
    !isEmpty(val) && /^\d{4}-\d{2}$/.test(val || "");

  const getMissingFields = () => {
    const groups: { section: string; fields: string[] }[] = [];

    // Personal
    const personalMissing: string[] = [];
    if (isEmpty(resumeData.personal.name)) personalMissing.push("Full Name");
    if (isEmpty(resumeData.personal.designation))
      personalMissing.push("Designation");
    if (isEmpty(resumeData.personal.email)) personalMissing.push("Email");
    if (isEmpty(resumeData.personal.mobile)) personalMissing.push("Mobile");
    if (isEmpty(resumeData.personal.location)) personalMissing.push("Location");
    if (isEmpty(resumeData.personal.gender)) personalMissing.push("Gender");
    if (isEmpty(resumeData.personal.marital_status))
      personalMissing.push("Marital Status");

    if (personalMissing.length) {
      groups.push({ section: "Personal Details", fields: personalMissing });
    }

    // Summary
    if (isEmpty(resumeData.summary)) {
      groups.push({ section: "Summary", fields: ["Professional Summary"] });
    }

    // Skills
    if (
      !resumeData.skills.length ||
      !resumeData.skills.filter(Boolean).length
    ) {
      groups.push({ section: "Skills", fields: ["Technical Skills"] });
    }

    // Work Experience
    const expMissing: string[] = [];
    if (!resumeData.work_experience.length) {
      expMissing.push("Add at least one experience");
    } else {
      resumeData.work_experience.forEach((exp, idx) => {
        if (isEmpty(exp.company)) expMissing.push(`Role ${idx + 1}: Company`);
        if (isEmpty(exp.position)) expMissing.push(`Role ${idx + 1}: Position`);
        if (!isValidMonth(exp.period_from))
          expMissing.push(`Role ${idx + 1}: Start Date`);
        // Check end date unless it's strictly "Present"
        if (exp.period_to !== "Present" && !isValidMonth(exp.period_to))
          expMissing.push(`Role ${idx + 1}: End Date`);
      });
    }
    if (expMissing.length)
      groups.push({ section: "Work Experience", fields: expMissing });

    // Education
    const eduMissing: string[] = [];
    if (!resumeData.education.length) {
      eduMissing.push("Add at least one education");
    } else {
      resumeData.education.forEach((edu, idx) => {
        if (isEmpty(edu.institution))
          eduMissing.push(`Education ${idx + 1}: Institution`);
        if (isEmpty(edu.degree))
          eduMissing.push(`Education ${idx + 1}: Degree`);
        if (!isValidMonth(edu.graduation_year))
          eduMissing.push(`Education ${idx + 1}: Year`);
      });
    }
    if (eduMissing.length)
      groups.push({ section: "Education", fields: eduMissing });

    return groups;
  };

  const missingFields = getMissingFields();

  const getInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full px-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
      isValid
        ? "border-slate-200 focus:ring-blue-500/50 focus:border-blue-500"
        : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
    }`;
  };

  const getSelectClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full appearance-none px-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
      isValid
        ? "border-slate-200 focus:ring-blue-500/50 focus:border-blue-500"
        : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
    }`;
  };

  const getExpInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-all ${
      isValid
        ? "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
        : "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
    }`;
  };

  const getExpDateClassName = (value: string | null | undefined) => {
    const isValid = isValidMonth(value) || value === "Present";
    return `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-all text-sm ${
      isValid
        ? "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
        : "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
    }`;
  };

  const getEduInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full font-semibold text-slate-800 bg-transparent border-b transition-all ${
      isValid
        ? "border-transparent focus:border-pink-500 focus:outline-none"
        : "border-red-300 focus:border-red-500 bg-red-50/50 px-2 rounded"
    }`;
  };

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-slate-800">
          <FileText className="w-8 h-8 text-primary" />
          Edit Resume Profile
        </h1>
        <p className="text-slate-500">
          Review and refine your parsed data before generating the PDF.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 p-5 flex items-center gap-3 bg-slate-50/70">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">
                      Missing Fields
                    </p>
                    <p className="text-xs text-slate-400">
                      Fill these to complete your profile
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {missingFields.length ? (
                    missingFields.map((group, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                          {group.section}
                        </h4>
                        <div className="space-y-1">
                          {group.fields.map((field, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 px-2 py-1.5 rounded-lg border border-red-100"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span>{field}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-700 flex items-center gap-3">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold">All set!</p>
                        <p className="text-xs opacity-80">
                          Ready to generate PDF.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Personal Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Personal Information
                </h2>
              </div>
              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    label: "Full Name",
                    field: "name",
                    placeholder: "e.g. John Doe",
                  },
                  {
                    label: "Designation",
                    field: "designation",
                    placeholder: "e.g. Software Engineer",
                  },
                  {
                    label: "Email",
                    field: "email",
                    placeholder: "e.g. john@example.com",
                    type: "email",
                  },
                  {
                    label: "Mobile",
                    field: "mobile",
                    placeholder: "e.g. +1 234 567 890",
                  },
                  {
                    label: "Location",
                    field: "location",
                    placeholder: "e.g. New York, USA",
                  },
                ].map(({ label, field, placeholder, type }) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {label}
                    </label>
                    <input
                      type={type || "text"}
                      placeholder={placeholder}
                      value={
                        (resumeData.personal as Record<string, string>)[field]
                      }
                      onChange={(e) => updatePersonal(field, e.target.value)}
                      className={getInputClassName(
                        (resumeData.personal as Record<string, string>)[field]
                      )}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      value={resumeData.personal.gender}
                      onChange={(e) => updatePersonal("gender", e.target.value)}
                      className={getSelectClassName(resumeData.personal.gender)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Marital Status
                  </label>
                  <div className="relative">
                    <select
                      value={resumeData.personal.marital_status}
                      onChange={(e) =>
                        updatePersonal("marital_status", e.target.value)
                      }
                      className={getSelectClassName(
                        resumeData.personal.marital_status
                      )}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Summary & Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full"
              >
                <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Professional Summary
                  </h2>
                </div>
                <div className="p-6 flex-grow">
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    className={`w-full h-full min-h-[150px] px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none leading-relaxed text-slate-700 ${
                      !isEmpty(resumeData.summary)
                        ? "border-slate-200 focus:ring-primary/50 focus:border-primary"
                        : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
                    }`}
                    placeholder="Write a compelling summary about your professional background..."
                  />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full"
              >
                <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Code className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Skills</h2>
                </div>
                <div className="p-6 flex-grow">
                  <textarea
                    value={resumeData.skills.join(", ")}
                    onChange={(e) => updateSkills(e.target.value)}
                    className={`w-full h-full min-h-[150px] px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none leading-relaxed text-slate-700 ${
                      !isEmpty(resumeData.skills.join(", "))
                        ? "border-slate-200 focus:ring-purple-500/50 focus:border-purple-500"
                        : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
                    }`}
                    placeholder="e.g. JavaScript, React, Node.js, Python (comma separated)"
                  />
                  <p className="text-xs text-slate-400 mt-2 text-right">
                    Separate skills with commas
                  </p>
                </div>
              </motion.section>
            </div>

            {/* Work Experience */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Work Experience
                  </h2>
                </div>
                <button
                  onClick={addWorkExperience}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                <AnimatePresence>
                  {resumeData.work_experience.map((exp, expIdx) => (
                    <motion.div
                      key={expIdx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative pl-6 border-l-2 border-slate-200 pb-2"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500"></div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 group">
                        <div className="flex justify-end mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteWorkExperience(expIdx)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Company
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) =>
                                updateWorkExperience(
                                  expIdx,
                                  "company",
                                  e.target.value
                                )
                              }
                              className={getExpInputClassName(exp.company)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Position
                            </label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) =>
                                updateWorkExperience(
                                  expIdx,
                                  "position",
                                  e.target.value
                                )
                              }
                              className={getExpInputClassName(exp.position)}
                              placeholder="Job Title"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500 uppercase">
                                From
                              </label>
                              <input
                                type="month"
                                value={exp.period_from}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    expIdx,
                                    "period_from",
                                    e.target.value
                                  )
                                }
                                className={getExpDateClassName(exp.period_from)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500 uppercase">
                                To
                              </label>
                              <input
                                type="month"
                                value={
                                  exp.period_to === "Present"
                                    ? ""
                                    : exp.period_to
                                }
                                onChange={(e) =>
                                  updateWorkExperience(
                                    expIdx,
                                    "period_to",
                                    e.target.value
                                  )
                                }
                                className={getExpDateClassName(exp.period_to)}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Duration (Auto)
                            </label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) =>
                                updateWorkExperience(
                                  expIdx,
                                  "duration",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Nested Projects */}
                        <div className="mt-6 border-t border-slate-200 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Briefcase className="w-3 h-3" /> Key Projects
                            </h4>
                            <button
                              onClick={() => addProject(expIdx)}
                              className="text-xs font-medium text-action hover:text-action/90"
                            >
                              Add Project
                            </button>
                          </div>

                          <div className="space-y-4">
                            {exp.projects.map((proj, projIdx) => (
                              <div
                                key={projIdx}
                                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative"
                              >
                                <button
                                  onClick={() => deleteProject(expIdx, projIdx)}
                                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <input
                                  type="text"
                                  value={proj.name}
                                  onChange={(e) =>
                                    updateProjectField(
                                      expIdx,
                                      projIdx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Project Name"
                                  className="font-semibold text-slate-800 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none mb-2 bg-transparent transition"
                                />
                                <textarea
                                  value={proj.description}
                                  onChange={(e) =>
                                    updateProjectField(
                                      expIdx,
                                      projIdx,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Brief description..."
                                  className="w-full text-sm text-slate-600 bg-transparent resize-none focus:outline-none mb-2 min-h-[40px]"
                                />
                                <textarea
                                  value={proj.responsibilities.join("\n")}
                                  onChange={(e) =>
                                    updateProjectField(
                                      expIdx,
                                      projIdx,
                                      "responsibilities",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Responsibilities (one per line)"
                                  className="w-full text-sm text-slate-600 bg-slate-50 p-2 rounded border border-transparent focus:border-blue-300 focus:outline-none resize-none min-h-[60px]"
                                />
                                <input
                                  type="text"
                                  value={proj.technologies.join(", ")}
                                  onChange={(e) =>
                                    updateProjectField(
                                      expIdx,
                                      projIdx,
                                      "technologies",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tech Stack (comma separated)"
                                  className="mt-2 w-full text-xs text-action bg-action/10 rounded px-2 py-1 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Education */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Education
                  </h2>
                </div>
                <button
                  onClick={addEducation}
                  className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>

              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeData.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="relative bg-slate-50 p-5 rounded-xl border border-slate-200 group"
                  >
                    <button
                      onClick={() => deleteEducation(idx)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(idx, "institution", e.target.value)
                        }
                        placeholder="University / School"
                        className={getEduInputClassName(edu.institution)}
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(idx, "degree", e.target.value)
                        }
                        placeholder="Degree (e.g. B.Sc)"
                        className={`w-full text-sm text-slate-600 bg-transparent border-b transition-all pb-1 ${
                          !isEmpty(edu.degree)
                            ? "border-transparent focus:border-pink-500 focus:outline-none"
                            : "border-red-300 focus:border-red-500 bg-red-50/50 px-2 rounded"
                        }`}
                      />
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <input
                          type="month"
                          value={edu.graduation_year}
                          onChange={(e) =>
                            updateEducation(
                              idx,
                              "graduation_year",
                              e.target.value
                            )
                          }
                          className={`bg-transparent text-xs focus:outline-none transition-all ${
                            isValidMonth(edu.graduation_year)
                              ? "text-slate-500"
                              : "text-red-500 font-medium placeholder:text-red-400"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Standalone Projects */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Code className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Additional Projects
                  </h2>
                </div>
                <button
                  onClick={addStandaloneProject}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeData.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="relative bg-slate-50 p-5 rounded-xl border border-slate-200 group"
                  >
                    <button
                      onClick={() => deleteStandaloneProject(idx)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) =>
                          updateStandaloneProject(idx, "name", e.target.value)
                        }
                        placeholder="Project Name"
                        className="w-full font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-orange-500 focus:outline-none pb-1"
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) =>
                          updateStandaloneProject(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Project description..."
                        className="w-full text-sm text-slate-600 bg-transparent resize-none focus:outline-none min-h-[60px]"
                      />
                      <div className="pt-2">
                        <input
                          type="text"
                          value={proj.technologies.join(", ")}
                          onChange={(e) =>
                            updateStandaloneProject(
                              idx,
                              "technologies",
                              e.target.value
                            )
                          }
                          placeholder="Technologies used..."
                          className="w-full text-xs text-orange-600 bg-orange-50/50 rounded px-2 py-1 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 p-4 z-50 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-slate-500 hidden md:block">
            Changes are saved automatically to your session.
          </p>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push("/user")}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition border border-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <span>Generate PDF</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
