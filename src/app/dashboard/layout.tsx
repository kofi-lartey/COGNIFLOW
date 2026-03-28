/* src/app/dashboard/layout.tsx */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pages that should not show the sidebar
  const noSidebarRoutes = ['/dashboard/payment-checkout', '/dashboard/payment-result'];
  const showSidebar = !noSidebarRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Check authentication and onboarding status
    const checkAuth = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Check for Supabase auth
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login');
        return;
      }

      // Check onboarding completion
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      
      // For demo mode, we consider onboarding complete if the flag is set
      // In production, you'd check the user profile from the database
      if (!onboardingCompleted && pathname !== '/onboarding') {
        router.push('/onboarding');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname, user, authLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B13] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9CA3AF]">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  // For pages without sidebar, just render children
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-[#090B13]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#090B13] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}