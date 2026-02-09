import { ResumeData } from "./resume.types";

/**
 * Convert "month - yyyy" format to "YYYY-MM" for month input
 */
export const formatToMonthInput = (value: string): string => {
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

/**
 * Convert "YYYY-MM" format to "month - yyyy" format
 */
export const formatFromMonthInput = (value: string): string => {
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

/**
 * Parse "month - yyyy" format to Date object
 */
export const parseDateFromFormat = (value: string): Date | null => {
  if (!value || value.toLowerCase() === "present") return null;

  const match = value.match(/^(\d{4})-(\d{2})$/);
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

/**
 * Validate work experience dates
 */
export const validateWorkExperienceDates = (
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

  // Check if dates are in the future
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

/**
 * Calculate duration string from date range
 */
export const calculateDuration = (from: string, to: string): string => {
  if (!from) return "";
  // Extract year from month name format (e.g., "Jan 2020" -> "2020")
  const fromYearMatch = from.match(/\d{4}/);
  const toYearMatch = to ? to.match(/\d{4}/) : null;
  const fromYear = fromYearMatch ? fromYearMatch[0] : from;
  const toYear = to ? (toYearMatch ? toYearMatch[0] : to === "Present" ? "Present" : to) : "Present";
  return `${fromYear}-${toYear}`;
};

/**
 * Format name input (title case, letters only)
 */
export const formatNameInput = (value: string): string => {
  // 1. Allow only letters and spaces, replace multiple spaces with single space
  const filtered = value
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

  return formatted;
};

/**
 * Format location input (allow letters, numbers, spaces, commas, quotes, periods, colons)
 */
export const formatLocationInput = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9,\s'.":]/g, "");
};

/**
 * Format education field input (allow only text, spaces, periods, commas, hyphens)
 */
export const formatEducationFieldInput = (value: string): string => {
  return value.replace(/[^a-zA-Z\s.,-]/g, "");
};

/**
 * Format mobile number (enforce +91 prefix, 10 digits)
 */
export const formatMobileInput = (value: string): string => {
  // 1. Ensure it always starts with +91
  if (!value.startsWith("+91")) {
    // If user tries to delete the prefix or change it, enforce it
    // But allow them to type if they are adding digits
    const digitsOnly = value.replace(/\D/g, "");
    // If they cleared it, keep +91
    if (digitsOnly.length === 0) {
      return "+91";
    } else {
      // If they pasted something without +91
      return "+91" + digitsOnly.slice(-10);
    }
  } else {
    // 2. Allow only digits after +91 and limit to 10 digits
    const prefix = "+91";
    const rest = value
      .slice(prefix.length)
      .replace(/[^0-9]/g, "")
      .slice(0, 10);
    return prefix + rest;
  }
};

/**
 * Check if a step has missing required fields
 */
export const getMissingFieldsForStep = (
  stepKey: string,
  resumeData: ResumeData | null
): boolean => {
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
          !exp.company || !exp.position || !exp.period_from || !exp.period_to || !exp.responsibilities || exp.responsibilities.length === 0
      );
    case "projects":
    default:
      return false;
  }
};

