
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ProviderProfile, Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import BuyerLayout from '@/components/layouts/BuyerLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const hireSchema = z.object({
    serviceId: z.string().min(1, "Please select a service."),
    date: z.string().min(1, "Date is required."),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required."),
    venue: z.string().min(3, "Venue location is required."),
    notes: z.string().optional(),
});
type HireFormValues = z.infer<typeof hireSchema>;


export default function ProviderProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { providerId } = params;
    const firestore = useFirestore();
    const { user } = useUser();

    const providerProfileRef = useMemoFirebase(() => {
        if (!firestore || !providerId) return null;
        return doc(firestore, 'providerProfiles', providerId as string);
    }, [firestore, providerId]);

    const servicesQuery = useMemoFirebase(() => {
        if (!firestore || !providerId) return null;
        return query(collection(firestore, 'services'), where('providerId', '==', providerId as string));
    }, [firestore, providerId]);

    const { data: profile, isLoading: isProfileLoading } = useDoc<ProviderProfile>(providerProfileRef);
    const { data: services, isLoading: areServicesLoading } = useCollection<Service>(servicesQuery);

    const form = useForm<HireFormValues>({
        resolver: zodResolver(hireSchema),
        defaultValues: {
            serviceId: '',
            date: '',
            startTime: '',
            endTime: '',
            venue: '',
            notes: '',
        }
    });

    const selectedServiceId = form.watch('serviceId');
    const selectedService = services?.find(s => s.id === selectedServiceId);

    const getHours = () => {
        const startTime = form.watch('startTime');
        const endTime = form.watch('endTime');
        if (!startTime || !endTime) return 0;
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        if (end <= start) return 0;
        const diff = end.getTime() - start.getTime();
        return diff / (1000 * 60 * 60);
    };

    const hours = getHours();
    const totalCost = (selectedService?.costPerHour || 0) * hours;
    
    async function onSubmit(data: HireFormValues) {
        if (!user || !firestore || !profile || !selectedService) {
            toast({ variant: 'destructive', title: "Error", description: "Missing required information to send request." });
            return;
        }

        const hireRequestData = {
            ...data,
            hours,
            totalCost,
            buyerId: user.uid,
            buyerName: user.displayName,
            providerId: profile.userId,
            status: 'pending',
            createdAt: serverTimestamp(),
            service: selectedService, // Denormalize service data
        };

        const hireRequestsCollection = collection(firestore, 'hireRequests');
        await addDoc(hireRequestsCollection, hireRequestData);
        
        // Notify provider
        const notifCollection = collection(firestore, 'notifications');
        await addDoc(notifCollection, {
            userId: profile.userId,
            type: 'hire_request',
            title: 'New Hire Request!',
            body: `You have a new hire request from ${user.displayName || 'a buyer'} for your ${selectedService.serviceCategory} service.`,
            read: false,
            createdAt: serverTimestamp(),
            link: `/dashboard/provider/hire-requests`
        });
        
        // Notify buyer
        await addDoc(notifCollection, {
            userId: user.uid,
            type: 'hire_request_sent',
            title: 'Hire Request Sent!',
            body: `Your request for ${selectedService.serviceCategory} has been sent to ${profile.fullName}.`,
            read: false,
            createdAt: serverTimestamp(),
            link: `/dashboard/buyer/my-service-bookings`
        });

        toast({ title: "Hire Request Sent!", description: "The service provider has been notified." });
        router.push('/dashboard/buyer/my-service-bookings');
    }

    const isLoading = isProfileLoading || areServicesLoading;

    if (isLoading) {
        return <BuyerLayout title="Loading..."><div className="p-8"><Skeleton className="w-full h-[80vh] bg-white/10" /></div></BuyerLayout>;
    }

    if (!profile) {
        return <BuyerLayout title="Error"><div className="p-8 text-center">Provider profile not found.</div></BuyerLayout>;
    }

    return (
        <BuyerLayout title={profile.fullName}>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                 <div className="mb-6">
                    <Button variant="outline" onClick={() => router.back()} className="bg-transparent hover:bg-white/10 border-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Services
                    </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
                                <Image src={profile.profilePhotoUrl || '/icon-192.png'} alt={profile.fullName} width={120} height={120} className="rounded-full border-4 border-primary" />
                                <div className="text-center sm:text-left">
                                    <CardTitle className="text-3xl font-headline">{profile.fullName}</CardTitle>
                                    <CardDescription className="text-white/70">{profile.email}</CardDescription>
                                    <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                                        <Badge variant="secondary">{profile.address.city}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                             <CardContent className="text-white/80 space-y-2">
                                <p><strong className="text-white/90 font-medium">About:</strong> {profile.securityQuestions?.experience}</p>
                            </CardContent>
                        </Card>
                        
                        {/* Services Section */}
                        <Card className="bg-white/5 border-white/10">
                             <CardHeader>
                                <CardTitle className="text-2xl font-headline">Available Services</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {services && services.length > 0 ? services.map(s => (
                                    <div key={s.id} className="p-4 rounded-lg bg-white/10 border border-white/20 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-lg">{s.serviceCategory}</h4>
                                            <p className="text-sm text-white/70">{s.experience} years of experience</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-primary"><CurrencyDisplay amount={s.costPerHour} />/hr</p>
                                            <p className="text-xs text-white/70">min. {s.minimumHours} hours</p>
                                        </div>
                                    </div>
                                )) : <p>This provider has not listed any services yet.</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Hire Form Section */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 bg-white/5 border-primary/30">
                             <CardHeader>
                                <CardTitle className="text-2xl font-headline">Hire {profile.fullName.split(' ')[0]}</CardTitle>
                                <CardDescription>Send a request for the service you need.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField control={form.control} name="serviceId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Select a service" /></SelectTrigger></FormControl>
                                                    <SelectContent>{services?.map(s => <SelectItem key={s.id} value={s.id}>{s.serviceCategory}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} className="bg-white/10 border-white/20"/></FormControl><FormMessage /></FormItem> )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem><FormLabel>From</FormLabel><FormControl><Input type="time" {...field} className="bg-white/10 border-white/20"/></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="endTime" render={({ field }) => ( <FormItem><FormLabel>To</FormLabel><FormControl><Input type="time" {...field} className="bg-white/10 border-white/20"/></FormControl><FormMessage /></FormItem> )} />
                                        </div>
                                        <FormField control={form.control} name="venue" render={({ field }) => ( <FormItem><FormLabel>Venue / Location</FormLabel><FormControl><Input placeholder="Address of the event" {...field} className="bg-white/10 border-white/20"/></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any specific instructions?" {...field} className="bg-white/10 border-white/20"/></FormControl><FormMessage /></FormItem> )} />
                                        
                                        {totalCost > 0 && (
                                            <div className="pt-4 border-t border-white/20">
                                                <p className="flex justify-between font-bold text-lg"><span>Total Offer:</span> <span className="text-primary"><CurrencyDisplay amount={totalCost} /></span></p>
                                            </div>
                                        )}
                                        
                                        <Button type="submit" className="w-full" disabled={!selectedService}>
                                            <Send className="mr-2 h-4 w-4" /> Send Hire Request
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
