'use client';

import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';

import { Button } from '../ui/button';
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from '../ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

interface LoginFormProps {
    onRegisterClick?: () => void;
}

interface LoginFormProps {
    onRegisterClick?: () => void;
}

export function LoginForm({ onRegisterClick }: LoginFormProps) {
    const { login, isLoading, error: authError } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // OTP verification handled on separate route: /auth/otp

    async function onSubmit(data: LoginInput) {
        setLocalError(null);
        try {
            await login(data);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                const errorMessage = err.response?.data?.message;
                if (errorMessage === 'Please verify your email first') {
                    // Persist email temporarily for OTP route and navigate
                    try {
                        sessionStorage.setItem('otpEmail', data.email);
                    } catch (e) {
                        console.error('Unable to persist otpEmail in sessionStorage', e);
                    }
                    router.push('/auth/otp');
                    return;
                } else if (errorMessage === 'User not found' && onRegisterClick) {
                    onRegisterClick();
                    return;
                } else {
                    setLocalError(errorMessage || 'Invalid credentials');
                }
            } else {
                setLocalError('An unexpected error occurred');
            }
        }
    }

    const error = authError || localError;

    return (
        <div className="w-full p-6">
            <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                        placeholder="Enter your password"
                                        className="h-11"
                                        {...field} 
                                    />
                                </FormControl>
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
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </Button>
                    {onRegisterClick && (
                        <div className="text-center text-sm pt-2">
                            <span className="text-muted-foreground">Don&apos;t have an account? </span>
                            <button
                                type="button"
                                onClick={onRegisterClick}
                                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline-offset-4 hover:underline transition-colors"
                            >
                                Create account
                            </button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
}
