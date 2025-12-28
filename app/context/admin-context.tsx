import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { adminService } from "@/app/api/client";
import { ActivityLog, User, AdminSettings } from "../../types/api";

type AdminStats = {
    totalUsers: number;
    activeUsers: number;
    totalResumes: number;
    todayResumes: number;
};

interface AdminContextType {
    users: User[];
    stats: AdminStats;
    recentActivities: ActivityLog[];
    settings: AdminSettings | null;
    isLoading: boolean;
    refreshData: () => Promise<void>;
    updateLocalUser: (userId: string, updates: Partial<User>) => void;
    removeLocalUser: (userId: string) => void;
    updateSettings: (newSettings: AdminSettings) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalResumes: 0,
        todayResumes: 0,
    });
    const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
    const [settings, setSettings] = useState<AdminSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, statsRes, activitiesRes, settingsRes] = await Promise.all([
                adminService.getAdminUsers(),
                adminService.getAdminStats(),
                adminService.getAdminActivitiesRecent({ limit: 5 }),
                adminService.getAdminSettings()
            ]);

            // Handle Users
            if (usersRes && Array.isArray(usersRes.data)) {
                setUsers(usersRes.data);
            } else if (Array.isArray(usersRes)) {
                setUsers(usersRes);
            }

            // Handle Stats
            if (statsRes.data) {
                setStats({
                    totalUsers: statsRes.data.totalUsers || 0,
                    activeUsers: statsRes.data.totalUsers || 0, // Mocking active as total for now if not distinct
                    totalResumes: statsRes.data.totalResumes || 0,
                    todayResumes: statsRes.data.totalGenerated || 0,
                });
            }

            // Handle Activities
            if (activitiesRes && activitiesRes.data) {
                setRecentActivities(activitiesRes.data);
            }

            // Handle Settings
            if (settingsRes) {
                setSettings({
                    allowRegistration: settingsRes.allowRegistration ?? true,
                    maintenanceMode: settingsRes.maintenanceMode ?? false,
                    supportEmail: settingsRes.supportEmail || "",
                    maxUploadSize: settingsRes.maxUploadSize || 10485760
                });
            }

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const updateLocalUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, ...updates } : user
        ));
    };

    const removeLocalUser = (userId: string) => {
        setUsers(prev => prev.filter(user => user.id !== userId));
    };

    const updateSettings = (newSettings: AdminSettings) => {
        setSettings(newSettings);
    };

    // Memoize the value to avoid unnecessary re-renders in consumers
    const value = useMemo(() => ({
        users,
        stats,
        recentActivities,
        settings,
        isLoading,
        refreshData,
        updateLocalUser,
        removeLocalUser,
        updateSettings
    }), [users, stats, recentActivities, settings, isLoading]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
