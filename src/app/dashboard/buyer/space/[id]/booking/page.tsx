
'use client';
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useDoc, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, collection, serverTimestamp, query, where, getDocs, addDoc } from "firebase/firestore";
import type { Space } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function BuyerBookingPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const firestore = useFirestore();
    const { user } = useUser();

    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const spaceDocRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'spaces', id as string);
    }, [firestore, id]);

    const { data: space, isLoading } = useDoc<Space>(spaceDocRef);

    const getHours = () => {
        if (!startTime || !endTime) return 0;
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        if (end <= start) return 0;
        const diff = end.getTime() - start.getTime();
        return diff / (1000 * 60 * 60);
    };
    const hours = getHours();
    const subtotal = (space?.price || 0) * hours;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + serviceFee;
    
    const handleConfirmBooking = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to book a space.',
            });
            return;
        }

        if (!date || hours <= 0) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a valid date and time range to book.',
            });
            return;
        }

        if (!space) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not find space details. Please try again.',
            });
            return;
        }
        
        const bookingStart = new Date(`${date}T${startTime}:00`);
        const bookingEnd = new Date(`${date}T${endTime}:00`);

        // Overlap check
        const bookingsCollection = collection(firestore, 'bookings');
        const overlapQuery = query(
            bookingsCollection,
            where("spaceId", "==", id as string),
            where("status", "==", "confirmed")
        );

        try {
            const querySnapshot = await getDocs(overlapQuery);
            const overlappingBookings = querySnapshot.docs.filter(doc => {
                const booking = doc.data();
                const existingEndDate = new Date(booking.endDate);
                return new Date(booking.startDate) < bookingEnd && existingEndDate > bookingStart;
            });

            if (overlappingBookings.length > 0) {
                toast({
                    variant: "destructive",
                    title: "Booking Conflict",
                    description: "This time slot is no longer available. Please select another time.",
                });
                return;
            }
        } catch (error) {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'bookings',
                operation: 'list',
            }));
            return;
        }


        const bookingData = {
            spaceId: id,
            spaceName: space.name,
            sellerId: space.sellerId,
            buyerId: user.uid,
            bookingDate: new Date().toISOString(),
            startDate: bookingStart.toISOString(),
            endDate: bookingEnd.toISOString(),
            totalPrice: total,
            status: 'pending',
            createdAt: serverTimestamp(),
            activity: [{ status: 'pending', timestamp: new Date().toISOString() }]
        };

        const docRef = collection(firestore, 'bookings');
        addDoc(docRef, bookingData).then(newBookingRef => {
            const notificationsCollection = collection(firestore, 'notifications');
            
            // Notify seller
            const sellerNotification = {
                userId: space.sellerId,
                type: 'booking_request',
                title: 'New Booking Request!',
                body: `You have a new request for "${space.name}" from a buyer.`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/dashboard/seller/booking-requests`
            };
            addDoc(notificationsCollection, sellerNotification).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: notificationsCollection.path,
                    operation: 'create',
                    requestResourceData: sellerNotification
                }));
            });
            
            // Notify buyer
            const buyerNotification = {
                userId: user.uid,
                type: 'booking_sent',
                title: 'Booking Request Sent!',
                body: `Your request for "${space.name}" has been sent to the seller for approval.`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/dashboard/buyer/bookings/${newBookingRef.id}`
            };
             addDoc(notificationsCollection, buyerNotification).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: notificationsCollection.path,
                    operation: 'create',
                    requestResourceData: buyerNotification
                }));
            });
            
            toast({
                title: 'Booking Request Sent!',
                description: 'The space seller has been notified. You will get a confirmation soon.',
            });
            
            router.push(`/dashboard/buyer/bookings/${newBookingRef.id}`);

        }).catch(error => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: bookingData
            }));
        });
    };
    
    if (isLoading) {
        return (
             <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-48 mb-6" />
                    <Skeleton className="h-12 w-72 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="lg:col-span-2">
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
    
    const placeholderImage = space.photoUrls?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.back()} className="bg-transparent hover:bg-white/10 border-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-6">Confirm and Pay</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Side: Booking Details */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl">Your Booking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                     {placeholderImage && (
                                        <Image 
                                            src={placeholderImage}
                                            alt={space.name}
                                            width={128}
                                            height={128}
                                            className="rounded-lg object-cover w-32 h-24"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-lg">{space.name}</h3>
                                        <p className="text-muted-foreground">{space.location}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                     <div>
                                        <label htmlFor="date" className="text-sm font-medium flex items-center gap-2 mb-2"><Calendar className="h-5 w-5 text-primary"/> Date</label>
                                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/10 border-white/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="start-time" className="text-sm font-medium">Start Time</label>
                                            <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-white/10 border-white/20" />
                                        </div>
                                        <div>
                                            <label htmlFor="end-time" className="text-sm font-medium">End Time</label>
                                            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-white/10 border-white/20" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Price and Payment */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white/5 border-primary/30 backdrop-blur-sm sticky top-24">
                             <CardHeader>
                                <CardTitle className="text-2xl">Bill Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground"><CurrencyDisplay amount={space.price} /> x {hours.toFixed(1)} hours</p>
                                    <p><CurrencyDisplay amount={subtotal} /></p>
                                </div>
                                 <div className="flex justify-between">
                                    <p className="text-muted-foreground">Service fee (5%)</p>
                                    <p><CurrencyDisplay amount={serviceFee} /></p>
                                 </div>
                                <div className="border-t border-white/20 my-2"></div>
                                 <div className="flex justify-between font-bold text-xl">
                                    <p>Total</p>
                                    <p><CurrencyDisplay amount={total} /></p>
                                 </div>
                            </CardContent>
                             <CardFooter>
                                <Button size="lg" className="w-full text-lg mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={handleConfirmBooking} disabled={hours <= 0 || !date}>
                                    <CreditCard className="mr-2 h-5 w-5"/>
                                    Request to Book
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
