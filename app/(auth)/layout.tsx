"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let imageSrc = "/login.jpg"; 
  if (pathname === "/login") {
    imageSrc = "/login.jpg";
  } else if (pathname === "/register") {
    imageSrc = "/register.jpg";
  } else if (pathname === "/otp-verification") {
    imageSrc = '/otp-verify.jpg';
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left: Content */}
        <div className="bg-card flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-lg mx-auto px-6 py-8">
            {children}
          </div>
        </div>
        {/* Right: Decorative */}
        <aside className="hidden lg:flex relative h-full w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 items-center justify-center overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-700" />
            <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] mix-blend-multiply -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative w-full max-w-[650px] aspect-square p-8 flex items-center justify-center">
            <div className="relative w-full h-full p-8">
              <Image
                src={imageSrc}
                alt="Authentication Illustration"
                fill
                className="object-contain mix-blend-multiply opacity-90"
                priority
              />
            </div> 
          </div>
        </aside>
      </div>
    </div>
  );
}
