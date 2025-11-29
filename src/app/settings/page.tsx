
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ProviderProfile, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { updateUser } from '@/lib/users';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isUserLoading_ } = useDoc<UserProfile>(userDocRef);

  const providerDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'providerProfiles', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: providerProfile, isLoading: isProviderLoading } = useDoc<ProviderProfile>(providerDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    const fullName = userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.displayName || '');
    if (user) {
      form.reset({
        fullName: fullName,
        email: user.email || '',
        phone: userProfile?.phoneNumber || providerProfile?.phone || user.phoneNumber || '',
      });
    }
  }, [user, userProfile, providerProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore) return;
    try {
      const [firstName, ...lastName] = data.fullName.split(' ');
      await updateUser(user, { 
        firstName, 
        lastName: lastName.join(' '), 
        phoneNumber: data.phone 
      });
      if (providerProfile) {
        const providerRef = doc(firestore, "providerProfiles", user.uid);
        await updateDoc(providerRef, {
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
        });
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update your profile.',
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const isLoading = isUserLoading || isUserLoading_ || isProviderLoading;

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <Card className="max-w-3xl mx-auto bg-white/5 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Profile Settings</CardTitle>
          <CardDescription className="text-white/70">Manage your personal information and account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
                <div className="flex items-center gap-4"><Skeleton className="h-20 w-20 rounded-full" /><div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div></div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                <Skeleton className="h-10 w-1/3 ml-auto" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-white/5">
                    <Avatar className="h-24 w-24 border-4 border-primary/50">
                        <AvatarImage src={providerProfile?.profilePhotoUrl || user?.photoURL || ''} alt={form.watch('fullName')} />
                        <AvatarFallback className="text-3xl">{getInitials(form.watch('fullName'))}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{form.watch('fullName')}</h2>
                        <p className="text-white/70">{form.watch('email')}</p>
                        {userProfile?.verificationStatus === 'verified' && (
                            <Badge variant="default" className="mt-2 bg-green-500/80 hover:bg-green-500">
                                <CheckCircle className="mr-2 h-4 w-4"/>
                                Verified Member
                            </Badge>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t border-white/10">Editable Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Suresh P" {...field} className="bg-white/10 border-white/20"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+91 98765 43210" {...field} className="bg-white/10 border-white/20"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} disabled className="bg-white/10 border-white/20 disabled:opacity-70"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {providerProfile && (
                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-lg font-semibold mb-4">Verified Information (Read-only)</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem><FormLabel>Aadhaar Number</FormLabel><Input value={providerProfile.aadhaarNumber ? `**** **** ${providerProfile.aadhaarNumber.slice(-4)}` : 'N/A'} disabled className="bg-white/10 border-white/20"/></FormItem>
                                <FormItem><FormLabel>PAN Number</FormLabel><Input value={providerProfile.panNumber ? `*****${providerProfile.panNumber.slice(-4)}` : 'N/A'} disabled className="bg-white/10 border-white/20"/></FormItem>
                            </div>
                            <FormItem><FormLabel>Address</FormLabel><Input value={providerProfile.address ? `${providerProfile.address.door}, ${providerProfile.address.street}, ${providerProfile.address.city}` : 'N/A'} disabled className="bg-white/10 border-white/20"/></FormItem>
                        </div>
                    </div>
                )}
                
                <CardFooter className="p-0 pt-6 flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
