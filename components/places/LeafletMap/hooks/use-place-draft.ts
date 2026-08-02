'use client';

import type L from 'leaflet';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  addPlaceAction,
  reverseGeocodeAction,
  updatePlaceAction,
} from '@/lib/actions/places';

import type { DraftPin, PlaceItem } from '../types';

interface UsePlaceDraftArgs {
  tripId: string;
  locale: string;
  labels: Record<string, string>;
  places: PlaceItem[];
}

export function usePlaceDraft({
  tripId,
  locale,
  labels,
  places,
}: UsePlaceDraftArgs) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [draftPin, setDraftPin] = useState<DraftPin | null>(null);
  const [isPending, startTransition] = useTransition();

  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const draftMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!draftPin) return;
    const marker = draftPin.id
      ? markerRefs.current[draftPin.id]
      : draftMarkerRef.current;
    marker?.openPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftPin?.id]);

  const nameTouchedRef = useRef(false);

  const fillDraftAddress = useCallback(
    async (lat: number, lng: number) => {
      nameTouchedRef.current = false;
      const result = await reverseGeocodeAction(lat, lng, locale);
      setDraftPin(prev => {
        if (!prev || prev.lat !== lat || prev.lng !== lng) return prev;
        return {
          ...prev,
          name: nameTouchedRef.current
            ? prev.name
            : result.data?.name || prev.name || '',
          address: result.data?.address || '',
          isGeocoding: false,
        };
      });
    },
    [locale],
  );

  const handlePickOnMap = useCallback(
    (lat: number, lng: number) => {
      setIsAddMode(false);
      setDraftPin({ lat, lng, name: '', address: '', isGeocoding: true });
      fillDraftAddress(lat, lng);
    },
    [fillDraftAddress],
  );

  const handleMarkerDragEnd = useCallback(
    (place: PlaceItem) => (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      setDraftPin({
        id: place.id,
        lat,
        lng,
        name: place.name,
        address: place.address ?? '',
        isGeocoding: true,
      });
      fillDraftAddress(lat, lng);
    },
    [fillDraftAddress],
  );

  const handleDraftMarkerDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      setDraftPin(prev =>
        prev ? { ...prev, lat, lng, isGeocoding: true } : prev,
      );
      fillDraftAddress(lat, lng);
    },
    [fillDraftAddress],
  );

  const handleNameChange = useCallback((name: string) => {
    nameTouchedRef.current = true;
    setDraftPin(prev => (prev ? { ...prev, name } : prev));
  }, []);

  const handleCancelDraft = useCallback(() => {
    if (draftPin?.id) {
      const original = places.find(p => p.id === draftPin.id);
      const ref = markerRefs.current[draftPin.id];
      if (original && ref) ref.setLatLng([original.lat, original.lng]);
    }
    setDraftPin(null);
  }, [draftPin, places]);

  const handleSaveDraft = useCallback(() => {
    if (!draftPin || !draftPin.name.trim()) return;
    const payload = {
      name: draftPin.name.trim(),
      address: draftPin.address || null,
      lat: draftPin.lat,
      lng: draftPin.lng,
    };
    startTransition(async () => {
      const result = draftPin.id
        ? await updatePlaceAction(tripId, draftPin.id, payload)
        : await addPlaceAction(tripId, payload);

      if (result.error) {
        toast.error(draftPin.id ? labels.updateError : labels.saveError);
      } else {
        toast.success(draftPin.id ? labels.updateSuccess : labels.saveSuccess);
        setDraftPin(null);
      }
    });
  }, [draftPin, tripId, labels]);

  return {
    isAddMode,
    setIsAddMode,
    draftPin,
    isPending,
    markerRefs,
    draftMarkerRef,
    handlePickOnMap,
    handleMarkerDragEnd,
    handleDraftMarkerDragEnd,
    handleNameChange,
    handleCancelDraft,
    handleSaveDraft,
  };
}
