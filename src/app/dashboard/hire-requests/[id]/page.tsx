
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { HireRequest } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'accepted': return <CheckCircle className="h-6 w-6 text-green-400" />;
        case 'pending': return <Clock className="h-6 w-6 text-yellow-400" />;
        case 'declined': return <XCircle className="h-6 w-6 text-red-400" />;
        case 'cancelled': return <XCircle className="h-6 w-6 text-gray-400" />;
        default: return <Clock className="h-6 w-6 text-gray-400" />;
    }
};

export default function HireRequestBillPage() {
    const params = useParams();
    const router = useRouter();
    const { id: hireId } = params;
    const firestore = useFirestore();

    const hireRequestDocRef = useMemoFirebase(() => {
        if (!firestore || !hireId) return null;
        return doc(firestore, 'hireRequests', hireId as string);
    }, [firestore, hireId]);

    const { data: hireRequest, isLoading } = useDoc<HireRequest>(hireRequestDocRef);

    const renderLoading = () => (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white p-4 md:p-8">
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
        </div>
    );
    
    if (isLoading) {
        return renderLoading();
    }
    
    if (!hireRequest) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground">
                <p className="text-2xl mb-4">Booking details not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }
    
    const service = hireRequest.service;
    
    return (
         <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white p-4 sm:p-6 md:p-8">
             <div aria-hidden className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black opacity-80"></div>
            </div>
            <div className="max-w-2xl w-full mx-auto">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.back()} className="bg-transparent hover:bg-white/10 border-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <Card className="bg-white/5 border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/10 animate-fade-in-up rounded-2xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold font-headline">Service Invoice</CardTitle>
                                <p className="text-muted-foreground text-sm">Booking ID: {hireRequest.id}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant={hireRequest.status === 'accepted' ? 'default' : 'secondary'} className="capitalize text-lg">
                                    <StatusIcon status={hireRequest.status}/>
                                    <span className="ml-2">{hireRequest.status}</span>
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-2">Booked on {new Date(hireRequest.createdAt.toDate()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {service?.providerPhotoUrl && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-white/10">
                                <Image 
                                    src={service.providerPhotoUrl}
                                    alt={service.providerName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 text-base">
                             <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Provider:</span> {service?.providerName || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Service:</span> {service?.serviceCategory || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Date:</span> {new Date(hireRequest.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary"/>
                                <span><span className="font-semibold">Time:</span> {hireRequest.startTime} - {hireRequest.endTime}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">Bill Details</h3>
                            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Rate</p>
                                    <p><CurrencyDisplay amount={service?.costPerHour || 0} />/hr</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Subtotal ({hireRequest.hours.toFixed(1)} hours)</p>
                                    <p><CurrencyDisplay amount={hireRequest.totalCost} /></p>
                                </div>
                                <div className="border-t border-white/20 my-2"></div>
                                <div className="flex justify-between items-center font-bold text-xl pt-2">
                                    <p>Grand Total</p>
                                    <p className="text-primary"><CurrencyDisplay amount={hireRequest.totalCost} /></p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
