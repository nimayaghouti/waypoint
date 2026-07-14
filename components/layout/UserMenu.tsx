'use client';

import {
  LayoutDashboard,
  LogIn,
  LogOut,
  UserCircle,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { LogoutDialog } from '@/components/layout/LogoutDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: 'ADMIN' | 'USER';
  } | null;
  labels: {
    login: string;
    register: string;
    dashboard: string;
    profile: string;
    logout: string;
    guestName: string;
    logoutConfirmTitle: string;
    logoutConfirmDesc: string;
    logoutCancel: string;
    logoutConfirmButton: string;
  };
  children: React.ReactNode;
}

export function UserMenu({ user, labels, children }: UserMenuProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirectTo: '/' });
  };

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary cursor-pointer rounded-full"
          >
            <UserCircle className="size-6 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href="/login" className="flex w-full items-center">
                <LogIn className="size-4 text-muted-foreground" />
                <span>{labels.login}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href="/register" className="flex w-full items-center">
                <UserPlus className="size-4 text-muted-foreground" />
                <span>{labels.register}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>{children}</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const displayName =
    user.name || user.email?.split('@')[0] || labels.guestName;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative size-8 rounded-full cursor-pointer"
          >
            <Avatar className="size-8 border border-border/50">
              <AvatarImage src={user.image || ''} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium uppercase">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate" dir="ltr">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user.role === 'ADMIN' && (
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link href="/admin" className="flex w-full items-center">
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                  <span>{labels.dashboard}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href="/profile" className="flex w-full items-center">
                <UserIcon className="size-4 text-muted-foreground" />
                <span>{labels.profile}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>{children}</DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer gap-2"
            onSelect={() => setShowLogoutDialog(true)}
          >
            <LogOut className="size-4" />
            <span>{labels.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
        labels={{
          title: labels.logoutConfirmTitle,
          description: labels.logoutConfirmDesc,
          cancel: labels.logoutCancel,
          confirmButton: labels.logoutConfirmButton,
        }}
      />
    </>
  );
}
