'use client';

import { authService } from '@/services/auth.services';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/Login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(() => {
    if (searchParams.get('registered')) return 'login';
    if (searchParams.get('view') === 'register') return 'register';
    return 'login';
  });

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered) {
      // Optional: Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('registered');
      const newUrl = params.toString() ? `/auth?${params.toString()}` : '/auth';
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const handleTabChange = (value: string) => {
    const tab = value as 'login' | 'register';
    setActiveTab(tab);

    // Update URL to reflect state
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'register') {
      params.set('view', 'register');
    } else {
      params.delete('view');
    }
    const newUrl = params.toString() ? `/auth?${params.toString()}` : '/auth';
    router.push(newUrl);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and header */}
          <div className="text-center flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-xl">
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome
              </h1>
            </div>
          </div>

          {/* Auth card with glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-1">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/50 dark:bg-gray-800/50 p-1">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-0">
                  <LoginForm onRegisterClick={() => setActiveTab('register')} />
                </TabsContent>
                <TabsContent value="register" className="mt-0">
                  <RegisterForm onLoginClick={() => setActiveTab('login')} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (authService.isAuthenticated()) {
      const cached = localStorage.getItem('dashboardData');
      if (cached) {
        const dashboardData = JSON.parse(cached);
        const userType = dashboardData.userType || dashboardData.user?.userType;
        if (userType === 'user') {
          router.replace('/dashboard/user');
        } else if (userType === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/dashboard/user');
        }
      } else {
        router.replace('/dashboard/user');
      }
    }
  }, [router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
