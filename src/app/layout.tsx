import { ToastConfig } from '@/shared/components/toast-config';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { PresenceProvider } from '@/shared/providers/presence-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import '../styles/globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: {
    default: 'Task Manager SaaS',
    template: '%s | Task Manager',
  },
  description: 'Modern task management application for teams',
  keywords: ['task management', 'project management', 'kanban', 'team collaboration'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Task Manager SaaS',
    description: 'Modern task management application',
    type: 'website',
    locale: 'fa_IR',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <PresenceProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </PresenceProvider>
              <ToastConfig />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
