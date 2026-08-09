'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LoginForm } from './login-form';
import { ProjectInfoDialog } from './project-info-dialog';

export default function Login() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-8 w-full max-w-105 duration-700">
        <div className="mb-10 text-center">
          <div className="bg-primary shadow-primary/20 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl">
            <Sparkles className="text-primary-foreground h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ورود به <span className="text-primary">تسک منیجر</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            مدیریت هوشمند پروژه‌های تیمی
          </p>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="bg-muted/40 hover:bg-muted/60 border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground mx-auto mt-4 inline-flex cursor-pointer! items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all hover:shadow-sm active:scale-95"
          >
            <Info className="text-primary h-3.5 w-3.5" />
            درباره این پروژه
            <span className="text-muted-foreground/40 text-[10px]">← کلیک کنید</span>
          </button>
        </div>

        <Card className="bg-card/80 border-0 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-muted-foreground/50 mt-6 text-center text-xs">
          © {new Date().getFullYear()} Task Manager. All rights reserved.
        </p>
      </div>

      <ProjectInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
    </>
  );
}
