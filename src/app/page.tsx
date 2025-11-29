'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <div className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden p-4">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center animate-pan-background z-0"
        style={heroImage ? { backgroundImage: `url(${heroImage.imageUrl})` } : {}}
        data-ai-hint={heroImage?.imageHint}
      />
      <div className="relative z-20 container mx-auto px-4 text-center flex flex-col items-center">
          <div className="max-w-2xl mx-auto p-8 sm:p-10 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-border-pulse">
              <h1 className="font-calligraphy text-6xl md:text-8xl font-bold tracking-tight animate-hero-pop-in">
              SPACER
              </h1>
              <p className="mt-4 font-tagline text-xl md:text-2xl max-w-3xl mx-auto text-primary-foreground/90 animate-hero-pop-in animation-delay-500">
                  SPACE THAT WORKS, SERVICES THAT SERVE
              </p>
          </div>
          <div className="mt-12 animate-fade-in-up animation-delay-500">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground animate-border-pulse shadow-lg shadow-primary/30 w-full sm:w-auto">
              <Link href="/search">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              </Button>
          </div>
      </div>
    </div>
  );
}
