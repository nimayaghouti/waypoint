import { PlaceSearchResult } from '@/lib/actions/places';
import { createRateLimiter } from '@/lib/ratelimit/external-api';

interface OverpassTags {
  name?: string;
  'name:en'?: string;
  'name:fa'?: string;
  amenity?: string;
  tourism?: string;
  historic?: string;
  [key: string]: string | undefined;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OverpassTags;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface NearbyPOI extends PlaceSearchResult {
  category: string;
}

const applyOverpassRateLimit = createRateLimiter(1500);

function buildAddress(tags: OverpassTags): string | null {
  const parts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

export async function fetchNearbyPOIs(
  lat: number,
  lng: number,
  radius: number = 1500,
  locale: string = 'en',
): Promise<NearbyPOI[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"](around:${radius},${lat},${lng});
      way["tourism"](around:${radius},${lat},${lng});
      node["historic"](around:${radius},${lat},${lng});
      way["historic"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
      way["amenity"="cafe"](around:${radius},${lat},${lng});
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      way["amenity"="restaurant"](around:${radius},${lat},${lng});
    );
    out center 30;
  `;

  // https://overpass.kumi.systems/api/interpreter
  const url = 'https://overpass-api.de/api/interpreter';

  try {
    await applyOverpassRateLimit();

    const res = await fetch(url, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Waypoint-Travel-App/1.0 (+https://way-point.ir)',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok)
      throw new Error(`Overpass API Error: ${res.status} - ${res.statusText}`);

    const data = (await res.json()) as OverpassResponse;

    return data.elements
      .filter(
        el =>
          el.tags && (el.tags.name || el.tags['name:en'] || el.tags['name:fa']),
      )
      .map(el => {
        const localName =
          locale === 'fa'
            ? el.tags?.['name:fa'] || el.tags?.name || el.tags?.['name:en']
            : el.tags?.['name:en'] || el.tags?.name;

        let category = 'Point of Interest';
        if (el.tags?.amenity) category = el.tags.amenity.replace('_', ' ');
        if (el.tags?.tourism) category = el.tags.tourism.replace('_', ' ');
        if (el.tags?.historic)
          category = 'Historic ' + el.tags.historic.replace('_', ' ');

        const elLat = el.lat ?? el.center?.lat ?? 0;
        const elLng = el.lon ?? el.center?.lon ?? 0;

        return {
          id: `osm-${el.type}-${el.id}`,
          name: localName ?? 'Unknown Place',
          address: buildAddress(el.tags ?? {}),
          category: category.charAt(0).toUpperCase() + category.slice(1),
          lat: elLat,
          lng: elLng,
        };
      })
      .filter(item => item.lat !== 0 && item.lng !== 0);
  } catch (error) {
    console.error('Overpass Ingestion Error:', error);
    return [];
  }
}
