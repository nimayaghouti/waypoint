import { Compass } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TripCardProps {
  trip: {
    id: string;
    name: string;
    description: string | null;
    status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'ARCHIVED';
    coverImage: string | null;
  };
  statusLabel: string;
  roleLabel: string;
}

export default function TripCard({
  trip,
  statusLabel,
  roleLabel,
}: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="relative h-full min-h-52 overflow-hidden hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_208px]">
        <div className="absolute inset-0">
          {trip.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.coverImage}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
              <Compass className="size-16 text-white/20" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/10" />
        </div>

        <CardHeader className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <Badge
              variant={trip.status === 'PLANNING' ? 'secondary' : 'default'}
              className="shadow-sm"
            >
              {statusLabel}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-normal bg-black/30 border-white/30 text-white"
            >
              {roleLabel}
            </Badge>
          </div>

          <div>
            <CardTitle className="text-xl text-white line-clamp-1">
              {trip.name}
            </CardTitle>
            {trip.description && (
              <CardDescription className="line-clamp-2 mt-2 text-white/85">
                {trip.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
