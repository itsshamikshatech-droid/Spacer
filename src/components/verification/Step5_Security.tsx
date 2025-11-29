
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Send } from 'lucide-react';

const securitySchema = z.object({
  securityQuestions: z.object({
    why: z.string().min(20, 'Please provide a more detailed answer (min 20 characters).'),
    experience: z.string().min(20, 'Please describe your experience in more detail (min 20 characters).'),
    verifiedWork: z.string().min(10, 'This field is required.'),
    emergencyContact: z.string().min(10, 'Please provide valid emergency contact details.'),
  }),
});

type SecurityFormValues = z.infer<typeof securitySchema>;

interface Step5Props {
  onSubmit: (data: SecurityFormValues) => void;
  onPrevious: () => void;
  defaultValues?: Partial<SecurityFormValues>;
  isSubmitting: boolean;
}

export default function Step5_Security({ onSubmit, onPrevious, defaultValues, isSubmitting }: Step5Props) {
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { ...defaultValues }
  });

  return (
    <Card className="bg-white/5 border-primary/20 backdrop-blur-sm animate-fade-in-up">
      <CardHeader><CardTitle className="text-2xl font-headline">5. Security Questions</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField control={form.control} name="securityQuestions.why" render={({ field }) => (
                <FormItem>
                    <FormLabel>Why do you want to join as a service provider?</FormLabel>
                    <FormControl><Textarea placeholder="Tell us about your motivation..." {...field} className="bg-white/10 border-white/20 min-h-[100px]"/></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="securityQuestions.experience" render={({ field }) => (
                <FormItem>
                    <FormLabel>Describe your expertise and years of experience.</FormLabel>
                    <FormControl><Textarea placeholder="e.g., I am a professional photographer with 5 years of experience in event and portrait photography." {...field} className="bg-white/10 border-white/20 min-h-[100px]"/></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="securityQuestions.verifiedWork" render={({ field }) => (
                <FormItem>
                    <FormLabel>Have you done verified work before? Provide details.</FormLabel>
                    <FormControl><Textarea placeholder="Mention any previous platforms or clients." {...field} className="bg-white/10 border-white/20 min-h-[100px]"/></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="securityQuestions.emergencyContact" render={({ field }) => (
                <FormItem>
                    <FormLabel>Emergency contact details + relationship.</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Suresh P - Father, +91 9876543210" {...field} className="bg-white/10 border-white/20 min-h-[60px]"/></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={onPrevious} disabled={isSubmitting}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent">
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'} <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
