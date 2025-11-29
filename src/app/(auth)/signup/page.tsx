'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Lock, User, Rocket, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { saveUser } from '@/lib/users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignupPage() {
    const router = useRouter();
    const auth = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const authImage = PlaceHolderImages.find(img => img.id === 'auth-background');

    const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth) return;
    const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
    if (userCredential?.user) {
      await saveUser(userCredential.user);
      router.push('/search');
    }
  }

  return (
    <div className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center animate-pan-background z-0"
          style={authImage ? { backgroundImage: `url(${authImage.imageUrl})` } : {}}
          data-ai-hint={authImage?.imageHint}
        />
        <div className="relative z-20 container mx-auto px-4 flex items-center justify-center">
            <div className="w-full max-w-md">
            <div className="mb-4">
                <Button asChild variant="outline" className="bg-transparent hover:bg-white/10 text-white">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
                </Button>
            </div>
            <Card className="w-full bg-black/50 backdrop-blur-xl border-white/20 text-white animate-fade-in-up animate-border-pulse">
                <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-white/10 p-3 rounded-full border border-white/20">
                    <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold font-headline">Create Your Account</CardTitle>
                <CardDescription className="text-primary-foreground/80 pt-2">Join SPACER to find your next great space.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
                                <Input placeholder="Sruthi K" {...field} className="pl-10 bg-white/10 border-white/20 focus:bg-white/20 transition-colors duration-300" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
                                <Input type="email" placeholder="you@example.com" {...field} className="pl-10 bg-white/10 border-white/20 focus:bg-white/20 transition-colors duration-300" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
                                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} className="pl-10 pr-10 bg-white/10 border-white/20 focus:bg-white/20 transition-colors duration-300" />
                                <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-primary-foreground/50"
                                onClick={() => setShowPassword(!showPassword)}
                                >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="pt-4">
                        <Button type="submit" className="w-full" size="lg">Create Account</Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-primary-foreground/70">
                    Already have an an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Log In
                    </Link>
                </p>
                </CardFooter>
            </Card>
            </div>
        </div>
    </div>
  );
}
