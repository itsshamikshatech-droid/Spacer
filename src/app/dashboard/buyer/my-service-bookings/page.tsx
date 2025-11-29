
'use client';
import BuyerLayout from "@/components/layouts/BuyerLayout";
import { useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import type { HireRequest } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, CheckCircle, Clock, FileText, Trash2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { CurrencyDisplay } from "@/components/ui/currency-display";

const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
        accepted: { icon: CheckCircle, color: 'text-green-400', label: 'Accepted' },
        declined: { icon: XCircle, color: 'text-red-400', label: 'Declined' },
        cancelled: { icon: XCircle, color: 'text-gray-400', label: 'Cancelled' },
        completed: { icon: CheckCircle, color: 'text-blue-400', label: 'Completed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return <Badge variant={status === 'accepted' ? 'default' : 'secondary'} className="capitalize"><Icon className={`mr-1 h-3 w-3 ${config.color}`} />{config.label}</Badge>
};


export default function MyServiceBookingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [requests, setRequests] = useState<HireRequest[] | null>(null);
    const [requestToModify, setRequestToModify] = useState<{id: string; action: 'cancel' | 'delete'} | null>(null);

    const hireRequestsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "hireRequests"), where("buyerId", "==", user.uid));
    }, [user, firestore]);

    const { data: fetchedRequests, isLoading } = useCollection<HireRequest>(hireRequestsQuery);

    useEffect(() => {
        if (fetchedRequests) {
            const fetchServiceDetails = async () => {
                if (!firestore) return;
                const requestsWithServices = await Promise.all(fetchedRequests.map(async (req) => {
                    // This is inefficient and should be denormalized in a real app
                    // but for this demo, we fetch service details
                    const serviceRef = doc(firestore, 'services', req.serviceId);
                    // For now, let's assume service details might be added later
                    // const serviceSnap = await getDoc(serviceRef);
                    // return serviceSnap.exists() ? { ...req, service: serviceSnap.data() as Service } : req;
                    return req;
                }));
                setRequests(requestsWithServices);
            }
            fetchServiceDetails();
        }
    }, [fetchedRequests, firestore]);
    
    const handleCancelRequest = async () => {
        if (!firestore || !requestToModify || requestToModify.action !== 'cancel') return;
        const requestRef = doc(firestore, 'hireRequests', requestToModify.id);
        const requestData = requests?.find(r => r.id === requestToModify.id);

        try {
            await updateDoc(requestRef, { status: 'cancelled' });

            if (requestData) {
                const notifCollection = collection(firestore, 'notifications');
                await addDoc(notifCollection, {
                    userId: requestData.providerId,
                    type: 'hire_request_cancelled',
                    title: `Request Cancelled`,
                    body: `A hire request for your service was cancelled by the buyer.`,
                    read: false,
                    createdAt: serverTimestamp(),
                    link: `/dashboard/provider/hire-requests`
                });
            }

            toast({ title: "Request Cancelled" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not cancel the request.", variant: "destructive" });
        } finally {
            setRequestToModify(null);
        }
    }
    
    const handleDeleteRequest = async () => {
        if (!firestore || !requestToModify || requestToModify.action !== 'delete') return;
        
        try {
            await deleteDoc(doc(firestore, "hireRequests", requestToModify.id));
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
            setRequestToModify(null);
        }
    };
    
    const handleConfirmation = () => {
        if (requestToModify?.action === 'cancel') {
            handleCancelRequest();
        } else if (requestToModify?.action === 'delete') {
            handleDeleteRequest();
        }
    }

    const loading = isUserLoading || isLoading || requests === null;

    return (
        <BuyerLayout title="My Service Bookings">
            <AlertDialog onOpenChange={(open) => !open && setRequestToModify(null)}>
                <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full bg-white/10" />)}
                        </div>
                    )}
                    {!loading && requests && requests.length === 0 && (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                                <Briefcase className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
                                <h3 className="mt-4 text-2xl font-bold font-headline">No service bookings yet.</h3>
                                <p className="text-lg text-white/80 mt-2">When you hire a service provider, your bookings will appear here.</p>
                                <div className="mt-8">
                                    <Button asChild size="lg">
                                        <Link href="/dashboard/buyer/add-new-service">Hire a Provider</Link>
                                    </Button>
                                </div>
                            </section>
                        </div>
                    )}
                    {!loading && requests && requests.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <Card key={req.id} className="bg-white/5 border-white/10 backdrop-blur-sm text-white flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{req.service?.serviceCategory || 'Service'}</CardTitle>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <CardDescription>Provider: {req.service?.providerName || req.providerId.substring(0,6)}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2">
                                        {req.service?.providerPhotoUrl && 
                                            <div className="relative h-24 w-24 rounded-full mx-auto mb-4 border-2 border-primary/50">
                                                <Image src={req.service.providerPhotoUrl} alt={req.service.providerName} fill className="object-cover rounded-full" />
                                            </div>
                                        }
                                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> {new Date(req.date).toLocaleDateString()}</p>
                                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> {req.startTime} - {req.endTime}</p>
                                        <p className="font-bold text-primary text-xl pt-2">Total: <CurrencyDisplay amount={req.totalCost} /></p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 bg-white/5 p-4 mt-auto">
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" onClick={() => setRequestToModify({ id: req.id, action: req.status === 'pending' ? 'cancel' : 'delete' })}>
                                            {req.status === 'pending' ? 'Cancel' : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <Button asChild size="sm">
                                        <Link href={`/dashboard/hire-requests/${req.id}`}>
                                            <FileText className="mr-2 h-4 w-4" /> View Bill
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        </div>
                    )}
                </div>
                 {requestToModify && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {requestToModify.action === 'cancel'
                                ? "This will cancel your pending request. The provider will be notified."
                                : "This action cannot be undone. This will permanently delete this booking record."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRequestToModify(null)}>Back</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmation}>
                                {requestToModify.action === 'cancel' ? 'Confirm Cancel' : 'Confirm Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>
        </BuyerLayout>
    );
}
