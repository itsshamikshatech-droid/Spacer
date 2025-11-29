
'use client';
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import ProviderLayout from "@/components/layouts/ProviderLayout";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import type { Service } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function ProviderMyServicesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'services'), where('providerId', '==', user.uid));
  }, [firestore, user]);

  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const handleDelete = async () => {
    if (!firestore || !serviceToDelete) return;
    try {
      await deleteDoc(doc(firestore, "services", serviceToDelete));
      toast({
        title: "Service Deleted",
        description: "Your service has been removed from the marketplace.",
      });
    } catch (error) {
      console.error("Error deleting service: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the service. Please try again.",
      });
    } finally {
      setServiceToDelete(null);
    }
  };

  return (
    <ProviderLayout title="My Services">
      <AlertDialog onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold font-headline">My Service Applications</h1>
                <Button asChild>
                    <Link href="/dashboard/provider/create-service">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Service
                    </Link>
                </Button>
            </div>
             {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-60 w-full bg-white/10" />)}
                </div>
            )}
            {!isLoading && services && services.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <Card key={service.id} className="bg-white/5 border-white/10 flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{service.serviceCategory}</CardTitle>
                                    <Badge variant={service.verificationStatus === 'verified' ? 'default' : 'secondary'}>{service.verificationStatus}</Badge>
                                </div>
                                <CardDescription>Min. {service.minimumHours} hours, {service.experience} years exp.</CardDescription>
                            </CardHeader>
                             <CardContent className="flex-grow">
                                <p className="text-white/70 line-clamp-3">{service.skillDescription}</p>
                            </CardContent>
                             <CardFooter className="flex justify-between items-center bg-white/5 p-4 mt-auto gap-2">
                                <span className="font-bold text-lg text-primary"><CurrencyDisplay amount={service.costPerHour} />/hr</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="#">
                                            <Edit className="h-4 w-4 mr-2"/>Edit
                                        </Link>
                                    </Button>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" onClick={() => setServiceToDelete(service.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            {!isLoading && (!services || services.length === 0) && (
                <section className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto min-h-[50vh]">
                    <FileText className="mx-auto h-16 w-16 text-primary opacity-70 mb-6" />
                    <h3 className="mt-4 text-2xl font-bold font-headline">No services created yet.</h3>
                    <p className="text-lg text-white/80 mt-2">Create a service application to offer your skills to space buyers.</p>
                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-3">
                        <Link href="/dashboard/provider/create-service">Create a Service</Link>
                        </Button>
                    </div>
                </section>
            )}
        </div>
         {serviceToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this service and remove it from the marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ProviderLayout>
  );
}
