'use client';

import { Compass, KeyRound } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Link, useRouter } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { joinTripByInviteCodeAction } from '@/lib/actions/trip';

interface HeroActionsProps {
  labels: Record<string, string>;
}

export default function HeroActions({ labels }: HeroActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (inviteCode.trim().length < 4) {
      toast.error(labels.invalidCode);
      return;
    }

    startTransition(async () => {
      const result = await joinTripByInviteCodeAction(
        inviteCode.trim().toUpperCase(),
      );

      if (result?.error === 'Unauthorized') {
        toast.error('Please log in first.');
        router.push('/login');
      } else if (result?.error === 'TripNotFound') {
        toast.error(labels.tripNotFound);
      } else if (result?.error) {
        toast.error('An error occurred.');
      } else if (result?.success) {
        toast.success('Successfully joined the trip!');
        router.push(`/trips/${result.tripId}`);
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
      <Button
        asChild
        size="lg"
        className="w-full sm:w-auto h-12 px-8 text-base font-bold shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-1"
      >
        <Link href="/trips?action=new">
          <Compass className="size-5 rtl:ml-2 ltr:mr-2" />
          {labels.ctaStart}
        </Link>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-background/50 backdrop-blur-sm border-2 cursor-pointer hover:bg-muted transition-all"
          >
            <KeyRound className="size-5 rtl:ml-2 ltr:mr-2" />
            {labels.ctaJoin}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{labels.joinModalTitle}</DialogTitle>
            <DialogDescription>{labels.joinModalDesc}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoin} className="flex flex-col gap-4 mt-4">
            <Input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder={labels.inviteCodePlaceholder}
              className="text-center text-lg tracking-widest uppercase font-mono h-12"
              dir="ltr"
              maxLength={8}
            />
            <Button type="submit" size="lg" disabled={isPending || !inviteCode}>
              {isPending ? labels.joinLoading : labels.joinSubmit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
