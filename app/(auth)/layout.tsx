"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left: Content */}
        <div className="bg-card flex items-center">
          <div className="w-full max-w-2xl mx-auto px-6 py-5 ">
            {/* <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                RT
              </div>
              <div className="text-sm text-muted">ResToPDF</div>
            </div> */}

            {/** Allow pages to render their own heading above the card; children contain the Card */}
            {children}
          </div>
        </div>
        {/* Right: Decorative */}
        <aside className="hidden lg:block relative overflow-hidden">
          <Image
            src="/authsideimage.jpg"
            alt="Decorative Image"
            width={1920}
            height={1080}
            className="object-cover"
          />
        </aside>{" "}
      </div>
    </div>
  );
}
