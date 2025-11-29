
"use client";
import BuyerLayout from "@/components/layouts/BuyerLayout";
import { useEffect, useState } from "react";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, FileText, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const bookingsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, "bookings"), 
        where("buyerId", "==", user.uid)
    );
  }, [user, firestore]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!bookingsQuery) {
        setBookings([]);
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    const unsub = onSnapshot(bookingsQuery, 
        snap => {
            setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)))
            setIsLoading(false);
        },
        error => {
            console.error("Error fetching bookings:", error);
            setIsLoading(false);
        }
    );
    return unsub;
  }, [bookingsQuery, isUserLoading]);

  const handleDelete = async () => {
    if (!firestore || !bookingToDelete) return;
    try {
      await deleteDoc(doc(firestore, "bookings", bookingToDelete));
      toast({
        title: "Booking Deleted",
        description: "The booking has been removed from your history.",
      });
    } catch (error) {
      console.error("Error deleting booking: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the booking. Please try again.",
      });
    } finally {
        setBookingToDelete(null);
    }
  };

  const BookingStatusIcon = ({ status }: { status: string }) => {
      switch(status) {
          case 'confirmed': return <CheckCircle className="h-5 w-5 text-green-400" />;
          case 'pending': return <Clock className="h-5 w-5 text-yellow-400" />;
          case 'declined': return <XCircle className="h-5 w-5 text-red-400" />;
          default: return <Clock className="h-5 w-5 text-gray-400" />;
      }
  }

  return (
    <BuyerLayout title="My Bookings">
       <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <AlertDialog onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <section className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in-up">
          <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
          {isLoading ? (
             <div className="space-y-4">
                {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-24 w-full bg-white/10"/>)}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
                {bookings.map(b => (
                <Card key={b.id} className="p-4 bg-white/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/10 hover:shadow-primary/20 shadow-lg">
                    <div className="flex-grow">
                        <div className="font-semibold text-lg">{b.spaceName || `Space ID: ${b.spaceId.substring(0,6)}`}</div>
                        <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                           <Calendar className="h-4 w-4"/> {new Date(b.startDate).toLocaleString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm text-white/80 capitalize">
                           <BookingStatusIcon status={b.status} />
                           {b.status}
                        </div>
                        <div className="font-semibold text-primary text-lg ml-auto sm:ml-0"><CurrencyDisplay amount={b.totalPrice}/></div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/buyer/bookings/${b.id}`}>
                               <FileText className="mr-2 h-4 w-4"/> View Bill
                            </Link>
                        </Button>
                         <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => setBookingToDelete(b.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                </Card>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                <Calendar className="h-12 w-12 mx-auto text-primary/70 mb-4"/>
                <h3 className="text-xl font-semibold">No bookings yet.</h3>
                <p className="text-white/70">Your booked spaces will appear here.</p>
            </div>
          )}
        </section>
        {bookingToDelete && (
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this booking history.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        )}
        </AlertDialog>
      </div>
    </BuyerLayout>
  );
}
