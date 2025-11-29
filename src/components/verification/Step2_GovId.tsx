
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const govIdSchema = z.object({
  aadhaarNumber: z.string().length(12, 'Aadhaar must be 12 digits'),
  aadhaarFrontUrl: z.string().optional(),
  aadhaarBackUrl: z.string().optional(),
  panNumber: z.string().length(10, 'PAN must be 10 characters'),
  panUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
});

type GovIdFormValues = z.infer<typeof govIdSchema>;

interface Step2Props {
  onNext: (data: Omit<GovIdFormValues, 'aadhaarFrontUrl' | 'aadhaarBackUrl' | 'panUrl' | 'selfieUrl'>) => void;
  onPrevious: () => void;
  defaultValues?: Partial<GovIdFormValues>;
}

const FileUpload = ({ label, onFileChange, preview }: { label: string, onFileChange: (file: File) => void, preview: string | null }) => (
    <FormItem className="flex flex-col items-center">
        <FormLabel>{label}</FormLabel>
        <FormControl>
             <label className="cursor-pointer w-full">
                <div className="w-full h-32 rounded-lg bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30 hover:border-primary transition-colors">
                    {preview ? (
                        <Image src={preview} alt={`${label} preview`} width={128} height={128} className="h-full w-auto object-contain rounded-md"/>
                    ) : (
                        <Upload className="w-10 h-10 text-white/50" />
                    )}
                </div>
                <Input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])} />
            </label>
        </FormControl>
        <FormMessage />
    </FormItem>
);

export default function Step2_GovId({ onNext, onPrevious, defaultValues }: Step2Props) {
  const form = useForm<GovIdFormValues>({
    resolver: zodResolver(govIdSchema),
    defaultValues: {
        aadhaarNumber: defaultValues?.aadhaarNumber || '',
        panNumber: defaultValues?.panNumber || '',
        aadhaarFrontUrl: defaultValues?.aadhaarFrontUrl || undefined,
        aadhaarBackUrl: defaultValues?.aadhaarBackUrl || undefined,
        panUrl: defaultValues?.panUrl || undefined,
        selfieUrl: defaultValues?.selfieUrl || undefined,
    }
  });

  const [previews, setPreviews] = useState({
      aadhaarFront: defaultValues?.aadhaarFrontUrl || null,
      aadhaarBack: defaultValues?.aadhaarBackUrl || null,
      pan: defaultValues?.panUrl || null,
      selfie: defaultValues?.selfieUrl || null,
  });

  const handleFileChange = (field: keyof GovIdFormValues, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      form.setValue(field, result, { shouldValidate: true });
      
      const previewKey = field.replace('Url', '') as keyof typeof previews;
      setPreviews(p => ({ ...p, [previewKey]: result }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleFormSubmit = (data: GovIdFormValues) => {
    const { aadhaarFrontUrl, aadhaarBackUrl, panUrl, selfieUrl, ...rest } = data;
    onNext(rest);
  };

  return (
    <Card className="bg-white/5 border-primary/20 backdrop-blur-sm animate-fade-in-up">
        <CardHeader><CardTitle className="text-2xl font-headline">2. Government ID Verification</CardTitle></CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Aadhaar Number</FormLabel>
                        <FormControl><Input placeholder="XXXX XXXX XXXX" {...field} className="bg-white/10 border-white/20"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUpload label="Aadhaar Front" preview={previews.aadhaarFront} onFileChange={(file) => handleFileChange('aadhaarFrontUrl', file)} />
                    <FileUpload label="Aadhaar Back" preview={previews.aadhaarBack} onFileChange={(file) => handleFileChange('aadhaarBackUrl', file)} />
                </div>
                
                 <FormField control={form.control} name="panNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl><Input placeholder="ABCDE1234F" {...field} className="bg-white/10 border-white/20"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUpload label="PAN Card Photo" preview={previews.pan} onFileChange={(file) => handleFileChange('panUrl', file)} />
                    <FileUpload label="Selfie for Verification" preview={previews.selfie} onFileChange={(file) => handleFileChange('selfieUrl', file)} />
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
