'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';
import { addPlaceSchema } from '@/lib/validations/places';

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
}

interface NominatimResponse {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
}

let lastNominatimRequestTime = 0;
const NOMINATIM_DELAY_MS = 1000;

const PLACES_PATH = '/[locale]/(main)/(dashboard)/trips/[tripId]/places';

async function applyRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequestTime;

  if (timeSinceLastRequest < NOMINATIM_DELAY_MS) {
    const waitTime = NOMINATIM_DELAY_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastNominatimRequestTime = Date.now();
}

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
  url.searchParams.set('limit', '5');
  url.searchParams.set('accept-language', locale);

  try {
    await applyRateLimit();

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

    await prisma.place.create({
      data: { tripId, ...parsed.data, createdById: session.user.id },
    });

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
    await applyRateLimit();

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

    revalidatePath(PLACES_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update place' };
  }
}
