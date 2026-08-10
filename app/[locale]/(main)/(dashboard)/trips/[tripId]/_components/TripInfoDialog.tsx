'use client';

import { Loader2, Pencil } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';

import { updateTripInfoAction } from '@/lib/actions/trip';

interface Props {
  tripId: string;
  initialName: string;
  initialDescription: string;
  initialCoverImage: string;
  labels: Record<string, string>;
}

export default function TripInfoDialog({
  tripId,
  initialName,
  initialDescription,
  initialCoverImage,
  labels,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const handleSave = () => {
    setErrors({});
    startTransition(async () => {
      const result = await updateTripInfoAction(tripId, {
        name,
        description,
        coverImage,
      });
      if (result?.fieldErrors) {
        setErrors(result.fieldErrors as Record<string, string[]>);
      } else if (result?.error) {
        toast.error(labels.errorGeneric);
      } else {
        toast.success(labels.success);
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer bg-background/90 backdrop-blur-sm shadow-sm"
        >
          <Pencil className="size-4" />
          <span className="hidden md:inline">{labels.editButton}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.dialogTitle}</DialogTitle>
          <DialogDescription>{labels.dialogDesc}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.nameLabel}</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-xs font-bold text-destructive">
                {errors.name[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.descLabel}</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
            />
            {errors.description && (
              <p className="text-xs font-bold text-destructive">
                {errors.description[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.coverLabel}</label>
            <Input
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder={labels.coverPlaceholder}
              disabled={isPending}
              dir="ltr"
            />
            {errors.coverImage && (
              <p className="text-xs font-bold text-destructive">
                {errors.coverImage[0]}
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full cursor-pointer mt-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              labels.save
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
