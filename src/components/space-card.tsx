
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Wind, Star, Tv, UtensilsCrossed } from 'lucide-react';
import type { Space } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { CurrencyDisplay } from './ui/currency-display';

interface SpaceCardProps {
  space: Space;
  isBooked?: boolean;
}

const facilityIcons = {
  wifi: Wifi,
  ac: Wind,
  projector: Tv,
  catering: UtensilsCrossed,
};

export function SpaceCard({ space, isBooked }: SpaceCardProps) {
  const firstImage = space.photoUrls?.[0];
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  useEffect(() => {
    // Generate random number only on the client side after hydration
    setReviewCount(Math.floor(Math.random() * 100 + 15));
  }, []);

  return (
    <Card className="overflow-hidden transition-transform transform hover:shadow-xl w-full flex flex-col sm:flex-row animate-fade-in-up hover:-translate-y-1 bg-white/5 border-white/10 backdrop-blur-sm text-white h-full">
      {/* Image Section */}
      <div className="relative w-full sm:w-1/3 h-48 sm:h-auto flex-shrink-0">
        {firstImage ? (
            <Image
            src={firstImage}
            alt={space.name}
            fill
            className="object-cover"
            />
        ) : (
            <Skeleton className="h-full w-full bg-white/10" />
        )}
        {isBooked && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">Booked</Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="sm:w-2/3 flex flex-col">
        <CardHeader className="p-4">
            <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl font-bold font-headline leading-tight">{space.name}</CardTitle>
                {space.purpose && <Badge variant="secondary" className="whitespace-nowrap">{space.purpose}</Badge>}
            </div>
            <CardDescription className="flex items-center text-sm text-white/70 pt-1">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                {space.location}
            </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-grow space-y-4">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Up to {space.capacity} Guests</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                <span className="font-semibold text-white">{space.rating?.toFixed(1)}</span>
                {reviewCount !== null ? (
                  <span className="text-xs text-white/70">({reviewCount} reviews)</span>
                ) : <Skeleton className='h-4 w-12 ml-1 bg-white/20' />}
            </div>
          </div>
          
          {space.aiMatch &&
            <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">AI Match</label>
                <div className="flex items-center gap-2">
                    <Progress value={space.aiMatch} className="h-2" />
                    <span className="text-sm font-semibold text-primary">{space.aiMatch}%</span>
                </div>
            </div>
          }

          {space.facilities && space.facilities.length > 0 &&
            <div className="flex items-center gap-4 text-sm text-white/70 pt-1">
                {space.facilities.slice(0, 4).map((facility) => {
                const Icon = facilityIcons[facility as keyof typeof facilityIcons];
                return Icon ? <Icon key={facility} className="h-5 w-5 text-primary" title={facility} /> : null;
                })}
                {space.facilities.length > 4 && (
                    <span className="text-xs font-semibold">+{space.facilities.length - 4} more</span>
                )}
            </div>
          }
        </CardContent>

        <CardFooter className="p-4 bg-white/5 flex items-center justify-between mt-auto">
          <div>
            <p className="text-xl font-bold text-primary">
              <CurrencyDisplay amount={space.price} />
              <span className="text-sm font-normal text-white/70">/hour</span>
            </p>
          </div>
          <Button>View Details</Button>
        </CardFooter>
      </div>
    </Card>
  );
}
