'use client';

import {
  Compass,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { useFormatter } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import LeafletMap from '@/components/places/LeafletMap';
import type { PlaceItem } from '@/components/places/LeafletMap/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useDebounce } from '@/hooks';

import type { NearbyPOI } from '@/lib/actions/places';
import {
  addPlaceAction,
  deletePlaceAction,
  enrichPlaceDescriptionAction,
  exploreNearbyAction,
  PlaceSearchResult,
  searchPlacesNominatimAction,
} from '@/lib/actions/places';
interface ExploredPOI extends NearbyPOI {
  distance: number;
}

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

  const [rawExploreCenter, setExploreCenter] = useState<
    [number, number] | null
  >(null);
  const [hoveredLocation, setHoveredLocation] = useState<
    [number, number] | null
  >(null);

  const exploreCenter = useMemo(() => {
    if (!rawExploreCenter) return null;

    const stillExists = savedPlaces.some(
      p => p.lat === rawExploreCenter[0] && p.lng === rawExploreCenter[1],
    );

    return stillExists ? rawExploreCenter : null;
  }, [rawExploreCenter, savedPlaces]);

  const activeLocation = hoveredLocation ?? exploreCenter;

  const [activeTab, setActiveTab] = useState<'saved' | 'explore'>('saved');
  const [exploredForLocation, setExploredForLocation] = useState<
    [number, number] | null
  >(null);

  const [exploredPlaces, setExploredPlaces] = useState<ExploredPOI[]>([]);
  const [isExploring, setIsExploring] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [pendingEnrichId, setPendingEnrichId] = useState<string | null>(null);

  const [, startTransition] = useTransition();
  const debouncedQuery = useDebounce(searchQuery, 800);
  const format = useFormatter();

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

  const handleExploreArea = () => {
    if (!exploreCenter) return;
    const target = exploreCenter;
    setIsExploring(true);
    startTransition(async () => {
      const result = await exploreNearbyAction(target[0], target[1], locale);
      if (result.success && result.data) {
        setExploredPlaces(result.data);
        setExploredForLocation(target);
      }
      setIsExploring(false);
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'saved' | 'explore');
    setHoveredLocation(null);
  };

  const handleEnrichPlace = (placeId: string) => {
    if (!canEdit || pendingEnrichId === placeId) return;
    setPendingEnrichId(placeId);
    startTransition(async () => {
      try {
        const result = await enrichPlaceDescriptionAction(
          tripId,
          placeId,
          locale,
        );
        if (result.error) toast.error(labels.enrichError);
        else toast.success(labels.enrichSuccess);
      } finally {
        setPendingEnrichId(null);
      }
    });
  };

  const isSearchMode = searchQuery.length >= 3;
  const exploreResultsAreCurrent =
    !!exploreCenter &&
    !!exploredForLocation &&
    exploredForLocation[0] === exploreCenter[0] &&
    exploredForLocation[1] === exploreCenter[1];

  const mapDisplayPlaces: PlaceItem[] = [
    ...savedPlaces,
    ...(activeTab === 'explore' && exploreResultsAreCurrent
      ? exploredPlaces.map(poi => ({ ...poi, isPreview: true }))
      : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[75vh] lg:min-h-150">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-150 lg:h-full">
        <div className="relative">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={labels.searchPlaceholder}
            className="ps-9"
          />
        </div>

        {isSearchMode ? (
          <ScrollArea className="flex-1 min-h-0 bg-muted/10 border border-border/50 rounded-xl">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 pt-4 ps-4">
              {isSearching ? labels.searching : labels.searchResults}
            </h3>
            <div className="flex flex-col gap-3 p-4">
              {searchResults.map(res => (
                <Card
                  key={res.id}
                  className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                  onMouseEnter={() => setHoveredLocation([res.lat, res.lng])}
                  onMouseLeave={() => setHoveredLocation(null)}
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
          </ScrollArea>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="w-full grid grid-cols-2 gap-1 mb-2">
              <TabsTrigger
                value="saved"
                className="cursor-pointer data-[state=inactive]:hover:bg-foreground/10 data-[state=active]:bg-background!"
              >
                {labels.tabSaved}
              </TabsTrigger>

              <TabsTrigger
                value="explore"
                className="cursor-pointer data-[state=inactive]:hover:bg-foreground/10 data-[state=active]:bg-background!"
              >
                {labels.tabExplore}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="flex-1 min-h-0 mt-0">
              <ScrollArea className="h-full bg-muted/10 border border-border/50 rounded-xl">
                {savedPlaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
                    <MapPin className="size-8 mb-2" />
                    <p className="text-sm">{labels.noPlaces}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-4">
                    {savedPlaces.map(place => (
                      <Card
                        key={place.id}
                        className="p-3 group cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setExploreCenter([place.lat, place.lng])}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-2">
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

                          {!place.description ? (
                            canEdit && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 shrink-0 ms-auto cursor-pointer text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                title={
                                  pendingEnrichId === place.id
                                    ? labels.enriching
                                    : labels.enrichPlace
                                }
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEnrichPlace(place.id);
                                }}
                                disabled={pendingEnrichId !== null}
                              >
                                {pendingEnrichId === place.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Sparkles className="size-4" />
                                )}
                              </Button>
                            )
                          ) : (
                            <div className="bg-muted/30 p-2 rounded-md border border-border/50">
                              <p
                                className="text-xs leading-relaxed text-muted-foreground"
                                dir="auto"
                              >
                                {place.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="explore"
              className="flex-1 min-h-0 mt-0 flex flex-col gap-3"
            >
              {!exploreCenter ? (
                <div className="flex-1 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                  <Compass className="size-10 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {labels.explorePrompt}
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleExploreArea}
                    disabled={isExploring}
                    className="w-full cursor-pointer shadow-sm"
                  >
                    {isExploring ? (
                      <Loader2 className="size-4 animate-spin me-2" />
                    ) : (
                      <Compass className="size-4 me-2" />
                    )}
                    {isExploring ? labels.exploring : labels.exploreButton}
                  </Button>
                  <ScrollArea className="flex-1 min-h-0 bg-muted/10 border border-border/50 rounded-xl">
                    {!isExploring && !exploreResultsAreCurrent && (
                      <p className="text-sm text-center text-muted-foreground mt-4 px-4">
                        {labels.exploreStalePrompt}
                      </p>
                    )}
                    {!isExploring &&
                      exploreResultsAreCurrent &&
                      exploredPlaces.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground mt-4">
                          {labels.noPoisFound}
                        </p>
                      )}
                    {exploreResultsAreCurrent && exploredPlaces.length > 0 && (
                      <div className="flex flex-col gap-3 p-4">
                        {exploredPlaces.map(poi => (
                          <Card
                            key={poi.id}
                            className="p-3 cursor-pointer border-dashed hover:border-primary/50 transition-colors"
                            onMouseEnter={() =>
                              setHoveredLocation([poi.lat, poi.lng])
                            }
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">
                                  {poi.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm shrink-0">
                                    {poi.category}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {poi.distance >= 1000
                                      ? format.number(poi.distance / 1000, {
                                          style: 'unit',
                                          unit: 'kilometer',
                                          unitDisplay: 'short',
                                          maximumFractionDigits: 1,
                                        })
                                      : format.number(poi.distance, {
                                          style: 'unit',
                                          unit: 'meter',
                                          unitDisplay: 'short',
                                        })}
                                  </span>
                                </div>
                              </div>
                              {canEdit && (
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="size-7 shrink-0 cursor-pointer"
                                  onClick={() => handleAddPlace(poi)}
                                  disabled={pendingAddId !== null}
                                >
                                  {pendingAddId === poi.id ? (
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
                    )}
                  </ScrollArea>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className="w-full lg:w-2/3 aspect-square sm:aspect-4/2 lg:aspect-auto lg:h-full border border-border/50 rounded-xl overflow-hidden shadow-sm relative">
        <LeafletMap
          places={mapDisplayPlaces}
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
