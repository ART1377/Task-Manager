'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="purple-light"
      enableSystem={false}
      enableColorScheme
      disableTransitionOnChange
      storageKey="task-manager-theme"
      themes={[
        'light',
        'dark',
        'purple-light',
        'purple-dark',
        'green-light',
        'green-dark',
        'blue-light',
        'blue-dark',
        'orange-light',
        'orange-dark',
        'rose-light',
        'rose-dark',
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
