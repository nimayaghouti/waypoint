'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import ImageUpload from '@/components/shared/ImageUpload';
import { Skeleton } from '@/components/ui/skeleton';

import { uploadAvatarAction } from '@/lib/actions/profile';

export interface UploadLabels {
  dragHint: string;
  clickHint: string;
  sizeHint: string;
  remove: string;
  edit: string;
  avatarUpload?: string;
  removeConfirmTitle: string;
  cropTitle: string;
  preparing: string;
  confirm: string;
  cancel: string;
  errorSize: string;
  errorType: string;
  presetOriginal: string;
}

interface Props {
  initialImage: string | null;
  hasCloudinaryImage: boolean;
  labels: Record<string, string>;
  uploadLabels: UploadLabels;
  locale: string;
}

export default function AvatarSection({
  initialImage,
  hasCloudinaryImage,
  labels,
  uploadLabels,
  locale,
}: Props) {
  const [value, setValue] = useState<string | File | null>(initialImage);
  const [prevInitialImage, setPrevInitialImage] = useState<string | null>(
    initialImage,
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (initialImage !== prevInitialImage) {
    setPrevInitialImage(initialImage);
    setValue(initialImage);
  }

  const persist = (fileOrNull: File | null) => {
    startTransition(async () => {
      const formData = new FormData();
      if (fileOrNull instanceof File) formData.append('file', fileOrNull);
      else formData.append('remove', 'true');

      const result = await uploadAvatarAction(formData);
      if (result?.error) {
        toast.error(result.error);
        setValue(initialImage);
      } else {
        toast.success(fileOrNull ? labels.avatarSuccess : labels.avatarRemoved);
        router.refresh();
      }
    });
  };

  const handleChange = (newValue: File | string | null) => {
    setValue(newValue);
    persist(newValue instanceof File ? newValue : null);
  };

  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <div className="relative w-full">
        <ImageUpload
          mode="avatar"
          value={value}
          onChange={handleChange}
          aspectRatio={1}
          cropVariant="square"
          locale={locale}
          avatarClassName="size-36"
          canEditExisting={hasCloudinaryImage}
          isPending={isPending}
          labels={uploadLabels}
        />
        {isPending && (
          <Skeleton className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none size-36 mx-auto opacity-90" />
        )}
      </div>
    </div>
  );
}
