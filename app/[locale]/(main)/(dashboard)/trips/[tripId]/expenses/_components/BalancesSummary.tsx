'use client';

import { useFormatter } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { cn } from '@/lib/utils';

interface MemberBalance {
  userId: string;
  name: string;
  image: string | null;
  netBalance: number;
  currency: string;
}

interface Props {
  balances: MemberBalance[];
  labels: Record<string, string>;
}

export default function BalancesSummary({ balances, labels }: Props) {
  const format = useFormatter();

  return (
    <Card className="border-border/50 shadow-sm gap-0">
      <CardHeader className="pb-0! border-b border-border/10">
        <CardTitle className="text-base font-bold">
          {labels.balancesTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-3">
        {balances.map(b => (
          <div
            key={b.userId}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={b.image || ''} />
                <AvatarFallback className="text-[10px]">
                  {b.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-25">{b.name}</span>
            </div>

            <span
              dir="ltr"
              className={cn(
                'font-bold text-xs px-2 py-0.5 rounded-md',
                b.netBalance > 0 &&
                  'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
                b.netBalance < 0 && 'text-destructive bg-destructive/10',
                b.netBalance === 0 && 'text-muted-foreground bg-muted',
              )}
            >
              {b.netBalance > 0 && '+'}
              {format.number(b.netBalance, {
                style: 'currency',
                currency: b.currency,
              })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
