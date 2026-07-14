'use client';

import { MonitorSmartphone, Moon, Sun } from 'lucide-react';

import { useTheme } from 'next-themes';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeToggleProps {
  labels: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer gap-2">
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
        <span>{labels.toggle}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className="cursor-pointer gap-2"
          >
            <Sun className="size-4" />
            <span>{labels.light}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className="cursor-pointer gap-2"
          >
            <Moon className="size-4" />
            <span>{labels.dark}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className="cursor-pointer gap-2"
          >
            <MonitorSmartphone className="size-4" />
            <span>{labels.system}</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
