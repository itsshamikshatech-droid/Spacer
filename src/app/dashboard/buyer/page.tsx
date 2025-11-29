
'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Search,
  Sparkles,
  Map,
  Heart,
  Rocket,
  Calendar,
  Users,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import BuyerLayout from '@/components/layouts/BuyerLayout';
import { collection, query, limit, doc } from 'firebase/firestore';
import type { Space, UserProfile } from '@/lib/types';
import { SpaceCard } from '@/components/space-card';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationBanner } from '@/components/verification/VerificationBanner';

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [searchQuery, setSearchQuery] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [budget, setBudget] = useState('');

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && profile && profile.verificationStatus !== 'verified') {
      router.push('/dashboard/verify');
    }
  }, [isUserLoading, profile, router]);

  const recommendationsQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, "spaces"), limit(3));
  }, [firestore]);

  const { data: recommendedSpaces, isLoading: recommendationsLoading } = useCollection<Space>(recommendationsQuery);

  const handleSearch = () => {
    if (profile?.verificationStatus !== 'verified') {
        router.push('/dashboard/verify');
        return;
    }
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('q', searchQuery);
    if (purpose) queryParams.append('purpose', purpose);
    if (date) queryParams.append('date', date);
    if (capacity) queryParams.append('capacity', capacity);
    if (budget) queryParams.append('budget', budget);

    router.push(`/dashboard/buyer/search?${queryParams.toString()}`);
  };
  
  const isLoading = isUserLoading || isProfileLoading;
  
  if (isLoading) {
       return (
        <BuyerLayout title="Loading Dashboard...">
            <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                <Skeleton className="h-16 w-full"/>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
                 <Skeleton className="h-80 w-full" />
            </div>
        </BuyerLayout>
       )
  }
  
  const isVerified = profile?.verificationStatus === 'verified';

  return (
    <BuyerLayout title={`Welcome, ${user?.displayName || user?.email?.split('@')[0] || 'Explorer'}!`}>
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <VerificationBanner status={profile?.verificationStatus || 'unverified'} onVerify={() => router.push('/dashboard/verify')} role="Buyer" />
            
            {isVerified && (
                <>
                    <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 animate-fade-in-up">
                    <h2 className="text-2xl font-bold font-headline mb-4">Find Your Next Space</h2>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input
                            placeholder="Search for 'creative studios', 'rooftop venues', etc."
                            className="h-12 text-base flex-1 p-3 pl-12 rounded-lg bg-transparent border border-white/20 placeholder-white/60 outline-none focus:ring-primary focus:border-primary w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        </div>
                        <Button size="lg" onClick={handleSearch} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 w-full md:w-auto text-base px-8 py-6">
                        Search
                        </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input placeholder="Purpose (e.g. Meeting)" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-12 pl-12 bg-white/10 border-white/20" />
                        </div>
                        <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 pl-12 bg-white/10 border-white/20" />
                        </div>
                        <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-12 pl-12 bg-white/10 border-white/20" />
                        </div>
                        <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input type="number" placeholder="Max Budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-12 pl-12 bg-white/10 border-white/20" />
                        </div>
                    </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                    <div className="lg:col-span-3 space-y-8 flex flex-col">
                        <section className="rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
                        <h2 className="font-semibold mb-4 flex items-center gap-2 text-xl">
                            <Sparkles className="text-primary h-6 w-6" />AI Recommendations For You
                        </h2>
                        {recommendationsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full bg-white/10"/>)}
                            </div>
                        ) : recommendedSpaces && recommendedSpaces.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendedSpaces.map(space => <Link key={space.id} href={`/dashboard/buyer/space/${space.id}`}><SpaceCard space={space}/></Link>)}
                            </div>
                        ) : (
                            <div className="p-8 rounded-lg border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center min-h-[200px]">
                            <Rocket className="mx-auto h-12 w-12 text-primary opacity-70 mb-4" />
                            <p className="text-white/80">No recommendations yet. Try searching for a space or check back later.</p>
                            </div>
                        )}
                        </section>
                    </div>
                    </div>
                </>
            )}
        </div>
    </BuyerLayout>
  );
}
