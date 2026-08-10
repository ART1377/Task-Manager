import { auth } from '@/features/auth/auth-config';
import { AppHeader } from '@/shared/components/app-header';
import { AppSidebar } from '@/shared/components/app-sidebar';
import { BottomNav } from '@/shared/components/bottom-nav';
import { MobileHeader } from '@/shared/components/mobile-header';
import { PageTransition } from '@/shared/components/page-transition';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { ROUTES } from '@/shared/lib/routes';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect(ROUTES.LOGIN);

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset>
        <div className="hidden md:block">
          <AppHeader user={session.user} />
        </div>

        <MobileHeader />

        <main className="bg-muted/10 flex-1 overflow-y-auto p-3 pb-20 md:p-6 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>

        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
