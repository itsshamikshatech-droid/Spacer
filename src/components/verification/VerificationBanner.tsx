'use client';

import { BadgeCheck, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationBannerProps {
  status: 'unverified' | 'pending_verification' | 'verified' | 'rejected' | string;
  onVerify: () => void;
  role: 'Buyer' | 'Seller' | 'Provider';
}

const roleTextMap = {
    Buyer: "to access all features",
    Seller: "to list and manage spaces",
    Provider: "to offer services",
}

export function VerificationBanner({ status, onVerify, role }: VerificationBannerProps) {
  const roleText = roleTextMap[role] || "to access all features";

  if (status === 'verified') {
    return (
      <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 p-4 rounded-r-lg flex items-center gap-3 animate-fade-in-up">
        <BadgeCheck className="h-6 w-6" />
        <div>
          <p className="font-bold">Profile Verified</p>
          <p className="text-sm">You're all set! You can now access all features for your role.</p>
        </div>
      </div>
    );
  }

  if (status === 'pending_verification') {
    return (
      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-r-lg flex items-center gap-3 animate-fade-in-up">
        <Clock className="h-6 w-6" />
        <div>
          <p className="font-bold">Verification Pending</p>
          <p className="text-sm">
            Your profile is under review. This usually takes 24-48 hours. We'll notify you once it's complete.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 p-4 rounded-r-lg flex items-center justify-between gap-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <p className="font-bold">Verification Rejected</p>
            <p className="text-sm">There was an issue with your submitted documents. Please review and resubmit.</p>
          </div>
        </div>
        <Button onClick={onVerify} size="sm">
          Resubmit
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 p-4 rounded-r-lg flex items-center justify-between gap-3 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6" />
        <div>
          <p className="font-bold">Verification Needed</p>
          <p className="text-sm">Please complete verification {roleText}.</p>
        </div>
      </div>
      <Button onClick={onVerify} size="sm">
        Start Verification
      </Button>
    </div>
  );
}
