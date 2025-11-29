'use client';

import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">SPACER</span>
          </div>
          <nav className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-sm text-muted-foreground mb-4 md:mb-0">
            <Link href="/about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} SPACER. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
