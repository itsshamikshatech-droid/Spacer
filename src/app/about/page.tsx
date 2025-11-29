'use client';
import { Building, ShoppingBag, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const router = useRouter();

  return (
    <div className="relative text-foreground overflow-hidden w-full flex-1 flex flex-col">
       <div className="absolute inset-0 bg-black/60 z-0" />
       <div 
        className="absolute inset-0 bg-cover bg-center animate-pan-background z-[-1]" 
        style={heroImage ? { backgroundImage: `url(${heroImage.imageUrl})` } : {}} 
        data-ai-hint={heroImage?.imageHint}
       />

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 text-white flex-1">
        <div className="mb-8">
            <Button variant="outline" className="bg-transparent hover:bg-white/10 text-white" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Welcome to SPACER
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
            The all-in-one platform for finding, listing, and servicing unique spaces.
            </p>
        </div>

        <div className="max-w-5xl mx-auto mt-12 md:mt-20 text-lg text-left space-y-8 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-8 animate-fade-in-up animation-delay-500">
            <p>
            At SPACER, our mission is to revolutionize the way people connect with physical spaces. We believe that every great event, meeting, or creative project starts with the perfect environment. We also believe that countless amazing spaces sit underutilized, and talented service providers are looking for new opportunities.
            </p>
            <p className="font-semibold text-primary">
            SPACER brings these three groups together into one seamless ecosystem, creating value for everyone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-8">
            <div className="flex flex-col items-center text-center p-6 border border-white/20 rounded-lg bg-white/5 transition-all hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-3">For Space Buyers</h2>
                <p className="text-primary-foreground/70">
                Discover and book the perfect space for any occasion. From creative studios and professional meeting rooms to unique event venues, our platform makes it easy to find a space that fits your needs and budget.
                </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-white/20 rounded-lg bg-white/5 transition-all hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-3">For Space Sellers</h2>
                <p className="text-primary-foreground/70">
                Turn your underutilized space into a new revenue stream. Listing on SPACER is simple, secure, and profitable. You control your availability, pricing, and rules, while we connect you with a community of renters.
                </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-white/20 rounded-lg bg-white/5 transition-all hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wrench className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-3">For Service Providers</h2>
                <p className="text-primary-foreground/70">
                Grow your business by offering your services—from catering and cleaning to AV setup and event planning—directly to space renters and sellers. SPACER is your gateway to a constant stream of new clients.
                </p>
            </div>
            </div>

            <div className="text-center pt-12">
            <h2 className="text-3xl font-bold font-headline mb-4">Join Our Growing Community</h2>
            <p className="max-w-3xl mx-auto text-primary-foreground/70">
                Whether you are looking for a space, have one to share, or provide essential event services, you have a place at SPACER. We're building more than just a marketplace; we're building a community dedicated to making great things happen in great spaces.
            </p>
            </div>
        </div>
        </div>
    </div>
  );
}
