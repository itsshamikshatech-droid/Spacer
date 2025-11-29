
"use client";
import BuyerLayout from "@/components/layouts/BuyerLayout";
import { useEffect, useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Service } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function AddServicePage() {
  const firestore = useFirestore();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    setIsLoading(true);
    const unsub = onSnapshot(collection(firestore, "services"), snap => {
        setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        setIsLoading(false);
    }, (error) => {
        console.error(error);
        toast({ title: "Error", description: "Could not fetch services.", variant: "destructive" });
        setIsLoading(false);
    });
    return unsub;
  }, [firestore]);

  return (
    <BuyerLayout title="Hire a Service Provider">
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <section className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in-up">
          <h2 className="text-xl font-semibold mb-4">Available Services</h2>
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full bg-white/10" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white/5 rounded-lg border-2 border-dashed border-white/20 min-h-[40vh] flex flex-col items-center justify-center">
                <Briefcase className="h-16 w-16 text-primary/70 mb-4" />
                <h3 className="text-2xl font-bold font-headline">No Services Available Yet</h3>
                <p className="text-white/70 mt-2">Check back later to find professional services for your events.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {services.map(s => (
                <Card key={s.id} className="bg-white/5 border-white/10 backdrop-blur-sm text-white flex flex-col transition-all hover:border-primary/50 hover:shadow-primary/20 hover:-translate-y-1">
                    <CardHeader>
                        <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-primary/50 mb-4">
                            <Image src={s.providerPhotoUrl || '/icon-192.png'} alt={s.providerName} fill className="object-cover rounded-full" />
                        </div>
                        <CardTitle className="text-center text-xl">{s.providerName}</CardTitle>
                        <CardDescription className="text-center">{s.serviceCategory}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/70">Experience:</span>
                            <span className="font-semibold">{s.experience} yrs</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/70">Min. Hours:</span>
                            <span className="font-semibold">{s.minimumHours}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/70">Rate:</span>
                            <span className="font-bold text-primary"><CurrencyDisplay amount={s.costPerHour} />/hr</span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 bg-white/5 mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/buyer/provider/${s.providerId}`}>
                                <User className="mr-2 h-4 w-4"/> View Profile & Hire
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
          )}
        </section>
      </div>
    </BuyerLayout>
  );
}
