"use client";

import { AdminProvider } from "@/app/context/admin-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminProvider>
            {children}
        </AdminProvider>
    );
}
