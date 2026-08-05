'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

import { generateEmbedding } from '@/lib/ai/embed';
import { generatePlaceDescription } from '@/lib/ai/enrich-place';
import { fetchNearbyPOIs } from '@/lib/geo/overpass';
import prisma from '@/lib/prisma';
import { createRateLimiter } from '@/lib/ratelimit/external-api';
import { addPlaceSchema } from '@/lib/validations/places';

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  description?: string | null;
}

interface NominatimResponse {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface SemanticSearchResult {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  description: string | null;
  similarity: number;
}

const PLACES_PATH = '/[locale]/(main)/(dashboard)/trips/[tripId]/places';

const applyNominatimRateLimit = createRateLimiter(1000);

export async function searchPlacesNominatimAction(
  query: string,
  locale: string,
): Promise<{ success?: boolean; data?: PlaceSearchResult[]; error?: string }> {
  const normalizedQuery = query?.trim().replace(/\s+/g, ' ');

  if (!normalizedQuery || normalizedQuery.length < 3) return { data: [] };

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', normalizedQuery);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '10');
  url.searchParams.set('accept-language', locale);

  try {
    await applyNominatimRateLimit();

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Waypoint/1.0 (+https://way-point.ir)',
      },
      next: { revalidate: 604800 },
    });

    if (!res.ok) throw new Error('Nominatim API error');

    const data = (await res.json()) as NominatimResponse[];

    const results: PlaceSearchResult[] = data.map(item => ({
      id: item.place_id.toString(),
      name: item.name || item.display_name.split(',')[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    return { success: true, data: results };
  } catch (error) {
    console.error('Nominatim Search Error:', error);
    return { error: 'Failed to search places' };
  }
}

export async function addPlaceAction(
  tripId: string,
  placeData: Omit<PlaceSearchResult, 'id'>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const parsed = addPlaceSchema.safeParse(placeData);
    if (!parsed.success) return { error: 'Invalid place data' };

    const DUPLICATE_RADIUS_DEG = 0.0005;
    const duplicate = await prisma.place.findFirst({
      where: {
        tripId,
        name: { equals: parsed.data.name, mode: 'insensitive' },
        lat: {
          gte: parsed.data.lat - DUPLICATE_RADIUS_DEG,
          lte: parsed.data.lat + DUPLICATE_RADIUS_DEG,
        },
        lng: {
          gte: parsed.data.lng - DUPLICATE_RADIUS_DEG,
          lte: parsed.data.lng + DUPLICATE_RADIUS_DEG,
        },
      },
      select: { id: true },
    });
    if (duplicate) return { error: 'DUPLICATE' };

    const newPlace = await prisma.place.create({
      data: { tripId, ...parsed.data, createdById: session.user.id },
    });

    const textToEmbed = `${parsed.data.name}. ${parsed.data.address || ''}`;
    generateEmbedding(textToEmbed)
      .then(async embedding => {
        if (embedding) {
          const vectorStr = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "Place" SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            newPlace.id,
          );
        }
      })
      .catch(console.error);

    revalidatePath(PLACES_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to save place' };
  }
}

export async function deletePlaceAction(tripId: string, placeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const { count } = await prisma.place.deleteMany({
      where: { id: placeId, tripId },
    });
    if (count === 0) return { error: 'Not found' };

    revalidatePath(PLACES_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete place' };
  }
}

export async function reverseGeocodeAction(
  lat: number,
  lng: number,
  locale: string,
): Promise<{
  success?: boolean;
  data?: { name: string; address: string };
  error?: string;
}> {
  try {
    await applyNominatimRateLimit();

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', '18');
    url.searchParams.set('accept-language', locale);

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Waypoint/1.0 (+https://way-point.ir)' },
      next: { revalidate: 604800 },
    });
    if (!res.ok) throw new Error('Nominatim reverse error');

    const item = await res.json();
    if (item.error) return { error: 'No address found for this location' };

    const address = item.address ?? {};
    const name =
      address.amenity ||
      address.shop ||
      address.tourism ||
      address.road ||
      item.display_name?.split(',')[0] ||
      '';

    return { success: true, data: { name, address: item.display_name ?? '' } };
  } catch (error) {
    console.error('Nominatim Reverse Geocode Error:', error);
    return { error: 'Failed to fetch address' };
  }
}

export async function updatePlaceAction(
  tripId: string,
  placeId: string,
  placeData: Omit<PlaceSearchResult, 'id'>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const parsed = addPlaceSchema.safeParse(placeData);
    if (!parsed.success) return { error: 'Invalid place data' };

    const { count } = await prisma.place.updateMany({
      where: { id: placeId, tripId },
      data: parsed.data,
    });
    if (count === 0) return { error: 'Not found' };

    const textToEmbed = `${parsed.data.name}. ${parsed.data.address || ''}`;
    generateEmbedding(textToEmbed)
      .then(async embedding => {
        if (embedding) {
          const vectorStr = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "Place" SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            placeId,
          );
        }
      })
      .catch(console.error);

    revalidatePath(PLACES_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update place' };
  }
}

export async function exploreNearbyAction(
  lat: number,
  lng: number,
  locale: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const pois = await fetchNearbyPOIs(lat, lng, 1500, locale);

    const dataWithDistance = pois
      .map(poi => {
        const R = 6371e3;
        const lat1 = (lat * Math.PI) / 180;
        const lat2 = (poi.lat * Math.PI) / 180;
        const deltaLat = ((poi.lat - lat) * Math.PI) / 180;
        const deltaLng = ((poi.lng - lng) * Math.PI) / 180;

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = Math.round(R * c);

        return { ...poi, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    return { success: true, data: dataWithDistance };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to explore area' };
  }
}

export async function enrichPlaceDescriptionAction(
  tripId: string,
  placeId: string,
  locale: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const place = await prisma.place.findUnique({
      where: { id: placeId, tripId },
    });

    if (!place) return { error: 'Not found' };

    const description = await generatePlaceDescription(
      place.name,
      place.address,
      locale,
    );
    if (!description) return { error: 'Generation failed' };

    await prisma.place.update({
      where: { id: placeId },
      data: { description },
    });

    const textToEmbed = `${place.name}. ${place.address || ''}. ${description}`;
    generateEmbedding(textToEmbed)
      .then(async embedding => {
        if (embedding) {
          const vectorStr = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "Place" SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            placeId,
          );
        }
      })
      .catch(console.error);

    revalidatePath(PLACES_PATH, 'page');
    return { success: true, description };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to enrich place' };
  }
}

export async function semanticSearchPlacesAction(
  tripId: string,
  query: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const embedding = await generateEmbedding(query, 'RETRIEVAL_QUERY');
    if (!embedding) return { error: 'Failed to generate embedding' };

    const vectorStr = `[${embedding.join(',')}]`;

    const results = await prisma.$queryRawUnsafe<SemanticSearchResult[]>(
      `
      SELECT id, name, address, lat, lng, description,
             1 - (embedding <=> $1::vector) as similarity
      FROM "Place"
      WHERE "tripId" = $2
        AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT 5;
    `,
      vectorStr,
      tripId,
    );

    const filteredResults = results.filter(r => r.similarity > 0.4);

    return { success: true, data: filteredResults };
  } catch (error) {
    console.error('Semantic Search Error:', error);
    return { error: 'Search failed' };
  }
}

export type { NearbyPOI } from '@/lib/geo/overpass';
