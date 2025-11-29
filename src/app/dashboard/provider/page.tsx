
'use client';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CalendarCheck, PlusCircle, User, Bell, FileText, BadgeCheck, Clock, AlertTriangle, ShieldCheck, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationBanner } from '@/components/verification/VerificationBanner';

const dummyData = [
  { name: 'Jan', earnings: 1200 },
  { name: 'Feb', earnings: 1800 },
  { name: 'Mar', earnings: 1500 },
  { name: 'Apr', earnings: 2200 },
  { name: 'May', earnings: 2500 },
  { name: 'Jun', earnings: 3000 },
];

export default function ProviderDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Redirect to verification if profile doesn't exist or is not verified
    if (!isUserLoading && profile && profile.verificationStatus !== 'verified') {
      router.push('/dashboard/verify');
    }
  }, [isUserLoading, profile, router]);

  const isLoading = isUserLoading || isProfileLoading;
  const isVerified = profile?.verificationStatus === 'verified';


  if (isLoading) {
    return (
      <ProviderLayout title="Loading Dashboard...">
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
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title={`Welcome, ${profile?.firstName || user?.email?.split('@')[0] || 'Provider'}!`}>
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in-up">
            
            <VerificationBanner status={profile?.verificationStatus || 'unverified'} onVerify={() => router.push('/dashboard/verify')} role="Provider" />

            {isVerified && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center font-semibold">
                        <Link href="/dashboard/provider/create-service" className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                        <PlusCircle className="h-8 w-8 mb-2" /> Create Service
                        </Link>
                        <Link href="/dashboard/provider/my-applications" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <FileText className="h-8 w-8 mb-2" /> My Services
                        </Link>
                        <Link href="/dashboard/provider/hire-requests" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <CalendarCheck className="h-8 w-8 mb-2" /> Hire Requests
                        </Link>
                        <Link href="/dashboard/provider/notifications" className="p-6 rounded-2xl bg-white/5 text-white flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <Bell className="h-8 w-8 mb-2" /> Notifications
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
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => [`INR ${value.toLocaleString()}`, "Earnings"]}/>
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
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">₹0.00</div>
                            <p className="text-xs text-muted-foreground">No earnings yet</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">No completed jobs</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">New Hire Requests</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">No pending requests</p>
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    </ProviderLayout>
  );
}
