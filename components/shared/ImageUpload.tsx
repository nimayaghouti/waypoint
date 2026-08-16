'use client';

import { Camera, Edit2, Trash2, UploadCloud, UserCircle } from 'lucide-react';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ImageCropper from '@/components/shared/ImageCropper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from '@/lib/validations/shared-image';

interface ImageUploadProps {
  value?: string | File | null;
  onChange: (value: File | string | null) => void;
  disabled?: boolean;
  aspectRatio?: number;
  cropVariant?: 'cover' | 'square';
  mode?: 'dropzone' | 'avatar';
  avatarClassName?: string;
  locale: string;
  canEditExisting?: boolean;
  isPending: boolean;
  labels: {
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
  };
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
  aspectRatio = 1,
  cropVariant = 'square',
  mode = 'dropzone',
  avatarClassName,
  locale,
  canEditExisting = true,
  isPending,
  labels,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInteractive = !disabled && !isPending;
  const canShowEditButton =
    !!preview && (value instanceof File || canEditExisting);

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      return;
    }
    if (typeof value === 'string') {
      setPreview(value);
      return;
    }
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleFileSelection = (file: File) => {
    if (!isInteractive) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(labels.errorSize);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(labels.errorType);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setRawImageToCrop(objectUrl);
    setCropModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    onChange(croppedFile);
    setCropModalOpen(false);
    if (rawImageToCrop && rawImageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageToCrop);
      setRawImageToCrop(null);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    if (rawImageToCrop && rawImageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageToCrop);
      setRawImageToCrop(null);
    }
  };

  const handleEditExisting = () => {
    if (preview) {
      setRawImageToCrop(preview);
      setCropModalOpen(true);
    }
  };

  const openFilePicker = () => {
    if (isInteractive) fileInputRef.current?.click();
  };

  const handleRemoveClick = () => setRemoveConfirmOpen(true);

  const handleConfirmRemove = () => {
    onChange(null);
    setRemoveConfirmOpen(false);
  };

  return (
    <div className="w-full">
      {mode === 'avatar' ? (
        <div className="relative flex flex-col gap-4 items-center w-fit mx-auto">
          <Avatar
            className={cn('size-24 border border-border/50', avatarClassName)}
          >
            {preview ? (
              <AvatarImage src={preview} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback>
              <UserCircle className="size-1/2 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              preview
                ? 'flex items-center justify-center gap-1 mx-auto'
                : 'absolute z-2 -bottom-1 inset-e-2',
            )}
          >
            {!disabled && (
              <Button
                type="button"
                variant={preview ? 'outline' : 'default'}
                size="icon"
                className="size-8 rounded-full shadow-md cursor-pointer"
                onClick={openFilePicker}
                title={labels.avatarUpload}
                aria-label={labels.avatarUpload}
                disabled={isPending}
              >
                <Camera className="size-4" />
              </Button>
            )}

            {!disabled && canShowEditButton && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-full shadow-md cursor-pointer"
                onClick={handleEditExisting}
                title={labels.edit}
                aria-label={labels.edit}
                disabled={isPending}
              >
                <Edit2 className="size-4" />
              </Button>
            )}
            {!disabled && preview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="size-8 rounded-full shadow-md cursor-pointer"
                onClick={handleRemoveClick}
                title={labels.remove}
                aria-label={labels.remove}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ) : preview ? (
        <div className="relative group w-full max-w-50 mx-auto">
          <div
            className={cn(
              'relative overflow-hidden border border-border/50',
              cropVariant === 'square'
                ? 'aspect-square rounded-full'
                : 'aspect-video rounded-xl',
            )}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={preview.startsWith('blob:')}
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {canShowEditButton && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-8 rounded-full"
                    onClick={handleEditExisting}
                    title={labels.edit}
                    disabled={isPending}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={handleRemoveClick}
                  title={labels.remove}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50',
            !isInteractive && 'opacity-50 cursor-not-allowed',
          )}
          onDragOver={e => {
            e.preventDefault();
            if (isInteractive) setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragActive(false);
            if (!isInteractive || !e.dataTransfer.files?.[0]) return;
            handleFileSelection(e.dataTransfer.files[0]);
          }}
          onClick={openFilePicker}
        >
          <UploadCloud className="size-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium mb-1">{labels.dragHint}</p>
          <p className="text-xs text-muted-foreground text-center">
            {labels.clickHint}
            <br />
            {labels.sizeHint}
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        disabled={!isInteractive}
        onChange={e => {
          if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
        }}
      />

      {rawImageToCrop && (
        <ImageCropper
          imageSrc={rawImageToCrop}
          open={cropModalOpen}
          onOpenChange={handleCropCancel}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          cropVariant={cropVariant}
          locale={locale}
          labels={{
            title: labels.cropTitle,
            preparing: labels.preparing,
            confirm: labels.confirm,
            cancel: labels.cancel,
            presetOriginal: labels.presetOriginal,
          }}
        />
      )}

      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        onConfirm={handleConfirmRemove}
        isPending={false}
        labels={{
          title: labels.removeConfirmTitle,
          description: '',
          cancel: labels.cancel,
          confirmButton: labels.remove,
        }}
      />
    </div>
  );
}
