'use client';

import { Loader2, MapPin, Plus, Search, Trash2 } from 'lucide-react';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import LeafletMap from '@/components/places/LeafletMap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useDebounce } from '@/hooks';

import {
  addPlaceAction,
  deletePlaceAction,
  PlaceSearchResult,
  searchPlacesNominatimAction,
} from '@/lib/actions/places';

interface Props {
  tripId: string;
  savedPlaces: PlaceSearchResult[];
  locale: string;
  labels: Record<string, string>;
  canEdit: boolean;
}

export default function PlacesManager({
  tripId,
  savedPlaces,
  locale,
  labels,
  canEdit,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [activeLocation, setActiveLocation] = useState<[number, number] | null>(
    null,
  );

  const [isSearching, setIsSearching] = useState(false);
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const debouncedQuery = useDebounce(searchQuery, 800);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery.trim().length < 3) return;

    let isMounted = true;

    const fetchPlaces = async () => {
      setIsSearching(true);
      const result = await searchPlacesNominatimAction(debouncedQuery, locale);

      if (isMounted && result.success) {
        setSearchResults(result.data || []);
        setIsSearching(false);
      }
    };

    fetchPlaces();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, locale]);

  const handleAddPlace = (place: PlaceSearchResult) => {
    if (!canEdit || pendingAddId === place.id) return;
    setPendingAddId(place.id);
    startTransition(async () => {
      try {
        const payload = {
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
        };
        const result = await addPlaceAction(tripId, payload);
        if (result.error === 'DUPLICATE') toast.error(labels.duplicateError);
        else if (result.error) toast.error(labels.saveError);
        else {
          toast.success(labels.saveSuccess);
          setSearchQuery('');
          setSearchResults([]);
        }
      } finally {
        setPendingAddId(null);
      }
    });
  };

  const handleDeletePlace = (placeId: string) => {
    if (pendingDeleteId === placeId) return;
    setPendingDeleteId(placeId);
    startTransition(async () => {
      try {
        const result = await deletePlaceAction(tripId, placeId);
        if (result.error) toast.error(labels.deleteError);
        else toast.success(labels.deleteSuccess);
      } finally {
        setPendingDeleteId(null);
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[75vh] lg:min-h-150">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
        <div className="relative">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={labels.searchPlaceholder}
            className="ps-9"
          />
        </div>

        <ScrollArea className="flex-1 bg-muted/10 border border-border/50 rounded-xl">
          {searchQuery.length >= 3 ? (
            <div className="flex flex-col gap-3 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {isSearching ? labels.searching : labels.searchResults}
              </h3>
              {searchResults.map(res => (
                <Card
                  key={res.id}
                  className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                  onMouseEnter={() => setActiveLocation([res.lat, res.lng])}
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {res.name}
                      </h4>
                      <p
                        className="text-xs text-muted-foreground line-clamp-2 mt-1"
                        dir="auto"
                      >
                        {res.address}
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-7 shrink-0 cursor-pointer"
                        onClick={() => handleAddPlace(res)}
                        disabled={pendingAddId !== null}
                      >
                        {pendingAddId === res.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {labels.savedPlaces}
              </h3>
              {savedPlaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
                  <MapPin className="size-8 mb-2" />
                  <p className="text-sm">{labels.noPlaces}</p>
                </div>
              ) : (
                savedPlaces.map(place => (
                  <Card
                    key={place.id}
                    className="p-3 group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveLocation([place.lat, place.lng])}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {place.name}
                        </h4>
                        <p
                          className="text-xs text-muted-foreground line-clamp-2 mt-1"
                          dir="auto"
                        >
                          {place.address}
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:disabled:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeletePlace(place.id);
                          }}
                          disabled={pendingDeleteId !== null}
                        >
                          {pendingDeleteId === place.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="w-full lg:w-2/3 aspect-square sm:aspect-4/2 lg:aspect-auto lg:h-full border border-border/50 rounded-xl overflow-hidden shadow-sm relative">
        <LeafletMap
          places={savedPlaces}
          activeLocation={activeLocation}
          tripId={tripId}
          locale={locale}
          canEdit={canEdit}
          labels={labels}
        />
      </div>
    </div>
  );
}
