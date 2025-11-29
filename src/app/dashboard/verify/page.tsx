
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber, StepTitle, StepDescription, Box } from '@/components/ui/stepper';
import { useSteps } from '@/hooks/use-steps';
import Step1_Personal from '@/components/verification/Step1_Personal';
import Step2_GovId from '@/components/verification/Step2_GovId';
import Step3_Address from '@/components/verification/Step3_Address';
import Step4_Location from '@/components/verification/Step4_Location';
import Step5_Security from '@/components/verification/Step5_Security';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import type { ProviderProfile } from '@/lib/types';
import { updateUser } from '@/lib/users';

const steps = [
  { label: 'Personal Info', description: 'Your identity' },
  { label: 'Government ID', description: 'Official verification' },
  { label: 'Address', description: 'Where you live' },
  { label: 'Live Location', description: 'Confirm your presence' },
  { label: 'Security', description: 'Account safety' },
];

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const { activeStep, goToNext, goToPrevious, setStep } = useSteps({
    initialStep: 0,
    count: steps.length,
  });

  const [formData, setFormData] = useState<Partial<ProviderProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goToNext();
  };

  const handlePrevious = () => {
    goToPrevious();
  };

  const handleSubmit = async (finalData: any) => {
    if (!user || !firestore) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    const completeProfileData: Omit<ProviderProfile, 'id'> = {
        ...formData,
        ...finalData,
        userId: user.uid,
        email: user.email || '',
        verificationStatus: 'verified', // Auto-verify for now
        createdAt: serverTimestamp(),
        // Explicitly set image URLs to empty strings if they aren't part of the form data
        // This prevents them from being saved as large data URIs
        profilePhotoUrl: '',
        aadhaarFrontUrl: '',
        aadhaarBackUrl: '',
        panUrl: '',
        selfieUrl: '',
        addressProofUrl: '',
    };


    try {
        const profileRef = doc(firestore, "providerProfiles", user.uid);
        // We are only saving the non-image data
        await setDoc(profileRef, completeProfileData, { merge: true });

        // Update the central user document
        await updateUser(user, { verificationStatus: 'verified' });
        
        toast({
            title: "Verification Submitted!",
            description: "You can now access all features.",
        });

        router.push('/search');

    } catch (error) {
        console.error("Verification submission error:", error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not save your verification data. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <Step1_Personal onNext={handleNext} defaultValues={formData} />;
      case 1:
        return <Step2_GovId onNext={handleNext} onPrevious={handlePrevious} defaultValues={formData} />;
      case 2:
        return <Step3_Address onNext={handleNext} onPrevious={handlePrevious} defaultValues={formData} />;
      case 3:
        return <Step4_Location onNext={handleNext} onPrevious={handlePrevious} defaultValues={formData} />;
      case 4:
        return <Step5_Security onSubmit={handleSubmit} onPrevious={handlePrevious} defaultValues={formData} isSubmitting={isSubmitting}/>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#02030a] text-white p-4 sm:p-6 md:p-8 flex flex-col">
       <div aria-hidden className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black opacity-80"></div>
      </div>
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">User Verification</h1>
            <p className="text-white/70">Complete these steps to become a trusted member of SPACER.</p>
        </div>
        <div className="mb-8 p-4 bg-black/30 rounded-xl">
             <Stepper index={activeStep} className="w-full">
                {steps.map((step, index) => (
                    <Step key={index} onClick={() => setStep(index)} className="cursor-pointer">
                    <StepIndicator>
                        <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                        />
                    </StepIndicator>
                    <Box className="hidden sm:block">
                        <StepTitle>{step.label}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                    </Box>
                    </Step>
                ))}
            </Stepper>
        </div>

        <div className="flex-1 flex flex-col justify-center">
            {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
