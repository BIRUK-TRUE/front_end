'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthBootstrap } from '@/components/auth/auth-bootstrap';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })?.response
                ?.status;
              if (status === 401 || status === 403) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        {mounted && (
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
