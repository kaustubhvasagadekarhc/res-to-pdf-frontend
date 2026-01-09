"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, User, FileText, Code, Briefcase, GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";
import { useEditResume } from "@/hooks/user/useEditResume";
import { PersonalInfo } from "./form/sections/PersonalInfo";
import { Summary } from "./form/sections/Summary";
import { Skills } from "./form/sections/Skills";
import { Experience } from "./form/sections/Experience";
import { Education } from "./form/sections/Education";
import { Projects } from "./form/sections/Projects";
import { Review } from "./form/sections/Review";
import { RenameModal } from "./dialogs/RenameModal";
import { StepInfo } from "@/lib/resume/resume.types";

const STEPS: StepInfo[] = [
  { id: 1, key: "personal", label: "Personal Details", icon: User },
  { id: 2, key: "summary", label: "Professional Summary", icon: FileText },
  { id: 3, key: "skills", label: "Skills", icon: Code },
  { id: 4, key: "experience", label: "Work Experience", icon: Briefcase },
  { id: 5, key: "education", label: "Education", icon: GraduationCap },
  { id: 6, key: "projects", label: "Projects", icon: Code },
  { id: 7, key: "review", label: "Review & Generate", icon: CheckCircle2 },
];

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

export const EditResumeContainer = () => {
  const router = useRouter();
  const {
    resumeData,
    loading,
    generating,
    currentStep,
    setCurrentStep,
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
    formatToMonthInput,
    formatFromMonthInput,
    formatNameInput,
    formatLocationInput,
    formatMobileInput,
    getMissingFieldsForStep,
  } = useEditResume();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!resumeData) {
    return null;
  }

  const currentStepInfo = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const stepContent =
    STEP_DESCRIPTIONS[currentStepInfo.key] || STEP_DESCRIPTIONS.personal;
  const progress = (currentStep / STEPS.length) * 100;

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
              <div className="px-4 md:px-4 pb-4 shrink-0"></div>

              <div className="pt-4 overflow-y-auto flex-1 pr-2">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {currentStep === 1 && (
                    <PersonalInfo
                      resumeData={resumeData}
                      validationErrors={validationErrors}
                      updatePersonal={updatePersonal}
                      formatNameInput={formatNameInput}
                      formatLocationInput={formatLocationInput}
                      formatMobileInput={formatMobileInput}
                    />
                  )}

                  {currentStep === 2 && (
                    <Summary
                      resumeData={resumeData}
                      updateSummary={updateSummary}
                    />
                  )}

                  {currentStep === 3 && (
                    <Skills
                      resumeData={resumeData}
                      skillInput={skillInput}
                      setSkillInput={setSkillInput}
                      addSkill={addSkill}
                      removeSkill={removeSkill}
                    />
                  )}

                  {currentStep === 4 && (
                    <Experience
                      resumeData={resumeData}
                      workExpDateErrors={workExpDateErrors}
                      workExpTechInputs={workExpTechInputs}
                      setWorkExpTechInputs={setWorkExpTechInputs}
                      updateWorkExperience={updateWorkExperience}
                      addWorkExperience={addWorkExperience}
                      deleteWorkExperience={deleteWorkExperience}
                      addProject={addProject}
                      deleteProject={deleteProject}
                      updateProjectField={updateProjectField}
                      addWorkExpTech={addWorkExpTech}
                      removeWorkExpTech={removeWorkExpTech}
                      formatToMonthInput={formatToMonthInput}
                      formatFromMonthInput={formatFromMonthInput}
                    />
                  )}

                  {currentStep === 5 && (
                    <Education
                      resumeData={resumeData}
                      updateEducation={updateEducation}
                      addEducation={addEducation}
                      deleteEducation={deleteEducation}
                      formatToMonthInput={formatToMonthInput}
                      formatFromMonthInput={formatFromMonthInput}
                    />
                  )}

                  {currentStep === 6 && (
                    <Projects
                      resumeData={resumeData}
                      projectTechInputs={projectTechInputs}
                      setProjectTechInputs={setProjectTechInputs}
                      updateStandaloneProject={updateStandaloneProject}
                      addStandaloneProject={addStandaloneProject}
                      deleteStandaloneProject={deleteStandaloneProject}
                      addProjectTech={addProjectTech}
                      removeProjectTech={removeProjectTech}
                    />
                  )}

                  {currentStep === 7 && (
                    <Review
                      isFormComplete={isFormComplete}
                      analyzing={analyzing}
                      analysisResult={analysisResult}
                      generating={generating}
                      handleAnalyze={handleAnalyze}
                      handleGenerate={handleGenerate}
                      setCurrentStep={setCurrentStep}
                    />
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
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-8 py-2.5 rounded-sm font-bold border transition-all flex items-center gap-2 ${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
              }`}
            >
              Back
            </button>
          </div>

          <div className="flex-1 flex justify-end">
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
      <RenameModal
        isOpen={isRenameModalOpen}
        onOpenChange={setIsRenameModalOpen}
        tempPdfName={tempPdfName}
        setTempPdfName={setTempPdfName}
        isRenameClicked={isRenameClicked}
        handleSavePdfName={handleSavePdfName}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

