"use client";

import { toast } from "sonner";
import { adminService } from "@/app/api/client";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
    Check,
    MoreVertical,
    Search,
    Shield,
    ShieldAlert,
    Trash2,
    User,
    X,
    UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    userType: "USER" | "ADMIN";
    isVerified: boolean;
    createdAt: string;
}

export default function UserManagementPage() {
    useAuthGuard("Admin");
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteFile, setInviteFile] = useState<File | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAdminUsers();
            if (Array.isArray(response)) {
                setUsers(response);
            } else if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, currentRole: "USER" | "ADMIN") => {
        try {
            const newRole = currentRole === "USER" ? "ADMIN" : "USER";
            await adminService.patchAdminUsersRole({
                id: userId,
                requestBody: { userType: newRole },
            });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error("Failed to update user role");
        }
    };

    const handleVerifyUpdate = async (userId: string, isVerified: boolean) => {
        try {
            await adminService.patchAdminUsersVerify({
                id: userId,
                requestBody: { isVerified: !isVerified },
            });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Failed to update verification:", error);
            toast.error("Failed to update verification status");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await adminService.deleteAdminUsers({ id: userId });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Failed to delete user");
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setInviteFile(file);
            setIsParsing(true);
            try {
                const response = await adminService.postAdminResumeParse({
                    formData: { resume: file },
                });
                if (response && response.data) {
                    setInviteEmail(response.data.email || "");
                    setInviteName(response.data.name || "");
                } else {
                    // If structure key is missing, ensure it's blank or handle gracefully
                    // Assuming successful response might maintain previous state or simpler clearing if unexpected format
                    setInviteEmail("");
                    setInviteName("");
                }
            } catch (error) {
                console.error("Failed to parse resume:", error);
                toast.error("Failed to parse resume");
            } finally {
                setIsParsing(false);
            }
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail || !inviteName) {
            toast.error("Please provide name and email");
            return;
        }
        setIsInviting(true);
        try {
            await adminService.postAdminUsersInvite({
                requestBody: { email: inviteEmail, name: inviteName },
            });
            setShowInviteDialog(false);
            setInviteFile(null);
            setInviteEmail("");
            setInviteName("");
            toast.success("User invited successfully");
            fetchUsers();
        } catch (error) {
            console.error("Failed to invite user:", error);
            toast.error("Failed to invite user");
        } finally {
            setIsInviting(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-[var(--primary)] mb-1">
                                User Management
                            </h1>
                            <p className="text-slate-600">
                                Manage system users, roles, and access.
                            </p>
                        </div>
                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] whitespace-nowrap font-medium gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Invite User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite New User</DialogTitle>
                                    <DialogDescription>
                                        Upload a resume to auto-fill details or enter them manually.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="resume">Resume (Optional)</Label>
                                        <Input
                                            id="resume"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            disabled={isParsing}
                                        />
                                        {isParsing && <p className="text-sm text-slate-500">Parsing resume...</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={inviteName}
                                            onChange={(e) => setInviteName(e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowInviteDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleInvite} disabled={isInviting || isParsing}>
                                        {isInviting ? "Inviting..." : "Send Invitation"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-700)] focus:border-transparent"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading users...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50">
                            <div className="col-span-4 text-xs font-semibold text-slate-600 uppercase">
                                User
                            </div>
                            <div className="col-span-3 text-xs font-semibold text-slate-600 uppercase">
                                Role
                            </div>
                            <div className="col-span-2 text-xs font-semibold text-slate-600 uppercase">
                                Status
                            </div>
                            <div className="col-span-3 text-right text-xs font-semibold text-slate-600 uppercase">
                                Actions
                            </div>
                        </div>
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50 transition-colors"
                            >
                                <div className="col-span-4">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                                <div className="col-span-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.userType === "ADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-blue-100 text-blue-800"
                                            }`}
                                    >
                                        {user.userType === "ADMIN" ? (
                                            <ShieldAlert className="w-3 h-3" />
                                        ) : (
                                            <Shield className="w-3 h-3" />
                                        )}
                                        {user.userType}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {user.isVerified ? (
                                            <>
                                                <Check className="w-3 h-3" /> Verified
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-3 h-3" /> Unverified
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="col-span-3 flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRoleUpdate(user.id, user.userType)}
                                        title="Toggle Role"
                                    >
                                        <Shield className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleVerifyUpdate(user.id, user.isVerified)}
                                        title="Toggle Verification"
                                    >
                                        <Check className={`w-4 h-4 ${user.isVerified ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
