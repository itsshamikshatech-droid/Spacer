
"use client";
import BuyerLayout from "@/components/layouts/BuyerLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirestore } from '@/firebase';
import { collection, query, onSnapshot } from "firebase/firestore";
import Link from 'next/link';
import { SpaceCard } from "@/components/space-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX, Users, IndianRupee } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { Space } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const purposeParam = searchParams.get("purpose") || "any";
  const capacityParam = Number(searchParams.get("capacity") || 0);
  const budgetParam = Number(searchParams.get("budget") || 5000);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(qParam);
  const [purpose, setPurpose] = useState(purposeParam);
  const [otherPurpose, setOtherPurpose] = useState('');
  const [capacity, setCapacity] = useState(capacityParam);
  const [priceRange, setPriceRange] = useState([0, budgetParam]);
  
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);

    let q = query(collection(firestore, "spaces"));

    // Note: Firestore doesn't support complex client-side filtering efficiently.
    // The following filtering is done on the client after fetching all documents.
    // For production, use Algolia or more specific Firestore queries with indexes.
    
    const unsub = onSnapshot(q, (snap) => {
        let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Space));
        
        const filtered = items.filter(space => {
          const searchTermMatch = searchTerm ? (space.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (space.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) : true;
          
          let purposeMatch = true;
          if (purpose === 'Others') {
            // A simple approximation: if user types "other", check against name/description
            purposeMatch = otherPurpose ? (space.name?.toLowerCase() || '').includes(otherPurpose.toLowerCase()) || (space.description?.toLowerCase() || '').includes(otherPurpose.toLowerCase()) : true;
          } else if (purpose !== 'any') {
            purposeMatch = space.purpose === purpose;
          }
          
          const capacityMatch = capacity > 0 ? space.capacity >= capacity : true;
          const priceMatch = space.price >= priceRange[0] && space.price <= priceRange[1];
          return searchTermMatch && purposeMatch && capacityMatch && priceMatch;
        });

        setSpaces(filtered);
        setLoading(false);
    });
    
    return unsub;
  }, [firestore, searchTerm, purpose, otherPurpose, capacity, priceRange]);

  const resetFilters = () => {
    setSearchTerm('');
    setPurpose('any');
    setOtherPurpose('');
    setCapacity(0);
    setPriceRange([0, 5000]);
  };

  return (
    <BuyerLayout title="Search Spaces">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <section className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="relative flex-grow lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input
                        placeholder="Search by name or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-white/10 border-white/20"
                        />
                    </div>
                    <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="w-full h-12 bg-white/10 border-white/20">
                        <SelectValue placeholder="Purpose" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="any">Any Purpose</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Rooftop">Rooftop</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                    {purpose === 'Others' && (
                        <div className="relative">
                            <Input
                            placeholder="Specify other purpose"
                            value={otherPurpose}
                            onChange={(e) => setOtherPurpose(e.target.value)}
                            className="h-12 bg-white/10 border-white/20"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <Input
                        type="number"
                        placeholder="Capacity"
                        value={capacity || ''}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="pl-10 h-12 bg-white/10 border-white/20"
                        />
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                            <IndianRupee className="h-5 w-5 text-primary"/>
                            Price Range: <CurrencyDisplay amount={priceRange[0]} /> - <CurrencyDisplay amount={priceRange[1]} />
                        </label>
                        <Slider
                            min={0}
                            max={5000}
                            step={100}
                            value={[priceRange[1]]}
                            onValueChange={(value) => setPriceRange([0, value[0]])}
                        />
                    </div>
                    <div className="flex items-end justify-end">
                       <Button onClick={resetFilters} variant="ghost" className="h-12 hover:bg-white/20">
                            <FilterX className="mr-2 h-4 w-4" />
                            Reset Filters
                        </Button>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 border-t border-white/10 pt-6">Search results ({spaces.length})</h2>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 w-full bg-white/10" />)}
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spaces.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white/5 rounded-lg">No spaces match your filters.</div>
                    ) : spaces.map(s => (
                        <Link key={s.id} href={`/dashboard/buyer/space/${s.id}`} className="block w-full transition-all duration-300 hover:scale-[1.02] animate-fade-in-up">
                            <SpaceCard space={s} />
                        </Link>
                    ))}
                </div>
                )}
            </section>
        </div>
    </BuyerLayout>
  );
}
