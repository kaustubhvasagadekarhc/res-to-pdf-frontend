"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let imageSrc = "/login.png";
  if (pathname === "/login") {
    imageSrc = "/login.png";
  } else if (pathname === "/register") {
    imageSrc = "/register.png";
  } else if (pathname === "/otp-verification") {
    imageSrc = "/otp-verify.jpg";
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      {pathname === "/otp-verification" ? <div className="grid grid-cols-1 lg:grid-cols-1 h-screen">
     
        <div className="bg-white flex items-center justify-center overflow-y-auto relative">
          {/* Mobile background decor/fallback */}
          <div className="lg:hidden absolute inset-0 z-0 bg-gradient-to-b from-[var(--primary-50)] to-white opacity-40 pointer-events-none" />
          <div className="w-full max-w-[440px] mx-auto px-8 py-4 relative z-10">
            {children}
          </div>
        </div>
      </div> : <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left: Decorative & Motto */}
        <aside className="hidden lg:flex flex-col relative h-full w-full bg-[var(--primary-50)] items-center justify-center overflow-hidden p-12">
          {/* Decorative Background Elements */}


          <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-700 leading-tight tracking-tight">
              Redefine your <br />
              <span className="text-[var(--primary)]">
                Professional Story
              </span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-md mx-auto">
              Crafting perfect resumes shouldn&apos;t be hard. Join us to
              transform your career path with industry-standard tools.
            </p>


            <div className=" h-[300px] relative w-full max-w-[480px] aspect-square">
              <Image
                src={imageSrc}
                alt="Authentication Illustration"
                fill
                priority
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </aside>

        {/* Right: Content (Form) */}
        <div className="bg-white flex items-center justify-center overflow-y-auto relative">
          {/* Mobile background decor/fallback */}
          <div className="lg:hidden absolute inset-0 z-0 bg-gradient-to-b from-[var(--primary-50)] to-white opacity-40 pointer-events-none" />
          <div className="w-full max-w-[440px] mx-auto px-8 py-12 relative z-10">
            {children}
          </div>
        </div>
      </div>}
    </div>
  );
}
