"use client";

import React, { useEffect, useState } from "react";
import { adminService } from "@/app/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Check } from "lucide-react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { useAdmin } from "@/app/context/admin-context";
import { AdminSettings } from "@/types/api";

// Custom Toggle Switch with Checkmark
const ToggleSwitch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        checked={checked}
        className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-blue-600" : "bg-gray-300",
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none relative flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                checked ? "translate-x-5" : "translate-x-0"
            )}
        >
            {checked && (
                <Check className="h-3.5 w-3.5 text-blue-600 stroke-[3]" />
            )}
        </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
));
ToggleSwitch.displayName = "ToggleSwitch";

export default function SettingsPage() {
    const { settings: ctxSettings, isLoading: ctxLoading, updateSettings, refreshData } = useAdmin();
    const [settings, setSettings] = useState<AdminSettings>({
        allowRegistration: true,
        maintenanceMode: false,
        supportEmail: "",
        maxUploadSize: 10485760,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!ctxLoading && ctxSettings) {
            setSettings(ctxSettings);
            setLoading(false);
        } else if (!ctxLoading && !ctxSettings) {
            // Fallback or retry if settings failed to load but context finished
            setLoading(false);
        }
    }, [ctxSettings, ctxLoading]);

    const handleSave = async () => {
        try {
            setSaving(true);

            // Optimistic update (optional, but we have local state anyway driving the UI)
            updateSettings(settings);

            await adminService.putAdminSettings({
                requestBody: settings,
            });
            toast.success("Settings updated successfully");
            refreshData(); // Ensure context is perfectly synced
        } catch (error) {
            console.error("Failed to update settings", error);
            toast.error("Failed to update settings");
            refreshData(); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="font-medium">Loading settings...</span>
                </div>
            </div>
        )
    }

    // Convert bytes to MB for display
    const maxUploadSizeMB = Math.round(settings.maxUploadSize / 1024 / 1024);
    const handleMaxUploadSizeChange = (mb: number) => {
        setSettings(s => ({ ...s, maxUploadSize: mb * 1024 * 1024 }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
                        System Settings
                    </h1>
                    <p className="text-slate-600">
                        Configure global application settings and preferences for your workspace.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* General Settings */}
                    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shadow-md">
                        <CardHeader className="bg-white border-b border-slate-100 pb-4 px-6 pt-6">
                            <CardTitle className="text-lg font-semibold text-slate-800">General Configuration</CardTitle>
                            <CardDescription className="text-sm text-slate-600 mt-1">
                                Control access and general behavior of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 flex-1">
                                    <Label className="text-base font-medium text-slate-800">Allow Registration</Label>
                                    <p className="text-sm text-slate-600">
                                        Allow new users to sign up independently via the public registration page.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={settings.allowRegistration}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, allowRegistration: c }))}
                                />
                            </div>

                            <Separator className="bg-slate-200" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-1 flex-1">
                                    <Label className="text-base font-medium text-slate-800">Maintenance Mode</Label>
                                    <p className="text-sm text-slate-600">
                                        Disable access for non-admin users temporarily. Useful during upgrades.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, maintenanceMode: c }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Settings */}
                    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-100 pb-4 px-6 pt-6">
                            <CardTitle className="text-lg font-semibold text-slate-800">Support & Limits</CardTitle>
                            <CardDescription className="text-sm text-slate-600 mt-1">
                                Manage contact information and system upload limits.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-base font-medium text-slate-800">Support Email</Label>
                                <div className="relative max-w-md">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                                        placeholder="support@example.com"
                                        className="pl-10 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <p className="text-sm text-slate-600">
                                    This email address will be displayed to users when they encounter system errors.
                                </p>
                            </div>

                            <Separator className="bg-slate-200" />

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="size" className="text-base font-medium text-slate-800">Max Upload Size</Label>
                                    <span className="text-base font-medium text-blue-600">{maxUploadSizeMB} MB</span>
                                </div>
                                <div className="max-w-md space-y-2">
                                    <input
                                        id="size"
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={maxUploadSizeMB}
                                        onChange={(e) => handleMaxUploadSizeChange(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        style={{
                                            background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((maxUploadSizeMB - 1) / 99) * 100}%, rgb(229, 231, 235) ${((maxUploadSizeMB - 1) / 99) * 100}%, rgb(229, 231, 235) 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>1 MB</span>
                                        <span>100 MB</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (ctxSettings) {
                                    setSettings(ctxSettings);
                                }
                            }}
                            disabled={saving}
                            className="px-6 py-2 border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
