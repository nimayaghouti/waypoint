'use client';

import { Plus } from 'lucide-react';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { createExpenseAction, CreateExpenseInput } from '@/lib/actions/expense';

interface Member {
  userId: string;
  user: { name: string | null; email: string; image: string | null };
}

interface ShareState {
  userId: string;
  isSelected: boolean;
  customAmount: string;
  name: string;
  image: string | null;
}

interface Props {
  tripId: string;
  currentUserId: string;
  defaultCurrency: string;
  members: Member[];
  labels: Record<string, string>;
  valLabels: Record<string, string>;
}

export default function AddExpenseModal({
  tripId,
  currentUserId,
  defaultCurrency,
  members,
  labels,
  valLabels,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const currency = defaultCurrency;
  const [paidById, setPaidById] = useState(currentUserId);
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');

  const [shares, setShares] = useState<ShareState[]>(() =>
    members.map(m => ({
      userId: m.userId,
      isSelected: true,
      customAmount: '',
      name: m.user.name || m.user.email.split('@')[0],
      image: m.user.image,
    })),
  );

  const numAmount = parseFloat(amount) || 0;
  const selectedShares = shares.filter(s => s.isSelected);
  const selectedCount = selectedShares.length;

  const equalSplitMap = useMemo(() => {
    const map = new Map<string, string>();
    if (selectedCount === 0 || numAmount <= 0) {
      shares.forEach(s => map.set(s.userId, '0.00'));
      return map;
    }

    const equalShare = Math.floor((numAmount / selectedCount) * 100) / 100;
    const totalCalculated = equalShare * selectedCount;
    const remainder = Math.round((numAmount - totalCalculated) * 100) / 100;

    let remainderAdded = false;
    shares.forEach(s => {
      if (!s.isSelected) {
        map.set(s.userId, '0.00');
      } else if (!remainderAdded) {
        map.set(s.userId, (equalShare + remainder).toFixed(2));
        remainderAdded = true;
      } else {
        map.set(s.userId, equalShare.toFixed(2));
      }
    });

    return map;
  }, [numAmount, selectedCount, shares]);

  const handleToggleSelect = (userId: string, isSelected: boolean) => {
    setShares(prev =>
      prev.map(s => (s.userId === userId ? { ...s, isSelected } : s)),
    );
  };

  const handleCustomAmountChange = (userId: string, customAmount: string) => {
    setShares(prev =>
      prev.map(s => (s.userId === userId ? { ...s, customAmount } : s)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateExpenseInput = {
      description,
      amount: numAmount,
      paidById,
      shares: shares.map(s => ({
        userId: s.userId,
        isSelected: s.isSelected,
        amount:
          splitMode === 'EQUAL'
            ? parseFloat(equalSplitMap.get(s.userId) ?? '0')
            : parseFloat(s.customAmount) || 0,
      })),
    };

    startTransition(async () => {
      const result = await createExpenseAction(tripId, payload);

      if (result.fieldErrors) {
        setErrors(result.fieldErrors as Record<string, string[]>);
      } else if (result.error) {
        toast.error(valLabels[result.error] || result.error);
      } else if (result.success) {
        toast.success(labels.successAdded);
        setIsOpen(false);
        setDescription('');
        setAmount('');
        setSplitMode('EQUAL');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer ms-auto gap-2">
          <Plus className="size-4" />
          {labels.addExpense}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {labels.addExpense}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-2"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.descLabel}</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={labels.descPlaceholder}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-xs font-bold text-destructive">
                {errors.description[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.amountLabel}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={labels.amountPlaceholder}
                disabled={isPending}
                dir="ltr"
                className="text-start"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium opacity-0"
                aria-hidden="true"
              >
                {labels.currency}
              </label>
              <Input
                value={currency}
                disabled
                className="bg-muted text-center"
              />
            </div>
          </div>
          {errors.amount && (
            <p className="text-xs font-bold text-destructive -mt-2">
              {errors.amount[0]}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.paidByLabel}</label>
            <Select
              value={paidById}
              onValueChange={setPaidById}
              disabled={isPending}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shares.map(share => (
                  <SelectItem
                    key={share.userId}
                    value={share.userId}
                    className="cursor-pointer"
                  >
                    {share.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paidById && (
              <p className="text-xs font-bold text-destructive">
                {errors.paidById[0]}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-between p-3 border border-border/50 rounded-xl bg-muted/10 mt-2">
            <span className="text-sm font-medium">{labels.splitHow}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs ${splitMode === 'EQUAL' ? 'font-bold' : 'text-muted-foreground'}`}
              >
                {labels.splitEqual}
              </span>
              <Switch
                checked={splitMode === 'CUSTOM'}
                onCheckedChange={c => setSplitMode(c ? 'CUSTOM' : 'EQUAL')}
                disabled={isPending}
                className="cursor-pointer"
                dir="ltr"
              />
              <span
                className={`text-xs ${splitMode === 'CUSTOM' ? 'font-bold' : 'text-muted-foreground'}`}
              >
                {labels.splitCustom}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {labels.splitWithLabel}
            </label>
            <ScrollArea className="h-40 border border-border/50 rounded-md p-2">
              <div className="flex flex-col gap-2">
                {shares.map(share => (
                  <div
                    key={share.userId}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={share.isSelected}
                        onCheckedChange={c =>
                          handleToggleSelect(share.userId, !!c)
                        }
                        disabled={
                          isPending ||
                          (splitMode === 'EQUAL' &&
                            selectedCount === 1 &&
                            share.isSelected)
                        }
                        className="cursor-pointer"
                      />
                      <Avatar className="size-6">
                        <AvatarImage src={share.image || ''} />
                        <AvatarFallback className="text-[10px]">
                          {share.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate w-24 sm:w-48">
                        {share.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 w-full sm:max-w-24">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          splitMode === 'EQUAL'
                            ? (equalSplitMap.get(share.userId) ?? '0.00')
                            : share.customAmount
                        }
                        onChange={e =>
                          handleCustomAmountChange(share.userId, e.target.value)
                        }
                        disabled={
                          isPending ||
                          splitMode === 'EQUAL' ||
                          !share.isSelected
                        }
                        className="h-8 text-xs text-end px-2"
                        dir="ltr"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {errors.shares && (
              <p className="text-xs font-bold text-destructive">
                {errors.shares[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || numAmount <= 0}
            className="mt-2 w-full cursor-pointer"
          >
            {isPending ? '...' : labels.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
