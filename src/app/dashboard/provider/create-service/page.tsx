
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Upload, X } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import type { Service, ProviderProfile } from '@/lib/types';
import ProviderLayout from '@/components/layouts/ProviderLayout';
import { Skeleton } from '@/components/ui/skeleton';

const serviceCategories = ["Cleaning", "Photography", "Catering", "Sound System", "Decoration", "AV Tech", "Others"];

const createServiceSchema = z.object({
  serviceCategory: z.string().min(1, 'Category is required'),
  otherCategory: z.string().optional(),
  skillDescription: z.string().min(20, 'Description must be at least 20 characters'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  costPerHour: z.coerce.number().min(1, 'Cost must be a positive number'),
  minimumHours: z.coerce.number().min(1, 'Minimum hours must be at least 1'),
  locationRadius: z.coerce.number().min(1, 'Please specify a travel radius'),
}).refine(data => {
    if (data.serviceCategory === 'Others') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: 'Please specify the category',
    path: ['otherCategory'],
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

export default function CreateServicePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [certPreviews, setCertPreviews] = useState<string[]>([]);

  const providerProfileRef = useMemoFirebase(() => {
    if(!firestore || !user) return null;
    return doc(firestore, 'providerProfiles', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<ProviderProfile>(providerProfileRef);

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      experience: 1,
      costPerHour: 500,
      minimumHours: 2,
      locationRadius: 10,
      serviceCategory: '',
      otherCategory: '',
      skillDescription: '',
    },
  });

  const selectedCategory = form.watch('serviceCategory');

  async function onSubmit(data: CreateServiceFormValues) {
    if (!firestore || !user || !profile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be a verified provider to create a service.' });
      return;
    }
    const servicesCollection = collection(firestore, 'services');
    
    // In a real app, upload files to get URLs. For now, we use data URIs.
    const finalCategory = data.serviceCategory === 'Others' ? data.otherCategory : data.serviceCategory;

    const newServiceData: Omit<Service, 'id'> = {
      ...data,
      serviceCategory: finalCategory!,
      providerId: user.uid,
      providerName: profile.fullName,
      providerPhotoUrl: profile.profilePhotoUrl,
      portfolioImages: [],
      certifications: [],
      availability: { dates: [], timeRanges: '9am-5pm' }, // Placeholder
      verificationStatus: 'verified', // Or 'pending' if admin approval is needed
      createdAt: serverTimestamp(),
    };

    addDoc(servicesCollection, newServiceData)
      .then(() => {
        toast({ title: 'Service Created!', description: 'Your new service is now listed for buyers.' });
        router.push('/dashboard/provider/my-applications');
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: servicesCollection.path,
            operation: 'create',
            requestResourceData: newServiceData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleFileUpload = (files: FileList | null, type: 'portfolio' | 'certs') => {
    if (files) {
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      if (type === 'portfolio') {
        setPortfolioPreviews(prev => [...prev, ...newPreviews]);
      } else {
        setCertPreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };
  
  const removePhoto = (index: number, type: 'portfolio' | 'certs') => {
     if (type === 'portfolio') {
        setPortfolioPreviews(prev => prev.filter((_, i) => i !== index));
      } else {
        setCertPreviews(prev => prev.filter((_, i) => i !== index));
      }
  };

  if (isProfileLoading) {
      return <ProviderLayout title="Loading..."><Skeleton className="w-full h-screen"/></ProviderLayout>
  }

  return (
    <ProviderLayout title="Create a New Service">
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg"><Briefcase className="h-8 w-8 text-primary" /></div>
                <div>
                  <CardTitle className="text-3xl font-headline">Create a Service</CardTitle>
                  <CardDescription className="text-lg text-white/70">Define a service you want to offer to space buyers.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                    <h3 className="text-xl font-semibold font-headline">Service Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="serviceCategory" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Service Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>{serviceCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        {selectedCategory === 'Others' && (
                            <FormField control={form.control} name="otherCategory" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specify Category</FormLabel>
                                    <FormControl><Input placeholder="e.g., Event Management" {...field} className="bg-white/10 border-white/20"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        <FormField control={form.control} name="experience" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience (Years)</FormLabel>
                                <FormControl><Input type="number" placeholder="5" {...field} className="bg-white/10 border-white/20"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="skillDescription" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Skill Description</FormLabel>
                            <FormControl><Textarea placeholder="Describe your service, what's included, and what makes you the right choice." className="min-h-[120px] bg-white/10 border-white/20" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  
                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                    <h3 className="text-xl font-semibold font-headline">Pricing & Logistics</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <FormField control={form.control} name="costPerHour" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cost Per Hour</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>₹</span>
                                    <FormControl><Input type="number" placeholder="1500" {...field} className="pl-8 bg-white/10 border-white/20"/></FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="minimumHours" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Hours</FormLabel>
                                <FormControl><Input type="number" placeholder="2" {...field} className="bg-white/10 border-white/20"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="locationRadius" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Travel Radius (km)</FormLabel>
                                <FormControl><Input type="number" placeholder="25" {...field} className="bg-white/10 border-white/20"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                     </div>
                  </div>

                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                    <h3 className="text-xl font-semibold font-headline">Portfolio & Certifications</h3>
                     <FormItem>
                        <FormLabel>Portfolio Images</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {portfolioPreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="object-cover rounded-lg"/>
                                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index, 'portfolio')}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                             <label htmlFor="portfolio-upload" className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 border-white/20">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Add Photos</span></p>
                                </div>
                                <Input id="portfolio-upload" type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e.target.files, 'portfolio')}/>
                            </label>
                        </div>
                    </FormItem>
                     <FormItem>
                        <FormLabel>Certifications (Optional)</FormLabel>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {certPreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="object-cover rounded-lg"/>
                                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index, 'certs')}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                             <label htmlFor="cert-upload" className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 border-white/20">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Add Certs</span></p>
                                </div>
                                <Input id="cert-upload" type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e.target.files, 'certs')}/>
                            </label>
                        </div>
                    </FormItem>
                  </div>

                  <CardFooter className="flex justify-end gap-4 p-0 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.push('/dashboard/provider')} className="bg-transparent hover:bg-white/10 border-white/20">Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">Create Service</Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </ProviderLayout>
  );
}
