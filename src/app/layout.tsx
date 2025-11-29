'use client';
import './globals.css';
import { FirebaseClientProvider } from "@/firebase/client-provider";
import React from "react";
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import DashboardLayout from './dashboard/layout';
import { SidebarProvider } from '@/components/ui/sidebar';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') || pathname === '/list-new-space' || pathname === '/settings';
  
  const isSpecialPage = ['/login', '/signup', '/search', '/'].includes(pathname);

  if (isDashboard) {
    return (
      <SidebarProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SidebarProvider>
    );
  }
  
  if (isSpecialPage) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] p-4">
        {children}
      </div>
    );
  }

  // Default layout for other pages like /about, /contact
  return (
    <div className={cn("w-full min-h-screen flex flex-col bg-[#0b0f19]")}>
        {children}
    </div>
  );
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <title>SPACER</title>
        <meta name="description" content="SPACE THAT WORKS, SERVICES THAT SERVE" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400;700&family=Fredoka:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={'font-sans antialiased min-h-screen bg-[#0b0f19] flex flex-col'}>
        <FirebaseClientProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
