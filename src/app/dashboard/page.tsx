'use client';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      if(auth) {
        await signOut(auth);
      }
      router.push('/search');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isUserLoading) {
    return <div>Loading...</div>;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
        <div className="flex items-center gap-4">
            {user && (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            )}
            <Button onClick={handleSignOut} variant="ghost">
                Sign Out
            </Button>
        </div>
      </div>
      <p className="text-lg text-muted-foreground">Welcome to your dashboard, {user?.displayName || 'User'}!</p>
    </div>
  );
}
