'use client';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { Check, Moon, Sun } from 'lucide-react';
import { useThemeSwitcher } from '../hooks/use-theme-switcher';

const colorClasses = {
  purple: { light: 'text-purple-500', dark: 'text-purple-400', bg: 'bg-purple-500' },
  green: { light: 'text-emerald-500', dark: 'text-emerald-400', bg: 'bg-emerald-500' },
  blue: { light: 'text-blue-500', dark: 'text-blue-400', bg: 'bg-blue-500' },
  orange: { light: 'text-orange-500', dark: 'text-orange-400', bg: 'bg-orange-500' },
  rose: { light: 'text-rose-500', dark: 'text-rose-400', bg: 'bg-rose-500' },
} as const;

type ThemeColor = keyof typeof colorClasses;

function getColorClass(color: string, isDark: boolean): string {
  return colorClasses[color as ThemeColor]?.[isDark ? 'dark' : 'light'] || '';
}

function getBgClass(color: string): string {
  return colorClasses[color as ThemeColor]?.bg || 'bg-purple-500';
}

export function ThemeQuickSwitch() {
  const { mounted, isDark, themeColors, currentColor, setMode, setColor, isColorActive } =
    useThemeSwitcher();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const iconColor = getColorClass(currentColor, isDark);
  const Icon = isDark ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="group relative h-9 w-9 overflow-hidden">
          <div
            className={cn(
              'absolute inset-1 rounded-full opacity-0 blur-md transition-all duration-500 group-hover:opacity-30',
              getBgClass(currentColor)
            )}
          />
          <Icon
            className={cn(
              'relative h-4.5 w-4.5 transition-all duration-500',
              iconColor,
              'group-hover:scale-110'
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-3" sideOffset={8}>
        {/* Mode Switcher */}
        <div className="bg-muted/50 my-2 flex gap-0.5 rounded-xl p-1">
          <button
            onClick={() => setMode('light')}
            className={cn(
              'relative flex flex-1 cursor-pointer! items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-all duration-300',
              !isDark
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground/60 hover:text-foreground'
            )}
          >
            <Sun
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                !isDark ? getColorClass(currentColor, false) : ''
              )}
            />
            <span>روشن</span>
          </button>
          <button
            onClick={() => setMode('dark')}
            className={cn(
              'relative flex flex-1 cursor-pointer! items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium transition-all duration-300',
              isDark
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground/60 hover:text-foreground'
            )}
          >
            <Moon
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                isDark ? getColorClass(currentColor, true) : ''
              )}
            />
            <span>تاریک</span>
          </button>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Color Palette */}
        <DropdownMenuLabel className="text-muted-foreground mb-2 p-0 px-1 text-[11px] font-medium">
          رنگ تم
        </DropdownMenuLabel>
        <div className="flex gap-1.5">
          {themeColors.map((color) => {
            const isActive = isColorActive(color.value);
            return (
              <button
                key={color.value}
                onClick={() => setColor(color.value)}
                className={cn(
                  'group relative flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2 transition-all duration-200',
                  'hover:bg-muted/50 cursor-pointer!',
                  isActive && 'bg-muted/80'
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full bg-linear-to-br shadow-sm transition-all duration-300',
                      color.gradient,
                      isActive
                        ? 'ring-offset-background scale-110 shadow-md ring-2 ring-offset-1'
                        : 'group-hover:scale-105'
                    )}
                  >
                    {isActive && (
                      <div className="flex h-full w-full items-center justify-center">
                        <Check className="h-3 w-3 text-white drop-shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'text-[10px] transition-all duration-200',
                    isActive
                      ? cn('font-medium opacity-100', getColorClass(color.value, isDark))
                      : 'text-muted-foreground/70 opacity-0 group-hover:opacity-100'
                  )}
                >
                  {color.label}
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
