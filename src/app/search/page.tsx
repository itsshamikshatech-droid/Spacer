
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Building, Wrench, ArrowLeft } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const roles = [
  {
    icon: ShoppingBag,
    title: 'Space Buyer',
    description: 'Find and book the perfect space for any event, meeting, or activity.',
    link: '/dashboard/buyer',
    cta: 'Find a Space',
  },
  {
    icon: Building,
    title: 'Space Seller',
    description: 'List your underutilized space and start earning. It’s simple and profitable.',
    link: '/dashboard/seller',
    cta: 'List Your Space',
  },
  {
    icon: Wrench,
    title: 'Service Provider',
    description: 'Offer your services to a wide range of events and spaces. Grow your business.',
    link: '/dashboard/provider',
    cta: 'Become a Provider',
  },
];

export default function SearchPage() {
    const { user, isUserLoading } = useUser();
    useAuthRedirect({ to: '/login', if: 'unauthenticated' });
    const router = useRouter();
    const heroImage = PlaceHolderImages.find(img => img.id === 'auth-background');

    if (isUserLoading || !user) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
                <p>Loading...</p>
            </div>
        )
    }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start text-white py-8">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
        <div
            className="absolute inset-0 bg-cover bg-center animate-pan-background z-0"
            style={heroImage ? { backgroundImage: `url(${heroImage.imageUrl})` } : {}}
            data-ai-hint={heroImage?.imageHint}
        />
        
        <div className="relative z-20 container mx-auto px-4 w-full flex flex-col flex-1">
            <div className="absolute top-0 left-4 z-30 md:relative md:top-0 md:left-0 md:mb-8 md:self-start">
                <Button variant="outline" size="icon" className="bg-transparent hover:bg-white/10 text-white" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Go back home</span>
                </Button>
            </div>
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">How will you use SPACER?</h1>
                <p className="mt-4 text-lg text-primary-foreground/80 animate-fade-in-up animation-delay-500">
                Choose your primary role to get started. You can always change roles later by returning to this page.
                </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
                {roles.map((role, index) => (
                <Card
                    key={role.title}
                    className="text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/40 bg-card/50 backdrop-blur-lg border-white/10 text-white animate-fade-in-up w-full"
                    style={{ animationDelay: `${500 + index * 200}ms` }}
                >
                    <CardHeader className="items-center">
                    <div className="p-4 bg-white/10 rounded-full border border-white/20 transition-all duration-300 group-hover:bg-primary/20">
                        <role.icon className="h-10 w-10 text-primary transition-all duration-300 group-hover:text-white" />
                    </div>
                    <CardTitle className="mt-4 font-heading text-2xl">{role.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-primary-foreground/70">{role.description}</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-primary/80 hover:bg-primary text-primary-foreground">
                        <Link href={role.link}>{role.cta}</Link>
                    </Button>
                    </div>
                </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
