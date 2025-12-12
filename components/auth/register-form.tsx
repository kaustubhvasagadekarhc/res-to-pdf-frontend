"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema";

import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface RegisterFormProps {
    onLoginClick?: () => void;
}

interface RegisterFormProps {
    onLoginClick?: () => void;
}

export function RegisterForm({ onLoginClick }: RegisterFormProps) {
    const { register, isLoading, error: authError } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            jobTitle: "",
            userType: undefined,
        },
    });
    console.log("RegisterForm", register);

    async function onSubmit(data: RegisterInput) {
        setLocalError(null);
        try {
            await register(data);
        } catch (err: unknown) {
            // Error handled by hook
            if (err instanceof Error) {
                setLocalError(err.message);
            }
        }
    }

    const error = authError || localError;

    return (
        <div className="w-full p-6">
            <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                <p className="text-sm text-muted-foreground">Enter your details to register.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="John Doe" 
                                        className="h-11"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="name@example.com" 
                                        type="email"
                                        className="h-11"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="Create a strong password"
                                        className="h-11"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g. Software Engineer" 
                                        className="h-11"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="userType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>I am a</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="user">user - Looking for opportunities</SelectItem>
                                        <SelectItem value="Admin">Admin - Hiring talent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}
                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 transition-all" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </Button>
                    {onLoginClick && (
                        <div className="text-center text-sm pt-2">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <button
                                type="button"
                                onClick={onLoginClick}
                                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline-offset-4 hover:underline transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
}
