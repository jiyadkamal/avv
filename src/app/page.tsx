'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const role = user.role;
        const dashboardPath = role === 'admin'
          ? "/admin/dashboard"
          : role === 'contributor'
            ? "/contributor/dashboard"
            : "/subscriber/dashboard";
        router.push(dashboardPath);
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
