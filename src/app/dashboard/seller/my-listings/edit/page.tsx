
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building, MapPin, Users, Upload, Briefcase, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import type { Space } from '@/lib/types';
import Image from 'next/image';

const purposeList = ['Meeting', 'Event', 'Photoshoot', 'Workshop', 'Rooftop'];

const listSpaceSchema = z.object({
  name: z.string().min(5, 'Space name must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(5, 'Location is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  price: z.coerce.number().min(1, 'Price must be a positive number'),
  purpose: z.string().min(1, 'Purpose is required'),
});

type ListSpaceFormValues = z.infer<typeof listSpaceSchema>;

const fileToDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export default function EditSpacePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const spaceDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'spaces', id as string);
  }, [firestore, id]);

  const { data: space, isLoading } = useDoc<Space>(spaceDocRef);

  const form = useForm<ListSpaceFormValues>({
    resolver: zodResolver(listSpaceSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      capacity: 10,
      price: 100,
      purpose: '',
    },
  });

  useEffect(() => {
    if (space) {
      form.reset({
        name: space.name,
        description: space.description || '',
        location: space.location,
        capacity: space.capacity,
        price: space.price,
        purpose: space.purpose,
      });
      if(space.photoUrls) {
        setPhotoPreviews(space.photoUrls);
      }
    }
  }, [space, form]);

  async function onSubmit(data: ListSpaceFormValues) {
    if (!spaceDocRef) return;
    
    try {
        // Keep existing URLs that weren't removed
        const existingUrls = photoPreviews.filter(p => p.startsWith('https://'));
        
        // Convert new files to data URIs
        const newFileUrls = await Promise.all(photoFiles.map(file => fileToDataUri(file)));

        const finalPhotoUrls = [...existingUrls, ...newFileUrls];

        await updateDoc(spaceDocRef, { ...data, photoUrls: finalPhotoUrls });

        toast({
            title: "Listing Updated",
            description: "Your space details have been saved.",
        });
        router.push('/dashboard/seller/my-listings');

    } catch (error) {
        console.error("Error updating space:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes. Please try again.",
        });
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setPhotoFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    const urlToRemove = photoPreviews[index];
    
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));

    // If it's a blob URL (a new file), find the corresponding file and remove it.
    if (urlToRemove.startsWith('blob:')) {
      const fileIndex = photoFiles.findIndex(file => URL.createObjectURL(file) === urlToRemove);
      if (fileIndex !== -1) {
          setPhotoFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white overflow-hidden animate-fade-in-up p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto w-full">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 bg-transparent">
            <CardHeader><Skeleton className="h-12 w-1/2" /></CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4 p-6 border rounded-lg"><Skeleton className="h-32 w-full" /></div>
              <div className="space-y-4 p-6 border rounded-lg"><Skeleton className="h-24 w-full" /></div>
              <div className="space-y-4 p-6 border rounded-lg"><Skeleton className="h-24 w-full" /></div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" /></CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white overflow-hidden animate-fade-in-up p-4 sm:p-6 lg:p-8">
       <div aria-hidden className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black opacity-80"></div>
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="ghost" className="hover:bg-white/10 text-white">
                <Link href="/dashboard/seller/my-listings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Listings
                </Link>
              </Button>
          </div>
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                      <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                      <CardTitle className="text-3xl font-headline">Edit Your Space</CardTitle>
                      <CardDescription className="text-lg text-white/70">
                      Update the details below for your space listing.
                      </CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                      <h3 className="text-xl font-semibold font-headline">Basic Information</h3>
                      <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Space Name</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., The Sunrise Conference Room" {...field} className="bg-white/10 border-white/20"/>
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                              <Textarea
                              placeholder="Describe what makes your space unique."
                              className="min-h-[120px] bg-white/10 border-white/20"
                              {...field}
                              />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                  </div>

                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                      <h3 className="text-xl font-semibold font-headline">Space Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Location / Address</FormLabel>
                                  <div className="relative">
                                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      <FormControl>
                                      <Input placeholder="123 Main St, Anytown, USA" {...field} className="pl-10 bg-white/10 border-white/20"/>
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="capacity"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Maximum Capacity</FormLabel>
                                  <div className="relative">
                                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      <FormControl>
                                      <Input type="number" placeholder="50" {...field} className="pl-10 bg-white/10 border-white/20"/>
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (per hour)</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>₹</span>
                                    <FormControl>
                                    <Input type="number" placeholder="1500" {...field} className="pl-8 bg-white/10 border-white/20"/>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purpose</FormLabel>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="pl-10 bg-white/10 border-white/20">
                                        <SelectValue placeholder="Select a purpose" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {purposeList.map((purpose) => (
                                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                                      ))}
                                    </SelectContent>
                                </Select>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                  </div>
                  
                  <div className="space-y-4 p-6 border border-white/10 rounded-lg">
                       <h3 className="text-xl font-semibold font-headline">Upload Photos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {photoPreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="object-cover rounded-lg"/>
                                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                             <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 border-white/20">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload}/>
                            </label>
                        </div>
                  </div>
                  
                  <CardFooter className="flex justify-end gap-4 p-0 pt-4">
                      <Button variant="outline" type="button" onClick={() => router.back()} className="bg-transparent hover:bg-white/10 border-white/20">
                          Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          Save Changes
                      </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
