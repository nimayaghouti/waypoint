'use client';

import { MapPinPlus } from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';

import { Button } from '@/components/ui/button';

import { AddPinListener, MapController, MinZoomHandler } from './MapEvents';
import { PinForm } from './PinForm';

import { usePlaceDraft } from '../hooks/use-place-draft';

import type { PlaceItem } from '../types';

import { customIcon, draftIcon } from '../icons';

export default function Map({
  places,
  activeLocation,
  tripId,
  locale,
  canEdit,
  labels,
}: {
  places: PlaceItem[];
  activeLocation: [number, number] | null;
  tripId: string;
  locale: string;
  canEdit: boolean;
  labels: Record<string, string>;
}) {
  const center =
    activeLocation ||
    (places.length > 0 ? [places[0].lat, places[0].lng] : [51.505, -0.09]);

  const {
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
  } = usePlaceDraft({ tripId, locale, labels, places });

  return (
    <div className="relative w-full h-full">
      {canEdit && (
        <Button
          type="button"
          size="sm"
          variant={isAddMode ? 'default' : 'secondary'}
          className="absolute top-3 inset-e-3 z-10 cursor-pointer shadow-md"
          disabled={!!draftPin}
          onClick={() => setIsAddMode(v => !v)}
        >
          <MapPinPlus className="size-4" />
          {isAddMode ? labels.addPinModeActive : labels.addPin}
        </Button>
      )}

      <MapContainer
        center={center as [number, number]}
        zoom={13}
        zoomControl={false}
        maxBounds={[
          [-85.051129, -180],
          [85.051129, 180],
        ]}
        maxBoundsViscosity={1.0}
        className={`
          w-full h-full z-0 rounded-xl
          font-sans!
          ${isAddMode ? 'cursor-crosshair' : ''}
          dark:[&_.leaflet-tile-pane]:invert!
          dark:[&_.leaflet-tile-pane]:hue-rotate-180!
          dark:[&_.leaflet-tile-pane]:brightness-[0.85]!
          dark:[&_.leaflet-tile-pane]:contrast-[1.2]!
          dark:[&_.leaflet-tile-pane]:saturate-[0.6]!
          [&_.leaflet-popup-content-wrapper]:bg-card!
          [&_.leaflet-popup-content-wrapper]:text-card-foreground!
          [&_.leaflet-popup-tip]:bg-card!
          [&_.leaflet-popup-content]:m-3!
          [&_.leaflet-control-zoom_a]:bg-card!
          [&_.leaflet-control-zoom_a]:text-card-foreground!
          [&_.leaflet-control-zoom_a]:border-border!
          [&_.leaflet-control-zoom_a:hover]:bg-accent!
          [&_.leaflet-control-zoom_a:hover]:text-accent-foreground!
        `}
      >
        <ZoomControl position={locale === 'fa' ? 'topright' : 'topleft'} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MinZoomHandler />
        {activeLocation && <MapController center={activeLocation} />}
        <AddPinListener active={isAddMode} onPick={handlePickOnMap} />

        {places.map(place => {
          const isEditingThis = draftPin?.id === place.id;
          const position: [number, number] = isEditingThis
            ? [draftPin.lat, draftPin.lng]
            : [place.lat, place.lng];

          return (
            <Marker
              key={place.id}
              position={position}
              icon={isEditingThis ? draftIcon : customIcon}
              draggable={canEdit && (isEditingThis || !draftPin)}
              ref={el => {
                markerRefs.current[place.id] = el;
              }}
              eventHandlers={
                canEdit ? { dragend: handleMarkerDragEnd(place) } : undefined
              }
            >
              <Popup
                closeButton={!isEditingThis}
                closeOnClick={!isEditingThis}
                autoClose={false}
              >
                {isEditingThis ? (
                  <PinForm
                    draft={draftPin}
                    labels={labels}
                    isSaving={isPending}
                    onNameChange={handleNameChange}
                    onSave={handleSaveDraft}
                    onCancel={handleCancelDraft}
                  />
                ) : (
                  <div className="p-3 max-w-62.5">
                    <strong className="font-sans text-sm block mb-1.5 leading-tight">
                      {place.name}
                    </strong>
                    <p
                      className="text-[13px] text-muted-foreground font-sans leading-relaxed"
                      dir="auto"
                    >
                      {place.address}
                    </p>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {draftPin && !draftPin.id && (
          <Marker
            position={[draftPin.lat, draftPin.lng]}
            icon={draftIcon}
            draggable
            ref={draftMarkerRef}
            eventHandlers={{ dragend: handleDraftMarkerDragEnd }}
          >
            <Popup closeButton={false} closeOnClick={false} autoClose={false}>
              <PinForm
                draft={draftPin}
                labels={labels}
                isSaving={isPending}
                onNameChange={handleNameChange}
                onSave={handleSaveDraft}
                onCancel={handleCancelDraft}
              />
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
