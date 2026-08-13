'use client';

import { UserCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { cn, getUserDisplayName } from '@/lib/utils';

interface Props {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  deletedLabel: string;
  className?: string;
  avatarClassName?: string;
  textClassName?: string;
}

export default function UserDisplay({
  user,
  deletedLabel,
  className,
  avatarClassName,
  textClassName,
}: Props) {
  const displayName = getUserDisplayName(user, deletedLabel);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar
        className={cn(
          'size-6 shrink-0',
          !user && 'opacity-50',
          avatarClassName,
        )}
      >
        {user ? (
          <AvatarImage src={user.image || undefined} alt={displayName} />
        ) : null}
        <AvatarFallback className={cn(!user && 'bg-muted', 'text-[10px]')}>
          {user ? (
            displayName.charAt(0).toUpperCase()
          ) : (
            <UserCircle className="size-4 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'font-medium truncate',
          !user && 'text-muted-foreground italic',
          textClassName,
        )}
      >
        {displayName}
      </span>
    </div>
  );
}
