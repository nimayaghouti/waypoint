'use client';

import { memo, useEffect } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';

export function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export const AddPinListener = memo(function AddPinListener({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvent('click', e => {
    if (!active) return;
    onPick(e.latlng.lat, e.latlng.lng);
  });
  return null;
});

export function MinZoomHandler() {
  const map = useMap();

  useEffect(() => {
    const updateMinZoom = () => {
      const mapSize = map.getSize();
      const minZoom = Math.max(
        Math.ceil(Math.log2(mapSize.x / 256)),
        Math.ceil(Math.log2(mapSize.y / 256)),
      );

      map.setMinZoom(minZoom);
    };

    updateMinZoom();

    map.on('resize', updateMinZoom);

    return () => {
      map.off('resize', updateMinZoom);
    };
  }, [map]);

  return null;
}
