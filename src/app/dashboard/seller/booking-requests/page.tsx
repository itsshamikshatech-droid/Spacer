
'use client';
import { Button } from "@/components/ui/button";
import { Calendar, Check, X } from "lucide-react";
import { useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import type { Booking } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import SellerLayout from "@/components/layouts/SellerLayout";
import { CurrencyDisplay } from "@/components/ui/currency-display";


export default function BookingRequestsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bookingsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'bookings'), 
        where('sellerId', '==', user.uid), 
        where('status', '==', 'pending')
    );
  }, [user, firestore]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!bookingsQuery) {
        setIsLoading(false);
        setBookings([]);
        return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(fetchedBookings);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching booking requests: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch booking requests."
        });
        setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [bookingsQuery, isUserLoading]);

  const handleApprove = (booking: Booking) => {
    if (!firestore || !booking) return;

    const bookingRef = doc(firestore, 'bookings', booking.id);
    const notificationRef = collection(firestore, 'notifications');
    
    const updatedData = { 
        status: 'confirmed',
        activity: [
            ...(booking.activity || []),
            { status: 'confirmed', timestamp: new Date().toISOString() }
        ]
    };

    updateDoc(bookingRef, updatedData)
        .then(() => {
            addDoc(notificationRef, {
                userId: booking.buyerId,
                type: 'booking_approved',
                title: 'Booking Approved!',
                body: `Your booking for "${booking.spaceName}" has been approved by the seller.`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/dashboard/buyer/bookings/${booking.id}`
            }).catch(error => {
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: notificationRef.path,
                        operation: 'create',
                        requestResourceData: { userId: booking.buyerId, type: 'booking_approved' },
                    })
                );
            });

            toast({
                title: "Booking Approved",
                description: "The buyer has been notified.",
            });
        })
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: bookingRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleDecline = (booking: Booking) => {
     if (!firestore || !booking) return;

    const bookingRef = doc(firestore, 'bookings', booking.id);
    const notificationRef = collection(firestore, 'notifications');
    
    const updatedData = { 
        status: 'declined',
        activity: [
            ...(booking.activity || []),
            { status: 'declined', timestamp: new Date().toISOString() }
        ]
    };

     updateDoc(bookingRef, updatedData)
        .then(() => {
            addDoc(notificationRef, {
                userId: booking.buyerId,
                type: 'booking_declined',
                title: 'Booking Declined',
                body: `Your booking for "${booking.spaceName}" was declined.`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/dashboard/buyer/bookings/${booking.id}`
            }).catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: notificationRef.path,
                        operation: 'create',
                        requestResourceData: { userId: booking.buyerId, type: 'booking_declined' },
                    })
                );
            });

            toast({
                title: "Booking Declined",
                description: "The buyer has been notified.",
            });
        })
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: bookingRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }


  return (
    <SellerLayout title="Booking Requests">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-8 w-1/2 mt-2" />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </CardFooter>
                    </Card>
                ))}
                </div>
            )}
            {!isLoading && bookings && bookings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="bg-white/5 border-white/10 backdrop-blur-sm text-white flex flex-col animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Request for {booking.spaceName}</CardTitle>
                        <CardDescription>Buyer ID: {booking.buyerId.substring(0,10)}...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <p><strong>From:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                        <p><strong>To:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                        <p className="font-bold text-primary text-lg pt-2">Earning: <CurrencyDisplay amount={booking.totalPrice} /></p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-white/5 p-4 mt-auto">
                        <Button onClick={() => handleDecline(booking)} variant="outline" size="sm" className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200">
                            <X className="mr-2 h-4 w-4" /> Decline
                        </Button>
                        <Button onClick={() => handleApprove(booking)} size="sm" className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:text-green-200">
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            )}
            {!isLoading && (!bookings || bookings.length === 0) && (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                        <Calendar className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
                        <h3 className="mt-4 text-2xl font-bold font-headline">No pending booking requests.</h3>
                        <p className="text-lg text-white/80 mt-2">When a buyer requests to book one of your spaces, it will appear here.</p>
                    </section>
                </div>
            )}
        </div>
    </SellerLayout>
  );
}
