'use client';

import { Lock, Undo2 } from 'lucide-react';

import { useFormatter } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  cancelVoteAction,
  closePollAction,
  submitVoteAction,
} from '@/lib/actions/poll';

import PollOptionRow from './PollOptionRow';

interface PollData {
  id: string;
  question: string;
  type: 'SINGLE' | 'MULTI';
  closesAt: string | Date | null;
  options: {
    id: string;
    label: string;
    votes: { userId: string }[];
  }[];
}

interface Props {
  tripId: string;
  currentUserId: string;
  currentUserRole: 'OWNER' | 'EDITOR' | 'VIEWER';
  poll: PollData;
  labels: Record<string, string>;
}

export default function PollCard({
  tripId,
  currentUserId,
  currentUserRole,
  poll,
  labels,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const format = useFormatter();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const closesAtTime = poll.closesAt ? new Date(poll.closesAt).getTime() : null;
  const isClosed = closesAtTime !== null && closesAtTime <= now;
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'EDITOR';

  const myOptionIds = poll.options
    .filter(opt => opt.votes.some(v => v.userId === currentUserId))
    .map(opt => opt.id);
  const hasVoted = myOptionIds.length > 0;

  const uniqueVoterIds = new Set(
    poll.options.flatMap(opt => opt.votes.map(v => v.userId)),
  );
  const totalVoters = uniqueVoterIds.size;

  const showResults = hasVoted || isClosed;
  const canInteract = !showResults && !isPending;

  const errorLabelMap: Record<string, string | undefined> = {
    PollClosed: labels.pollClosedError,
    AlreadyVoted: labels.alreadyVotedError,
    NoVoteToCancel: labels.noVoteToCancelError,
    AlreadyClosed: labels.alreadyClosedError,
    Forbidden: labels.voteError,
  };

  const handleError = (errorCode?: string) => {
    toast.error((errorCode && errorLabelMap[errorCode]) || labels.voteError);
  };

  const handleSingleVote = (optionId: string) => {
    if (!canInteract) return;
    startTransition(async () => {
      const result = await submitVoteAction(tripId, poll.id, [optionId]);
      if (result?.error) handleError(result.error);
    });
  };

  const handleToggleOption = (optionId: string) => {
    if (!canInteract) return;
    setSelectedOptionIds(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId],
    );
  };

  const handleSubmitMulti = () => {
    if (selectedOptionIds.length === 0) {
      toast.error(labels.selectAtLeastOneOption);
      return;
    }
    startTransition(async () => {
      const result = await submitVoteAction(tripId, poll.id, selectedOptionIds);
      if (result?.error) {
        handleError(result.error);
      } else {
        setSelectedOptionIds([]);
      }
    });
  };

  const handleCancelVote = () => {
    startTransition(async () => {
      const result = await cancelVoteAction(tripId, poll.id);
      if (result?.error) {
        handleError(result.error);
      } else {
        setSelectedOptionIds([]);
      }
    });
  };

  const handleConfirmClosePoll = () => {
    startTransition(async () => {
      const result = await closePollAction(tripId, poll.id);
      if (result?.error) handleError(result.error);
      setIsCloseDialogOpen(false);
    });
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/10">
        <div className="flex flex-wrap-reverse items-center justify-between gap-4">
          <CardTitle className="text-lg leading-snug">
            {poll.question}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0 ms-auto">
            {isClosed && (
              <Badge
                variant="outline"
                className="gap-1 font-normal text-xs text-muted-foreground"
              >
                <Lock className="size-3" />
                {labels.closedBadge}
              </Badge>
            )}
            <Badge variant="secondary" className="font-normal text-xs">
              {poll.type === 'SINGLE' ? labels.typeSingle : labels.typeMulti}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-3">
        {poll.options.map(option => {
          const voteCount = option.votes.length;
          const percentage =
            totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;
          const isMine = myOptionIds.includes(option.id);
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <PollOptionRow
              key={option.id}
              label={option.label}
              pollType={poll.type}
              percentage={percentage}
              percentageLabel={format.number(Math.round(percentage))}
              isMine={isMine}
              isSelected={isSelected}
              canInteract={canInteract}
              isPending={isPending}
              onActivate={() =>
                poll.type === 'MULTI'
                  ? handleToggleOption(option.id)
                  : handleSingleVote(option.id)
              }
            />
          );
        })}

        {poll.type === 'MULTI' && canInteract && (
          <Button
            type="button"
            className="cursor-pointer mt-1"
            disabled={isPending || selectedOptionIds.length === 0}
            onClick={handleSubmitMulti}
          >
            {isPending ? labels.submitVoteLoading : labels.submitVoteButton}
          </Button>
        )}
      </CardContent>

      <CardFooter className="p-4 flex items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
        <span>
          {labels.votesCount.replace('{count}', format.number(totalVoters))}
        </span>

        <div className="flex items-center gap-2">
          {hasVoted && !isClosed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1 h-7 px-2 text-xs"
              disabled={isPending}
              onClick={handleCancelVote}
            >
              <Undo2 className="size-3.5" />
              {labels.RetractVoteButton}
            </Button>
          )}

          {canManage && !isClosed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              disabled={isPending}
              onClick={() => setIsCloseDialogOpen(true)}
            >
              <Lock className="size-3.5" />
              {labels.closePollButton}
            </Button>
          )}
        </div>
      </CardFooter>

      <ConfirmDialog
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onConfirm={handleConfirmClosePoll}
        isPending={isPending}
        labels={{
          title: labels.closePollDialogTitle,
          description: labels.closePollConfirm,
          cancel: labels.closePollDialogCancel,
          confirmButton: labels.closePollButton,
        }}
      />
    </Card>
  );
}
