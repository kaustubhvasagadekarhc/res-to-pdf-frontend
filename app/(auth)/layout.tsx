"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FileText, Download, FileCheck, Zap, Palette, Share2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      {pathname === "/otp-verification" ? (
        <div className="grid grid-cols-1 lg:grid-cols-1 h-screen">
          <div className="bg-white flex items-center justify-center overflow-y-auto relative">
            <div className="lg:hidden absolute inset-0 z-0 bg-gradient-to-b from-[var(--primary-50)] to-white opacity-40 pointer-events-none" />
            <div className="w-full max-w-[440px] mx-auto px-8 py-4 relative z-10">
              {children}
            </div> 
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
          {/* Left: Blue Background with Content */}
          <aside className="hidden lg:flex flex-col relative h-full w-full overflow-hidden" style={{ backgroundColor: '#33A1E0' }}>
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
            
            <div className="relative z-10 flex flex-col h-full p-12 pt-4">

              <div className="mb-8 flex items-center gap-2">
             
                <Image
                  src="/upload.png"
                  alt="careercanva"
                  width={40}
                  height={40}
                  className="brightness-0 invert"
                />
                  <span className="text-white text-4xl font-bold">CareerCanva</span>
              </div>
              {/* Logo */}

              {/* Welcome Tag */}
              <div className="mt-10 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full w-fit">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-medium text-white">Resume Builder Platform</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight  mb-4">
                {isLogin ? "Transform Your Resume into PDF" : "Create Professional Resumes"}
              </h1>

              {/* Main Heading */}

              {/* Description */}
              <p className="text-lg text-white/90 leading-relaxed mb-8 max-w-md">
                {isLogin
                  ? "Sign in to access your resume builder, edit your profiles, and download professional PDF resumes instantly."
                  : "Start building your professional resume and convert it to PDF format with our easy-to-use resume builder."}
              </p>

              {/* Statistics Cards */}
              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">10K+</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">Resumes Created</div>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">5K+</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">PDF Downloads</div>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-1">100%</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider">PDF Quality</div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Easy Resume Builder</h3>
                      <p className="text-sm text-white/80">
                        Create professional resumes with our intuitive step-by-step builder
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Instant PDF Export</h3>
                      <p className="text-sm text-white/80">
                        Download your resume as a high-quality PDF in seconds
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Professional Templates</h3>
                      <p className="text-sm text-white/80">
                        Choose from multiple professional resume templates and designs
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </aside>

          {/* Right: Content (Form) */}
          <div className="bg-white flex items-center justify-center overflow-y-auto relative">
            {/* Mobile background decor/fallback */}
            <div className="lg:hidden absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0284c7, white)' }} />
            <div className="w-full max-w-[440px] mx-auto px-8 py-12 relative z-10">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
