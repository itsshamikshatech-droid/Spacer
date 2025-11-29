
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Briefcase,
  Building,
  Heart,
  LayoutGrid,
  LogOut,
  Settings,
  Rocket,
  Users,
  Search as SearchIcon,
  Bell,
  IndianRupee,
  Calendar,
  PlusCircle,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const isBuyer = pathname.startsWith('/dashboard/buyer');
  const isSeller = pathname.startsWith('/dashboard/seller') || pathname === '/list-new-space';
  const isProvider = pathname.startsWith('/dashboard/provider');

  return (
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <Link href="/settings" className="block">
              <div className="flex items-center gap-3 p-2 hover:bg-sidebar-accent/50 rounded-md transition-colors">
                <Avatar>
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.displayName || user?.email}
                  </span>
                  <span className="text-xs text-sidebar-foreground/70 truncate">
                    {isBuyer ? 'Space Buyer' : isSeller ? 'Space Seller' : isProvider ? 'Service Provider' : 'User'}
                  </span>
                </div>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                 <Link href="/search" passHref>
                    <SidebarMenuButton tooltip={{children: 'Change Role'}}>
                        <Users />
                        Change Role
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
            </SidebarMenu>
            
            <SidebarMenu>
              {isBuyer && (
                <>
                  <SidebarMenuItem>
                    <Link href="/dashboard/buyer" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer'} tooltip={{children: 'Dashboard'}}>
                        <Rocket />
                        Dashboard
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/buyer/search" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer/search'} tooltip={{children: 'Search Spaces'}}>
                        <SearchIcon />
                        Search Spaces
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/buyer/bookings" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer/bookings'} tooltip={{children: 'My Bookings'}}>
                        <Heart />
                        My Bookings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <Link href="/dashboard/buyer/add-new-service" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer/add-new-service'} tooltip={{children: 'Add Services'}}>
                        <PlusCircle />
                        Add Services
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <Link href="/dashboard/buyer/my-service-bookings" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer/my-service-bookings'} tooltip={{children: 'My Service Bookings'}}>
                        <Briefcase />
                        My Service Bookings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <Link href="/dashboard/buyer/notifications" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/buyer/notifications'} tooltip={{children: 'Notifications'}}>
                        <Bell />
                        Notifications
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}

              {isSeller && (
                <>
                  <SidebarMenuItem>
                    <Link href="/dashboard/seller" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/seller'} tooltip={{children: 'Seller Dashboard'}}>
                        <Building />
                        Seller Dashboard
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/list-new-space" passHref>
                      <SidebarMenuButton isActive={pathname === '/list-new-space'} tooltip={{children: 'List a Space'}}>
                        <PlusCircle />
                        List a Space
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/seller/my-listings" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/dashboard/seller/my-listings')} tooltip={{children: 'My Listings'}}>
                        <LayoutGrid />
                        My Listings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/seller/booking-requests" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/seller/booking-requests'} tooltip={{children: 'Booking Requests'}}>
                        <Calendar />
                        Booking Requests
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/seller/earnings" passHref>
                      <SidebarMenuButton isActive={pathname === '/dashboard/seller/earnings'} tooltip={{children: 'Earnings'}}>
                        <IndianRupee />
                        Earnings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}
              
              {isProvider && (
                 <>
                    <SidebarMenuItem>
                        <Link href="/dashboard/provider" passHref>
                            <SidebarMenuButton isActive={pathname === '/dashboard/provider'} tooltip={{children: 'Provider Dashboard'}}>
                            <Briefcase />
                            Provider Dashboard
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/dashboard/provider/create-service" passHref>
                            <SidebarMenuButton isActive={pathname === '/dashboard/provider/create-service'} tooltip={{children: 'Create Service'}}>
                            <PlusCircle />
                            Create Service
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/dashboard/provider/my-applications" passHref>
                            <SidebarMenuButton isActive={pathname === '/dashboard/provider/my-applications'} tooltip={{children: 'My Services'}}>
                            <Package />
                            My Services
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/dashboard/provider/hire-requests" passHref>
                            <SidebarMenuButton isActive={pathname === '/dashboard/provider/hire-requests'} tooltip={{children: 'Hire Requests'}}>
                            <CalendarCheck />
                            Hire Requests
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <Link href="/dashboard/provider/notifications" passHref>
                            <SidebarMenuButton isActive={pathname === '/dashboard/provider/notifications'} tooltip={{children: 'Notifications'}}>
                            <Bell />
                            Notifications
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </>
              )}
            </SidebarMenu>
            <SidebarMenu className='mt-auto'>
                <SidebarMenuItem>
                    <Link href="/settings" passHref>
                    <SidebarMenuButton isActive={pathname === '/settings'} tooltip={{children: 'Profile Settings'}}>
                        <Settings />
                        Profile
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarHeader className="border-t border-sidebar-border mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip={{children: 'Sign Out'}}>
                  <LogOut />
                  Sign Out
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        </Sidebar>
        <main className="flex-1 w-full overflow-y-auto bg-[#0b0f19]">
           {children}
        </main>
      </div>
  );
}
