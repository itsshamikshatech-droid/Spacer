
'use client';
import ProviderLayout from "@/components/layouts/ProviderLayout";
import { useRouter } from "next/navigation";

// This page is now a redirect. The functionality is moved to create-service.
export default function ProviderAddNewServicePageRedirect() {
  const router = useRouter();
  router.replace('/dashboard/provider/create-service');
  return (
     <ProviderLayout title="Redirecting...">
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 text-center">
            <p>Redirecting to create service page...</p>
        </div>
    </ProviderLayout>
  );
}
