'use client';

import { MapPin } from 'lucide-react';

import { useState } from 'react';

import PlaceMiniCard from '@/components/places/PlaceMiniCard';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface PickablePlace {
  id: string;
  name: string;
  address?: string | null;
}

interface PlacePickerPopoverProps {
  places: PickablePlace[];
  onSelect: (place: PickablePlace) => void;
  trigger: React.ReactNode;
  labels: {
    title: string;
    searchPlaceholder: string;
    noPlaces: string;
    noResults: string;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PlacePickerPopover({
  places,
  onSelect,
  trigger,
  labels,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: PlacePickerPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleSelect = (place: PickablePlace) => {
    onSelect(place);
    handleOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="center"
        aria-label={labels.title}
        collisionPadding={16}
        className="w-80 max-w-(--radix-popover-content-available-width) p-0"
      >
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <MapPin className="size-6 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{labels.noPlaces}</p>
          </div>
        ) : (
          <Command>
            <CommandInput placeholder={labels.searchPlaceholder} />
            <CommandList className="max-h-72">
              <CommandEmpty>
                <span className="text-sm text-muted-foreground">
                  {labels.noResults}
                </span>
              </CommandEmpty>
              <CommandGroup className="[&>div]:space-y-1">
                {places.map(place => (
                  <CommandItem
                    key={place.id}
                    value={`${place.name} ${place.address ?? ''}`}
                    onSelect={() => handleSelect(place)}
                    className="cursor-pointer p-0"
                  >
                    <PlaceMiniCard
                      name={place.name}
                      address={place.address}
                      className="w-full border-0 bg-transparent rounded-sm"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
