import type { PlaceSearchResult } from '@/lib/actions/places';

export type PlaceItem = PlaceSearchResult & { isPreview?: boolean };

export interface DraftPin {
  id?: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
  isGeocoding: boolean;
}
