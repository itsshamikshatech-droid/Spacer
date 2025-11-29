
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Booking, Space } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Home, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import BuyerLayout from '@/components/layouts/BuyerLayout';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
        case 'pending':
        return <Clock className="h-6 w-6 text-yellow-400" />;
        case 'declined':
        return <XCircle className="h-6 w-6 text-red-400" />;
        default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
};

export default function BookingBillPage() {
    const params = useParams();
    const router = useRouter();
    const { id: bookingId } = params;
    const firestore = useFirestore();

    const bookingDocRef = useMemoFirebase(() => {
        if (!firestore || !bookingId) return null;
        return doc(firestore, 'bookings', bookingId as string);
    }, [firestore, bookingId]);

    const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingDocRef);

    const spaceDocRef = useMemoFirebase(() => {
        if (!firestore || !booking?.spaceId) return null;
        return doc(firestore, 'spaces', booking.spaceId);
    }, [firestore, booking?.spaceId]);

    const { data: space, isLoading: isSpaceLoading } = useDoc<Space>(spaceDocRef);

    const isLoading = isBookingLoading || !booking || isSpaceLoading;

    const renderLoading = () => (
        <BuyerLayout title="Loading Invoice...">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <Skeleton className="h-10 w-48 mb-8" />
                <Card className="bg-white/5 border-white/10 p-6">
                    <CardHeader><Skeleton className="h-8 w-1/2 mb-4" /></CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-48 w-full mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="border-t border-white/10 my-4"></div>
                         <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-6 w-1/2 ml-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </BuyerLayout>
    );
    
    if (isLoading) {
        return renderLoading();
    }
    
    if (!booking || !space) {
        return (
             <BuyerLayout title="Error">
                <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground">
                    <p className="text-2xl mb-4">Booking details not found.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </BuyerLayout>
        )
    }
    
    const placeholderImage = space.photoUrls?.[0];
    const hours = (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60);
    const subtotal = (space.price || 0) * hours;
    const serviceFee = booking.totalPrice - subtotal;
    
    return (
        <BuyerLayout title="Booking Invoice">
            <div className="max-w-2xl w-full mx-auto p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.back()} className="bg-transparent hover:bg-white/10 border-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Bookings
                    </Button>
                </div>

                <Card className="bg-white/5 border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/10 animate-fade-in-up">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold font-headline">Invoice</CardTitle>
                                <p className="text-muted-foreground text-sm">Booking ID: {booking.id}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize text-lg">
                                    <StatusIcon status={booking.status}/>
                                    <span className="ml-2">{booking.status}</span>
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-2">Booked on {new Date(booking.createdAt.toDate()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {placeholderImage && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-white/10">
                                <Image 
                                    src={placeholderImage}
                                    alt={space.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 text-base">
                            <div className="flex items-center gap-3">
                                <Home className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Space:</span> {booking.spaceName}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Date:</span> {new Date(booking.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 col-span-2">
                                <Clock className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Time:</span> {new Date(booking.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({hours.toFixed(1)} hrs)</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">Bill Details</h3>
                            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Rate</p>
                                    <p><CurrencyDisplay amount={space.price} />/hr</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Subtotal ({hours.toFixed(1)} hours)</p>
                                    <p><CurrencyDisplay amount={subtotal} /></p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Platform & Service Fee</p>
                                    <p><CurrencyDisplay amount={serviceFee} /></p>
                                </div>
                                <div className="border-t border-white/20 my-2"></div>
                                <div className="flex justify-between items-center font-bold text-xl pt-2">
                                    <p>Grand Total</p>
                                    <p className="text-primary"><CurrencyDisplay amount={booking.totalPrice} /></p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </BuyerLayout>
    )
}
