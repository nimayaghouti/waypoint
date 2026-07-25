'use client';

import { Check, Copy, Link as LinkIcon, UserPlus } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface Props {
  inviteCode: string;
  locale: string;
  labels: {
    inviteButton: string;
    copyCode: string;
    copyLink: string;
    codeCopied: string;
    linkCopied: string;
  };
}

export default function TripInviteActions({
  inviteCode,
  locale,
  labels,
}: Props) {
  const { isCopied: isCodeCopied, copyToClipboard: copyCode } =
    useCopyToClipboard();
  const { isCopied: isLinkCopied, copyToClipboard: copyLink } =
    useCopyToClipboard();

  const handleCopyCode = () => {
    copyCode(inviteCode);
    toast.success(labels.codeCopied);
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const url = `${origin}/${locale}/invite/${inviteCode}`;
    copyLink(url);
    toast.success(labels.linkCopied);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <UserPlus className="size-4" />
          {labels.inviteButton}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleCopyCode}
          className="cursor-pointer gap-2"
        >
          {isCodeCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4 text-muted-foreground" />
          )}
          <span>{labels.copyCode}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer gap-2"
        >
          {isLinkCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <LinkIcon className="size-4 text-muted-foreground" />
          )}
          <span>{labels.copyLink}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
