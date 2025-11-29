
'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { useState } from 'react';

const personalSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['Male', 'Female', 'Other']),
  profilePhotoUrl: z.string().url('Invalid URL').optional(),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

interface Step1Props {
  onNext: (data: Omit<PersonalFormValues, 'profilePhotoUrl'>) => void;
  defaultValues?: Partial<PersonalFormValues>;
}

export default function Step1_Personal({ onNext, defaultValues }: Step1Props) {
  const [preview, setPreview] = useState<string | null>(defaultValues?.profilePhotoUrl || null);

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
        fullName: defaultValues?.fullName || '',
        dob: defaultValues?.dob || '',
        phone: defaultValues?.phone || '',
        email: defaultValues?.email || '',
        gender: defaultValues?.gender,
        profilePhotoUrl: defaultValues?.profilePhotoUrl || undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        form.setValue('profilePhotoUrl', result); // Used for preview only
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFormSubmit = (data: PersonalFormValues) => {
    // Exclude the large data URL from the data passed to the next step
    const { profilePhotoUrl, ...rest } = data;
    onNext(rest);
  };

  return (
    <Card className="bg-white/5 border-primary/20 backdrop-blur-sm animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">1. Personal Identity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="profilePhotoUrl"
                render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                        <FormLabel>Profile Photo</FormLabel>
                        <FormControl>
                             <label htmlFor="photo-upload" className="cursor-pointer">
                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30 hover:border-primary transition-colors">
                                    {preview ? (
                                        <Image src={preview} alt="Profile preview" width={128} height={128} className="rounded-full object-cover"/>
                                    ) : (
                                        <Upload className="w-10 h-10 text-white/50" />
                                    )}
                                </div>
                                <Input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Legal Name</FormLabel>
                        <FormControl><Input placeholder="Suresh P" {...field} className="bg-white/10 border-white/20" /></FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
                 <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} className="bg-white/10 border-white/20" /></FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="+91-9876543210" {...field} className="bg-white/10 border-white/20" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} className="bg-white/10 border-white/20" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Select your gender" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
