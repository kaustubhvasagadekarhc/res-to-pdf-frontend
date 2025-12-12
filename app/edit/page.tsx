"use client";

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
      sessionStorage.setItem("resumeData", JSON.stringify(resumeData));
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
    const fromDate = new Date(from + "-01");
    const toDate = to ? new Date(to + "-01") : new Date();

    const months =
      (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0)
      return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`;
    return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${
      remainingMonths !== 1 ? "s" : ""
    }`;
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

    try {
      const response = await fetch(
        "https://res-to-pdf-api.vercel.app/generate/pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl text-slate-500 font-medium">No resume data found</p>
      </div>
    );
  }

  const isEmpty = (val?: string | null) => !val || !val.toString().trim().length;
  const isValidMonth = (val?: string | null) => !isEmpty(val) && /^\d{4}-\d{2}$/.test(val || "");

  const getMissingFields = () => {
    const groups: { section: string; fields: string[] }[] = [];

    // Personal
    const personalMissing: string[] = [];
    if (isEmpty(resumeData.personal.name)) personalMissing.push("Full Name");
    if (isEmpty(resumeData.personal.designation)) personalMissing.push("Designation");
    if (isEmpty(resumeData.personal.email)) personalMissing.push("Email");
    if (isEmpty(resumeData.personal.mobile)) personalMissing.push("Mobile");
    if (isEmpty(resumeData.personal.location)) personalMissing.push("Location");
    if (isEmpty(resumeData.personal.gender)) personalMissing.push("Gender");
    if (isEmpty(resumeData.personal.marital_status)) personalMissing.push("Marital Status");

    if (personalMissing.length) {
      groups.push({ section: "Personal Details", fields: personalMissing });
    }

    // Summary
    if (isEmpty(resumeData.summary)) {
      groups.push({ section: "Summary", fields: ["Professional Summary"] });
    }

    // Skills
    if (!resumeData.skills.length || !resumeData.skills.filter(Boolean).length) {
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
        if (!isValidMonth(exp.period_from)) expMissing.push(`Role ${idx + 1}: Start Date`);
        // Check end date unless it's strictly "Present"
        if (exp.period_to !== "Present" && !isValidMonth(exp.period_to)) expMissing.push(`Role ${idx + 1}: End Date`);
      });
    }
    if (expMissing.length) groups.push({ section: "Work Experience", fields: expMissing });

    // Education
    const eduMissing: string[] = [];
    if (!resumeData.education.length) {
      eduMissing.push("Add at least one education");
    } else {
      resumeData.education.forEach((edu, idx) => {
        if (isEmpty(edu.institution)) eduMissing.push(`Education ${idx + 1}: Institution`);
        if (isEmpty(edu.degree)) eduMissing.push(`Education ${idx + 1}: Degree`);
        if (!isValidMonth(edu.graduation_year)) eduMissing.push(`Education ${idx + 1}: Year`);
      });
    }
    if (eduMissing.length) groups.push({ section: "Education", fields: eduMissing });

    return groups;
  };

  const missingFields = getMissingFields();

  const getInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full px-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isValid
      ? "border-slate-200 focus:ring-blue-500/50 focus:border-blue-500"
      : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
      }`;
  };

  const getSelectClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full appearance-none px-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isValid
      ? "border-slate-200 focus:ring-blue-500/50 focus:border-blue-500"
      : "border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50"
      }`;
  };

  const getExpInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-all ${isValid
      ? "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
      : "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
      }`;
  };

  const getExpDateClassName = (value: string | null | undefined) => {
    const isValid = isValidMonth(value) || (value === "Present");
    return `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-all text-sm ${isValid
      ? "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
      : "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
      }`;
  };

  const getEduInputClassName = (value: string | null | undefined) => {
    const isValid = !isEmpty(value);
    return `w-full font-semibold text-slate-800 bg-transparent border-b transition-all ${isValid
      ? "border-transparent focus:border-pink-500 focus:outline-none"
      : "border-red-300 focus:border-red-500 bg-red-50/50 px-2 rounded"
      }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Edit Resume</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Personal Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b-2 border-indigo-300">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={resumeData.personal.name}
              onChange={(e) => updatePersonal("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Designation"
              value={resumeData.personal.designation}
              onChange={(e) => updatePersonal("designation", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={resumeData.personal.email}
              onChange={(e) => updatePersonal("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={resumeData.personal.mobile}
              onChange={(e) => updatePersonal("mobile", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={resumeData.personal.location}
              onChange={(e) => updatePersonal("location", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={resumeData.personal.gender}
              onChange={(e) => updatePersonal("gender", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={resumeData.personal.marital_status}
              onChange={(e) => updatePersonal("marital_status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b-2 border-indigo-300">
            Professional Summary
          </h2>
          <textarea
            value={resumeData.summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
            placeholder="Enter your professional summary..."
          />
        </section>

        {/* Skills */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b-2 border-indigo-300">
            Skills
          </h2>
          <textarea
            value={resumeData.skills.join(", ")}
            onChange={(e) => updateSkills(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
            placeholder="Enter skills separated by commas..."
          />
        </section>

        {/* Education */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-700 pb-2 border-b-2 border-indigo-300 flex-1">
              Education
            </h2>
            <button
              onClick={addEducation}
              className="ml-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              + Add Education
            </button>
          </div>
          {resumeData.education.map((edu, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 relative shadow-sm"
            >
              <button
                onClick={() => deleteEducation(idx)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Delete
              </button>
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) =>
                  updateEducation(idx, "institution", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="month"
                placeholder="Graduation Year"
                value={edu.graduation_year}
                onChange={(e) =>
                  updateEducation(idx, "graduation_year", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Work Experience */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              + Add Experience
            </button>
          </div>
          {resumeData.work_experience.map((exp, expIdx) => (
            <div
              key={expIdx}
              className="bg-slate-50 p-4 rounded-lg mb-6 border-l-4 border-emerald-400 relative shadow-sm"
            >
              <button
                onClick={() => deleteWorkExperience(expIdx)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Delete
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateWorkExperience(expIdx, "company", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) =>
                    updateWorkExperience(expIdx, "position", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={exp.duration}
                  onChange={(e) =>
                    updateWorkExperience(expIdx, "duration", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="month"
                  placeholder="Period From"
                  value={exp.period_from}
                  onChange={(e) =>
                    updateWorkExperience(expIdx, "period_from", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="month"
                  placeholder="Period To"
                  value={exp.period_to === "Present" ? "" : exp.period_to}
                  onChange={(e) =>
                    updateWorkExperience(expIdx, "period_to", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Projects within Work Experience */}
              <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-violet-300 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-700">
                    Projects in this Role
                  </h4>
                  <button
                    onClick={() => addProject(expIdx)}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded text-sm font-medium transition shadow-sm"
                  >
                    + Add Project
                  </button>
                </div>
                <button onClick={addEducation} className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>

                {exp.projects.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">
                    No projects added yet
                  </p>
                ) : (
                  exp.projects.map((proj, projIdx) => (
                    <div
                      key={projIdx}
                      className="bg-slate-50 p-3 rounded-lg mb-3 border border-slate-200 text-slate-800 relative shadow-sm"
                    >
                      <button
                        onClick={() => deleteProject(expIdx, projIdx)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition"
                      >
                        Delete
                      </button>

                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) =>
                          updateProjectField(
                            expIdx,
                            projIdx,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />

                      <textarea
                        placeholder="Project Description"
                        value={proj.description}
                        onChange={(e) =>
                          updateProjectField(
                            expIdx,
                            projIdx,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                      />

                      <textarea
                        placeholder="Responsibilities (one per line)"
                        value={proj.responsibilities.join("\n")}
                        onChange={(e) =>
                          updateProjectField(
                            expIdx,
                            projIdx,
                            "responsibilities",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                      />

                      <input
                        type="text"
                        placeholder="Technologies (comma-separated)"
                        value={proj.technologies.join(", ")}
                        onChange={(e) =>
                          updateProjectField(
                            expIdx,
                            projIdx,
                            "technologies",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateStandaloneProject(idx, 'description', e.target.value)}
                        placeholder="Project description..."
                        className="w-full text-sm text-slate-600 bg-transparent resize-none focus:outline-none min-h-[60px]"
                      />
                      <div className="pt-2">
                        <input
                          type="text"
                          value={proj.technologies.join(', ')}
                          onChange={(e) => updateStandaloneProject(idx, 'technologies', e.target.value)}
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
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-slate-500 hidden md:block">
            Changes are saved automatically to your session.
          </p>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push("/")}
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
          {resumeData.projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-lg mb-4 border-l-4 border-violet-400 relative shadow-sm"
            >
              <button
                onClick={() => deleteStandaloneProject(idx)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Delete
              </button>

              <input
                type="text"
                placeholder="Project Name"
                value={proj.name}
                onChange={(e) =>
                  updateStandaloneProject(idx, "name", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                placeholder="Project Description"
                value={proj.description}
                onChange={(e) =>
                  updateStandaloneProject(idx, "description", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-24"
              />

              <input
                type="text"
                placeholder="Technologies (comma-separated)"
                value={proj.technologies.join(", ")}
                onChange={(e) =>
                  updateStandaloneProject(idx, "technologies", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-lg transition shadow-sm"
          >
            ← Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-medium rounded-lg transition shadow-sm"
          >
            {generating ? "Generating PDF..." : "Generate PDF →"}
          </button>
        </div>
      </div>
    </div>
  );
}
