
"use client";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Home, Search, Heart, User as UserIcon, Briefcase } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BuyerLayout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
      if(!user || !firestore) return null;
      return query(collection(firestore, 'notifications'), where('userId', '==', user.uid), where('read', '==', false));
  }, [user, firestore]);
  const { data: unreadNotifications } = useCollection(notificationsQuery);
  const unreadCount = unreadNotifications?.length || 0;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-indigo-900/30 to-black/50 opacity-50"></div>
      </div>

      <header className="flex items-center justify-between p-4 sticky top-0 z-30 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/70 to-transparent backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-white hover:bg-white/10" />
          <h1 className="text-xl font-bold font-heading">{title || "Dashboard"}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/buyer/notifications" className="relative p-2 hover:bg-white/10 rounded-full transition-colors duration-300">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">{unreadCount}</span>
            )}
          </Link>
          <Link href="/settings">
             <Avatar className="h-9 w-9 border-2 border-primary/50 hover:border-primary transition-all">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="w-full h-full">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-black/50 backdrop-blur-lg border border-white/20 rounded-full p-2 flex justify-around items-center md:hidden z-40 animate-fade-in-up">
        <Link href="/dashboard/buyer" className="flex flex-col items-center text-xs text-white/80 hover:text-primary transition-colors gap-1 p-2">
            <Home className="h-5 w-5" />
            <span>Home</span>
        </Link>
        <Link href="/dashboard/buyer/search" className="flex flex-col items-center text-xs text-white/80 hover:text-primary transition-colors gap-1 p-2">
            <Search className="h-5 w-5" />
            <span>Spaces</span>
        </Link>
        <Link href="/dashboard/buyer/add-new-service" className="flex flex-col items-center text-xs text-white/80 hover:text-primary transition-colors gap-1 p-2">
            <Briefcase className="h-5 w-5" />
            <span>Services</span>
        </Link>
        <Link href="/dashboard/buyer/bookings" className="flex flex-col items-center text-xs text-white/80 hover:text-primary transition-colors gap-1 p-2">
            <Heart className="h-5 w-5" />
            <span>Bookings</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-xs text-white/80 hover:text-primary transition-colors gap-1 p-2">
            <UserIcon className="h-5 w-5" />
            <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
