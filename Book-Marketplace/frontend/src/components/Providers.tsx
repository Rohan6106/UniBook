"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import ThemeRegistry from './ThemeRegistry';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
        <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ThemeRegistry>
                {children}
            </ThemeRegistry>
        </NextThemeProvider>
    </QueryClientProvider>
  );
}