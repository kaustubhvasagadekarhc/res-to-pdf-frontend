"use client";

import { AnalysisResult } from "@/lib/resume/resume.types";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Code,
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";

interface ReviewProps {
  isFormComplete: boolean;
  analyzing: boolean;
  analysisResult: AnalysisResult | null;
  generating: boolean;
  handleAnalyze: () => void;
  handleGenerate: () => void;
  setCurrentStep: (step: number) => void;
}

export const Review = ({
  isFormComplete,
  analyzing,
  analysisResult,
  generating,
  handleAnalyze,
  handleGenerate,
  setCurrentStep,
}: ReviewProps) => {
  return (
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
                      strokeDasharray={`${analysisResult.atsScore || 0}, 100`}
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
                  Based on industry standards and ATS compatibility
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
                  <div
                    className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      setCurrentStep(2);
                    }}
                    title="Click to edit summary"
                  >
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
                  <div
                    className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      setCurrentStep(3);
                    }}
                    title="Click to edit skills"
                  >
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
                  <div
                    className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      setCurrentStep(4);
                    }}
                    title="Click to edit work experience"
                  >
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
                  <div
                    className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      setCurrentStep(5);
                    }}
                    title="Click to edit education"
                  >
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
                  <div
                    className="bg-slate-50 border border-slate-200 rounded-sm p-4 hover:bg-slate-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      setCurrentStep(6);
                    }}
                    title="Click to edit projects"
                  >
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
                No specific improvements detected. Your resume looks good!
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
                Please complete all required fields before generating.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

