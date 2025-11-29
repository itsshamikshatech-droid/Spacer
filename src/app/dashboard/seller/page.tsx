
'use client';
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building,
  Calendar,
  PlusCircle,
  IndianRupee,
  Users,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, doc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import SellerLayout from '@/components/layouts/SellerLayout';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationBanner } from '@/components/verification/VerificationBanner';

const dummyData = [
  { name: 'Jan', earnings: 4000 },
  { name: 'Feb', earnings: 3000 },
  { name: 'Mar', earnings: 5000 },
  { name: 'Apr', earnings: 4500 },
  { name: 'May', earnings: 6000 },
  { name: 'Jun', earnings: 8000 },
];

export default function SellerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [totalBookings, setTotalBookings] = useState(0);
  const [newRequests, setNewRequests] = useState(0);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && profile?.verificationStatus === 'unverified') {
      router.push('/dashboard/verify');
    }
  }, [isUserLoading, profile, router]);

  const spacesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'spaces'), where('sellerId', '==', user.uid));
  }, [firestore, user]);
  const { data: spaces, isLoading: spacesLoading } = useCollection(spacesQuery);

  const spaceIds = useMemo(() => {
      if(!spaces) return [];
      return spaces.map(s => s.id);
  }, [spaces]);

  const bookingsQuery = useMemoFirebase(() => {
      if(!firestore || !user || spaceIds.length === 0) return null;
      return query(collection(firestore, "bookings"), where("sellerId", "==", user.uid));
  }, [firestore, user, spaceIds]);
  const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);
  
  useEffect(() => {
    if(bookings) {
        setTotalBookings(bookings.length);
        setNewRequests(bookings.filter(b => b.status === 'pending').length);
    }
  }, [bookings]);

  const isLoading = isUserLoading || isProfileLoading || spacesLoading || bookingsLoading;
  const isVerified = profile?.verificationStatus === 'verified';

  if (isLoading) {
    return (
      <SellerLayout title="Loading Dashboard...">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <Skeleton className="h-16 w-full"/>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2"><Skeleton className="h-80 w-full" /></div>
                <div className="space-y-8"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
            </div>
        </div>
      </SellerLayout>
    );
  }
  
  return (
    <SellerLayout title={`Welcome, ${user?.displayName || user?.email?.split('@')[0] || 'Seller'}!`}>
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in-up">
          
            <VerificationBanner status={profile?.verificationStatus || 'unverified'} onVerify={() => router.push('/dashboard/verify')} role="Seller" />

            {isVerified && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center font-semibold">
                        <Link href="/list-new-space" className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            <PlusCircle className="h-8 w-8 mb-2" /> List a New Space
                        </Link>
                        <Link href="/dashboard/seller/my-listings" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <LayoutGrid className="h-8 w-8 mb-2" /> My Listings
                        </Link>
                        <Link href="/dashboard/seller/booking-requests" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <Calendar className="h-8 w-8 mb-2" /> Booking Requests
                        </Link>
                        <Link href="/dashboard/seller/earnings" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <IndianRupee className="h-8 w-8 mb-2" /> Earnings
                        </Link>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                    <div className="lg:col-span-2 flex flex-col">
                        <Card className="bg-white/5 border-white/10 text-white h-full">
                        <CardHeader>
                            <CardTitle>Earnings (Last 6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dummyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--foreground)/0.7)" />
                                <YAxis stroke="hsl(var(--foreground)/0.7)" tickFormatter={(value) => `INR ${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} 
                                    formatter={(value: number) => [`INR ${value.toLocaleString()}`, 'Earnings']}
                                    cursor={{fill: 'hsl(var(--primary)/0.1)'}}
                                />
                                <Legend />
                                <Bar dataKey="earnings" fill="hsl(var(--primary))" name="Earnings" />
                            </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">{spaces?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">active spaces</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">{totalBookings}</div>
                            <p className="text-xs text-muted-foreground">this month</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">{newRequests}</div>
                            <p className="text-xs text-muted-foreground">pending approval</p>
                            </CardContent>
                        </Card>
                    </div>
                    </div>
                </>
            )}
      </div>
    </SellerLayout>
  );
}
