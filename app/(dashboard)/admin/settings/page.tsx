"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/app/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AdminSettings {
    allowRegistration: boolean;
    maintenanceMode: boolean;
    supportEmail: string;
    maxUploadSize: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<AdminSettings>({
        allowRegistration: true,
        maintenanceMode: false,
        supportEmail: "",
        maxUploadSize: 10485760,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                // Assuming API returns data in response.data or directly
                const res = await adminService.getAdminSettings();
                if (res) {
                    setSettings({
                        allowRegistration: res.allowRegistration ?? true,
                        maintenanceMode: res.maintenanceMode ?? false,
                        supportEmail: res.supportEmail || "",
                        maxUploadSize: res.maxUploadSize || 10485760
                    });
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await adminService.putAdminSettings({
                requestBody: settings,
            });
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Failed to update settings", error);
            toast.error("Failed to update settings");
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

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    System Settings
                </h1>
                <p className="text-slate-500 mt-1">
                    Configure global application settings and preferences
                </p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg text-slate-800">General Configuration</CardTitle>
                        <CardDescription>Control access and general behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium text-slate-800">Allow Registration</Label>
                                <p className="text-sm text-slate-500">
                                    Allow new users to sign up independently
                                </p>
                            </div>
                            <Switch
                                checked={settings.allowRegistration}
                                onCheckedChange={(c) => setSettings(s => ({ ...s, allowRegistration: c }))}
                            />
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium text-slate-800">Maintenance Mode</Label>
                                <p className="text-sm text-slate-500">
                                    Disable access for non-admin users temporarily
                                </p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(c) => setSettings(s => ({ ...s, maintenanceMode: c }))}
                            />
                        </div>

                    </CardContent>
                </Card>

                {/* Support Settings */}
                <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg text-slate-800">Support & Limits</CardTitle>
                        <CardDescription>Contact information and upload limits</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-medium text-slate-700">Support Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                                placeholder="support@example.com"
                                className="max-w-md rounded-xl border-slate-200"
                            />
                            <p className="text-sm text-slate-500">Displayed to users when they encounter issues</p>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="grid gap-2">
                            <Label htmlFor="size" className="font-medium text-slate-700">Max Upload Size (Bytes)</Label>
                            <Input
                                id="size"
                                type="number"
                                value={settings.maxUploadSize}
                                onChange={(e) => setSettings(s => ({ ...s, maxUploadSize: parseInt(e.target.value) || 0 }))}
                                className="max-w-md rounded-xl border-slate-200"
                            />
                            <p className="text-sm text-slate-500">
                                Current limit: {(settings.maxUploadSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-200"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}
