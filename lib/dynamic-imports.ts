/**
 * Dynamic Import Utilities for Code Splitting
 * 
 * These helpers enable lazy loading of heavy components
 * to improve initial page load performance.
 */

import dynamic from 'next/dynamic';

// Re-export dynamic for direct use with proper typing
export { dynamic };

// Pre-configured dynamic imports for heavy components

/**
 * PDF Viewer Component - Lazy loaded
 * Only loads when user wants to view a PDF
 */
export const PdfViewer = dynamic(
  () => import('@/components/user/resumes/dialogs/ViewPdfModal').then((mod) => mod.ViewPdfModal),
  { ssr: false }
);

/**
 * Rename Dialog - Lazy loaded
 * Only loads when user clicks rename
 */
export const RenameDialog = dynamic(
  () => import('@/components/user/resumes/dialogs/RenameDialog').then((mod) => mod.RenameDialog),
  { ssr: false }
);

/**
 * Delete Confirmation Dialog - Lazy loaded
 */
export const DeleteConfirmDialog = dynamic(
  () => import('@/components/user/resumes/dialogs/DeleteConfirmDialog').then((mod) => mod.DeleteConfirmDialog),
  { ssr: false }
);

/**
 * Upload Zone Component - Lazy loaded
 * Only needed on upload page
 */
export const UploadZone = dynamic(
  () => import('@/components/upload/upload-zone').then((mod) => mod.UploadZone),
  { ssr: false }
);

/**
 * Edit Resume Form Sections - Lazy loaded individually
 */
export const PersonalInfoSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/PersonalInfo').then((mod) => mod.PersonalInfo)
);

export const SummarySection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Summary').then((mod) => mod.Summary)
);

export const SkillsSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Skills').then((mod) => mod.Skills)
);

export const ExperienceSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Experience').then((mod) => mod.Experience)
);

export const EducationSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Education').then((mod) => mod.Education)
);

export const ProjectsSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Projects').then((mod) => mod.Projects)
);

export const ReviewSection = dynamic(
  () => import('@/components/user/edit-resume/form/sections/Review').then((mod) => mod.Review)
);

/**
 * Dashboard Shell - Lazy loaded
 */
export const DashboardShell = dynamic(
  () => import('@/components/layout/dashboard-shell').then((mod) => mod.DashboardShell)
);

/**
 * Sidebar - Lazy loaded
 */
export const Sidebar = dynamic(
  () => import('@/components/layout/sidebar').then((mod) => mod.Sidebar),
  { ssr: false }
);

/**
 * Header - Lazy loaded
 */
export const Header = dynamic(
  () => import('@/components/layout/header').then((mod) => mod.Header),
  { ssr: false }
);
