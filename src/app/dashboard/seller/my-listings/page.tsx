'use client';
import { Button } from "@/components/ui/button";
import { LayoutGrid, Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Space } from "@/lib/types";
import { SpaceCard } from "@/components/space-card";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
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
import SellerLayout from "@/components/layouts/SellerLayout";

export default function MyListingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);

  const spacesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'spaces'), where('sellerId', '==', user.uid));
  }, [firestore, user]);

  const { data: spaces, isLoading } = useCollection<Space>(spacesQuery);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query bookings collection where the sellerId is the current user's uid
    return query(collection(firestore, 'bookings'), where('sellerId', '==', user.uid)); 
  }, [firestore, user]);

  const { data: bookings } = useCollection(bookingsQuery);
  const bookedSpaceIds = useMemo(() => new Set(bookings?.map(b => b.spaceId)), [bookings]);


  const handleDelete = async () => {
    if (!firestore || !spaceToDelete) return;
    try {
      await deleteDoc(doc(firestore, 'spaces', spaceToDelete));
      toast({
        title: "Listing Deleted",
        description: "Your space has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting space: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the space. Please try again.",
      });
    } finally {
        setSpaceToDelete(null);
    }
  };

  return (
    <SellerLayout title="My Listings">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold font-headline">My Listings</h1>
                <Button asChild>
                    <Link href="/list-new-space">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List a New Space
                    </Link>
                </Button>
            </div>
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 animate-pulse flex flex-col">
                        <div className="relative w-full h-48 flex-shrink-0">
                            <Skeleton className="h-full w-full" />
                        </div>
                        <div className="flex flex-col p-4 flex-grow">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className="flex-grow" />
                            <div className="flex items-center justify-between mt-auto pt-4">
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-10 w-1/3" />
                            </div>
                        </div>
                    </Card>
                ))}
                </div>
            )}
            {!isLoading && spaces && spaces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {spaces.map((space) => (
                    <div key={space.id} className="flex flex-col gap-2 animate-fade-in-up">
                        <Link href={`/dashboard/seller/my-listings/${space.id}/edit`}>
                        <SpaceCard space={space} isBooked={bookedSpaceIds?.has(space.id)} />
                        </Link>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" className="w-full bg-transparent hover:bg-white/10">
                                <Link href={`/dashboard/seller/my-listings/${space.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" onClick={() => setSpaceToDelete(space.id)}>
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                {spaceToDelete === space.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your space listing
                                            and remove its data from our servers.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setSpaceToDelete(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                )}
                            </AlertDialog>
                        </div>
                    </div>
                ))}
                </div>
            )}
            {!isLoading && (!spaces || spaces.length === 0) && (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                        <LayoutGrid className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
                        <h3 className="mt-4 text-2xl font-bold font-headline">You have no listings yet.</h3>
                        <p className="text-lg text-white/80 mt-2">Once you list a space, you can manage it here.</p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-3">
                            <Link href="/list-new-space">List a Space</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    </SellerLayout>
  );
}
