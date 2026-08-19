import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { initiateGoogleLinkAction } from '@/lib/actions/profile';

interface Props {
  isGoogleConnected: boolean;
  labels: Record<string, string>;
  connectHint: React.ReactNode;
  connectedHint: React.ReactNode;
}

export default function GoogleSection({
  isGoogleConnected,
  labels,
  connectHint,
  connectedHint,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">{labels.googleTitle}</label>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 w-fit">
            {isGoogleConnected ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-sm font-medium">
                  {labels.googleConnected}
                </span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {labels.googleNotConnected}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isGoogleConnected ? connectedHint : connectHint}
          </p>
        </div>
        {!isGoogleConnected && (
          <form action={initiateGoogleLinkAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              {labels.connectGoogle}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
