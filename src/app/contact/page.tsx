'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const router = useRouter();

  return (
    <div className="relative text-foreground w-full flex flex-col flex-1">
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div 
        className="absolute inset-0 bg-cover bg-center animate-pan-background z-[-1]" 
        style={heroImage ? { backgroundImage: `url(${heroImage.imageUrl})` } : {}} 
        data-ai-hint={heroImage?.imageHint}
      />
      <div className="relative z-10 container mx-auto px-4 py-12 flex-1 flex flex-col">
        <div className="mb-8">
            <Button variant="outline" className="bg-transparent hover:bg-white/10 text-white" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
            <div className="max-w-2xl text-center text-white animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Contact Us</h1>
                <p className="text-lg text-primary-foreground/80">We're here to help. Reach out to us with any questions or feedback.</p>
                {/* A simple contact form could be added here */}
            </div>
        </div>
      </div>
    </div>
  );
}
