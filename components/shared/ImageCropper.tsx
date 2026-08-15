'use client';

import { Loader2 } from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';
import type { Area, MediaSize } from 'react-easy-crop';
import Cropper from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import getCroppedImg from '@/lib/cropImage';
import { cn, toLocaleDigits } from '@/lib/utils';

export type CropVariant = 'cover' | 'square';

interface CropPreset {
  label: string;
  ratio: number | 'original';
}

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (file: File) => void;
  aspectRatio: number;
  cropVariant?: CropVariant;
  locale: string;
  labels: {
    title: string;
    preparing: string;
    confirm: string;
    cancel: string;
    presetOriginal: string;
  };
}

export default function ImageCropper({
  imageSrc,
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio,
  cropVariant,
  locale,
  labels,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeAspect, setActiveAspect] = useState(aspectRatio);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const presets = useMemo<CropPreset[] | null>(() => {
    if (!cropVariant) return null;

    const formatRatio = (a: number, b: number) =>
      toLocaleDigits(`${a}:${b}`, locale);

    if (cropVariant === 'square') {
      return [{ label: formatRatio(1, 1), ratio: 1 }];
    }

    if (naturalRatio === null) return null;

    const inRange = naturalRatio >= 2 / 4 && naturalRatio <= 4 / 5;
    if (!inRange) return [{ label: labels.presetOriginal, ratio: 'original' }];

    return [
      { label: labels.presetOriginal, ratio: 'original' },
      { label: formatRatio(4, 5), ratio: 4 / 5 },
      { label: formatRatio(3, 4), ratio: 3 / 4 },
      { label: formatRatio(2, 3), ratio: 2 / 3 },
      { label: formatRatio(9, 16), ratio: 9 / 16 },
    ];
  }, [cropVariant, naturalRatio, labels, locale]);

  const handleContentAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;

      if (event.currentTarget.dataset.state === 'open') {
        setIsReady(true);
      } else {
        setIsReady(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setActiveAspect(aspectRatio);
        setNaturalRatio(null);
      }
    },
    [aspectRatio],
  );

  const handleMediaLoaded = useCallback((mediaSize: MediaSize) => {
    setNaturalRatio(mediaSize.naturalWidth / mediaSize.naturalHeight);
  }, []);

  const resolveRatio = useCallback(
    (preset: CropPreset) =>
      preset.ratio === 'original'
        ? (naturalRatio ?? aspectRatio)
        : preset.ratio,
    [naturalRatio, aspectRatio],
  );

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-hidden px-0"
        onAnimationEnd={handleContentAnimationEnd}
      >
        <ScrollArea
          className="px-3"
          viewportProps={{ className: 'h-auto! max-h-[80vh]' }}
        >
          <DialogHeader className="px-3">
            <DialogTitle>{labels.title}</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-75 sm:h-100 bg-muted flex items-center justify-center rounded-md overflow-hidden mt-4 px-3">
            {isReady ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={activeAspect}
                cropShape={cropVariant === 'square' ? 'round' : 'rect'}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteHandler}
                onZoomChange={onZoomChange}
                onMediaLoaded={handleMediaLoaded}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm font-medium animate-pulse">
                  {labels.preparing}
                </span>
              </div>
            )}
          </div>

          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 px-3">
              {presets.map(preset => {
                const ratio = resolveRatio(preset);
                const isActive = Math.abs(ratio - activeAspect) < 0.001;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setActiveAspect(ratio)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/60 text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

          <DialogFooter className="mt-2 gap-2 bg-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCropping}
              className="cursor-pointer"
            >
              {labels.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isCropping || !isReady}
              className="cursor-pointer"
            >
              {isCropping ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                labels.confirm
              )}
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
