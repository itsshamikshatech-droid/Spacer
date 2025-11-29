
'use client';
import { Button } from "@/components/ui/button";
import { CalendarCheck, Check, X } from "lucide-react";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProviderLayout from "@/components/layouts/ProviderLayout";
import { collection, doc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { HireRequest } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function ProviderHireRequestsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [requests, setRequests] = useState<HireRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const hireRequestsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "hireRequests"), where("providerId", "==", user.uid), where("status", "==", "pending"));
    }, [user, firestore]);

    useEffect(() => {
        if (isUserLoading) return;
        if (!hireRequestsQuery) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onSnapshot(hireRequestsQuery, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HireRequest)));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching hire requests:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [hireRequestsQuery, isUserLoading]);
    
    const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'declined') => {
        if(!firestore || !user) return;
        
        const requestRef = doc(firestore, 'hireRequests', requestId);
        await updateDoc(requestRef, { status });

        const request = requests.find(r => r.id === requestId);
        if (request) {
            const notifCollection = collection(firestore, 'notifications');
            await addDoc(notifCollection, {
                userId: request.buyerId,
                type: 'hire_request_update',
                title: `Request ${status}`,
                body: `Your hire request for a ${request.service?.serviceCategory || 'service'} from ${user.displayName || 'a provider'} has been ${status}.`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/dashboard/hire-requests/${request.id}`
            });
        }
        
        toast({ title: `Request ${status}` });
    };

    return (
    <ProviderLayout title="Hire Requests">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                {isLoading && (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-64 w-full bg-white/10" />)}
                     </div>
                )}
                {!isLoading && requests.length === 0 && (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                        <CalendarCheck className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
                        <h3 className="mt-4 text-2xl font-bold font-headline">No pending hire requests.</h3>
                        <p className="text-lg text-white/80 mt-2">When a buyer wants to hire you for a service, the request will appear here.</p>
                    </section>
                </div>
                )}
                {!isLoading && requests.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <Card key={request.id} className="bg-white/5 border-white/10 backdrop-blur-sm text-white flex flex-col animate-fade-in-up">
                        <CardHeader>
                            <CardTitle>Request from {request.buyerName || 'a Buyer'}</CardTitle>
                            <CardDescription>For your {request.service?.serviceCategory} service on {new Date(request.date).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <p><strong>Time:</strong> {request.startTime} - {request.endTime} ({request.hours} hrs)</p>
                            <p><strong>Venue:</strong> {request.venue}</p>
                            {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                            <p className="font-bold text-primary text-lg pt-2">Offer: <CurrencyDisplay amount={request.totalCost} /></p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 bg-white/5 p-4 mt-auto">
                            <Button onClick={() => handleUpdateRequest(request.id, 'declined')} variant="outline" size="sm" className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200">
                                <X className="mr-2 h-4 w-4" /> Decline
                            </Button>
                            <Button onClick={() => handleUpdateRequest(request.id, 'accepted')} size="sm" className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:text-green-200">
                                <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                        </CardFooter>
                        </Card>
                    ))}
                    </div>
                )}
        </div>
    </ProviderLayout>
  );
}
