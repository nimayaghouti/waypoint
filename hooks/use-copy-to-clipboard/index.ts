'use client';

import { useCallback, useState } from 'react';

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    (value: string) => {
      if (typeof window === 'undefined' || !navigator.clipboard) {
        return;
      }

      navigator.clipboard.writeText(value).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, timeout);
      });
    },
    [timeout],
  );

  return { isCopied, copyToClipboard };
}
