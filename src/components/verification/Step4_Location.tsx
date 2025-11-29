
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, MapPin, LocateFixed } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const locationSchema = z.object({
  liveLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  detectedCity: z.string().min(1, 'Could not detect city.'),
  detectedState: z.string().min(1, 'Could not detect state.'),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface Step4Props {
  onNext: (data: LocationFormValues) => void;
  onPrevious: () => void;
  defaultValues?: Partial<LocationFormValues>;
}

export default function Step4_Location({ onNext, onPrevious, defaultValues }: Step4Props) {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { ...defaultValues }
  });
  
  const hasLocation = !!form.watch('liveLocation.latitude');

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('liveLocation.latitude', latitude);
        form.setValue('liveLocation.longitude', longitude);
        
        // Simple reverse geocoding (use a service like Google Maps Geocoding API for production)
        try {
            // Placeholder for a real geocoding service
            // This is a simplified example
            form.setValue('detectedCity', "Auto-Detected City");
            form.setValue('detectedState', "Auto-Detected State");
            toast({ title: "Location Captured!", description: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        } catch (error) {
            toast({ title: "Could not get address", description: "Please enter manually.", variant: "destructive" });
        } finally {
            setIsLocating(false);
        }
      },
      (error) => {
        toast({ title: "Geolocation failed", description: error.message, variant: "destructive" });
        setIsLocating(false);
      }
    );
  };

  return (
    <Card className="bg-white/5 border-primary/20 backdrop-blur-sm animate-fade-in-up">
      <CardHeader><CardTitle className="text-2xl font-headline">4. Current Live Location</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-white/20 rounded-lg bg-white/5">
                <MapPin className="mx-auto h-12 w-12 text-primary/70 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Confirm Your Presence</h3>
                <p className="text-white/70 mb-6">We need to verify your current location to ensure security and trust on the platform.</p>
                <Button type="button" onClick={handleGetLocation} disabled={isLocating} size="lg">
                    <LocateFixed className={`mr-2 h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Getting Location...' : 'Get My Current Location'}
                </Button>
            </div>
            
            {hasLocation && (
                 <div className="p-4 bg-green-900/50 rounded-lg border border-green-500/30 animate-fade-in-up">
                    <h4 className="font-semibold text-green-300">Location Captured Successfully</h4>
                    <p className="text-sm text-white/80">Latitude: {form.getValues('liveLocation.latitude').toFixed(4)}</p>
                    <p className="text-sm text-white/80">Longitude: {form.getValues('liveLocation.longitude').toFixed(4)}</p>
                 </div>
            )}
            {isLocating && !hasLocation && <Skeleton className="h-20 w-full bg-white/10" />}
            
             <FormMessage>{form.formState.errors.liveLocation?.latitude?.message}</FormMessage>

            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={onPrevious}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
              <Button type="submit" disabled={!hasLocation || isLocating}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
