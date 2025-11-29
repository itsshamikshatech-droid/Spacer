
'use client';
import { Button } from "@/components/ui/button";
import { Bell, IndianRupee } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import SellerLayout from "@/components/layouts/SellerLayout";

export default function SellerEarningsPage() {
  const { user } = useUser();

  return (
    <SellerLayout title="Earnings">
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
            <IndianRupee className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
            <h3 className="mt-4 text-2xl font-bold font-headline">No earnings to display.</h3>
            <p className="text-lg text-white/80 mt-2">When you receive payments from bookings, your earnings and transaction history will appear here.</p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-3">
                <Link href="/dashboard/seller">Back to Dashboard</Link>
              </Button>
            </div>
        </section>
      </div>
    </SellerLayout>
  );
}
