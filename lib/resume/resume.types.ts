export interface ResumeData {
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
    responsibilities: string[];
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

export interface ApiResponse {
  status: string;
  data: {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  };
}

export interface AnalysisResult {
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

export interface ValidationErrors {
  [key: string]: string;
}

export interface StepInfo {
  id: number;
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface StepDescription {
  title: string;
  subtitle: string;
  context: string;
}

