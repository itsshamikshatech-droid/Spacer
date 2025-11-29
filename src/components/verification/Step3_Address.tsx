
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Image from 'next/image';
import { useState } from 'react';

const addressSchema = z.object({
  address: z.object({
    door: z.string().min(1, 'Door/Building is required'),
    street: z.string().min(3, 'Street is required'),
    area: z.string().min(3, 'Area is required'),
    city: z.string().min(3, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be at least 6 digits'),
    country: z.string().min(2, 'Country is required'),
  }),
  addressProofUrl: z.string().optional(),
  addressProofType: z.enum(['Electricity Bill', 'Rent Agreement', 'Bank Statement']),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Step3Props {
  onNext: (data: Omit<AddressFormValues, 'addressProofUrl'>) => void;
  onPrevious: () => void;
  defaultValues?: Partial<AddressFormValues>;
}

export default function Step3_Address({ onNext, onPrevious, defaultValues }: Step3Props) {
  const [preview, setPreview] = useState<string | null>(defaultValues?.addressProofUrl || null);
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: {
        door: defaultValues?.address?.door || '',
        street: defaultValues?.address?.street || '',
        area: defaultValues?.address?.area || '',
        city: defaultValues?.address?.city || '',
        state: defaultValues?.address?.state || '',
        pincode: defaultValues?.address?.pincode || '',
        country: defaultValues?.address?.country || 'India',
      },
      addressProofUrl: defaultValues?.addressProofUrl || undefined,
      addressProofType: defaultValues?.addressProofType,
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        form.setValue('addressProofUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFormSubmit = (data: AddressFormValues) => {
    const { addressProofUrl, ...rest } = data;
    onNext(rest);
  };


  return (
    <Card className="bg-white/5 border-primary/20 backdrop-blur-sm animate-fade-in-up">
        <CardHeader><CardTitle className="text-2xl font-headline">3. Address Verification</CardTitle></CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address.door" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Door No / Building</FormLabel>
                            <FormControl><Input placeholder="12-B" {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address.street" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl><Input placeholder="Orion Street" {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="address.area" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area / Locality</FormLabel>
                        <FormControl><Input placeholder="Galaxy Heights" {...field} className="bg-white/10 border-white/20"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address.city" render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="Mumbai" {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address.state" render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl><Input placeholder="Maharashtra" {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="address.pincode" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl><Input placeholder="400001" {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address.country" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl><Input {...field} className="bg-white/10 border-white/20"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="font-medium">Address Proof</h3>
                     <FormField control={form.control} name="addressProofType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Select a document type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Electricity Bill">Electricity Bill</SelectItem>
                                <SelectItem value="Rent Agreement">Rent Agreement</SelectItem>
                                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormItem className="flex flex-col items-center">
                        <FormLabel>Upload Document</FormLabel>
                        <FormControl>
                            <label className="cursor-pointer w-full">
                                <div className="w-full h-40 rounded-lg bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30 hover:border-primary transition-colors">
                                    {preview ? (
                                        <Image src={preview} alt="Address proof preview" width={200} height={160} className="h-full w-auto object-contain rounded-md"/>
                                    ) : (
                                        <div className="text-center text-white/60">
                                            <Upload className="w-10 h-10 mx-auto mb-2" />
                                            <p>Click to upload</p>
                                        </div>
                                    )}
                                </div>
                                <Input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                            </label>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>


                <div className="flex justify-between items-center pt-4">
                    <Button type="button" variant="outline" onClick={onPrevious}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="submit">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
