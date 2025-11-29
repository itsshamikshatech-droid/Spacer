
'use client';
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wifi, Wind, Tv, UtensilsCrossed, Users, Star, MapPin, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Space } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CurrencyDisplay } from "@/components/ui/currency-display";

const facilityIcons = {
  wifi: Wifi,
  ac: Wind,
  projector: Tv,
  catering: UtensilsCrossed,
};

export default function BuyerSpaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const firestore = useFirestore();

    const spaceDocRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'spaces', id as string);
    }, [firestore, id]);

    const { data: space, isLoading } = useDoc<Space>(spaceDocRef);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Skeleton className="h-64 md:h-96 w-full" />
                <div className="container mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-8 w-1/4" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton className="h-72 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!space) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <p className="text-2xl mb-4">Space not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const { photoUrls = [] } = space;

    return (
        <div className="min-h-screen bg-background text-foreground">
             <div className="absolute top-4 left-4 z-20">
                <Button variant="outline" onClick={() => router.back()} className="bg-black/50 text-white hover:bg-white/10 border-white/20">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Search
                </Button>
            </div>
            <div className="relative w-full">
                <Carousel className="w-full">
                    <CarouselContent>
                        {photoUrls.length > 0 ? photoUrls.map((url, index) => (
                            <CarouselItem key={index} className="relative h-64 md:h-96 w-full">
                                <Image
                                    src={url}
                                    alt={`${space.name} photo ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </CarouselItem>
                        )) : (
                             <CarouselItem className="relative h-64 md:h-96 w-full">
                                <Skeleton className="w-full h-full bg-white/10" />
                                <div className="absolute inset-0 bg-black/40" />
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    {photoUrls.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/80 border-white/30" />
                            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/80 border-white/30" />
                        </>
                    )}
                </Carousel>
                
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 text-white z-10">
                    {space.purpose && <Badge variant="secondary" className="mb-2">{space.purpose}</Badge>}
                    <h1 className="text-3xl md:text-5xl font-bold font-headline">{space.name}</h1>
                    <div className="flex items-center text-lg mt-2">
                        <MapPin className="h-5 w-5 mr-2" />
                        {space.location}
                    </div>
                </div>
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full">
                    <Star className="h-6 w-6" />
                </Button>
            </div>
            
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">About this space</h2>
                            <p className="text-muted-foreground text-lg">
                                {space.description || "No description provided."}
                            </p>
                        </div>
                        {space.facilities && space.facilities.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold font-headline mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {space.facilities.map(facility => {
                                        const Icon = facilityIcons[facility as keyof typeof facilityIcons];
                                        return Icon ? (
                                            <div key={facility} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                <Icon className="h-6 w-6 text-primary" />
                                                <span className="capitalize">{facility.replace(/_/g, ' ')}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                         <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Reviews</h2>
                            <div className="flex items-center gap-2">
                                <Star className="h-6 w-6 text-yellow-500 fill-yellow-400" />
                                <span className="text-2xl font-bold">{space.rating?.toFixed(1) || 'N/A'}</span>
                                <span className="text-muted-foreground">(No reviews yet)</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 bg-muted/20 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-2xl">
                                    <span>
                                        <span className="font-bold"><CurrencyDisplay amount={space.price} /></span>
                                        <span className="text-base font-normal text-muted-foreground">/hour</span>
                                    </span>
                                    <div className="flex items-center gap-2 text-base">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span>{space.capacity} guests</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Link href={`/dashboard/buyer/space/${id}/booking`} passHref>
                                    <Button size="lg" className="w-full text-lg">
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Book Now
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
