
"use client";
import BuyerLayout from "@/components/layouts/BuyerLayout";
import { useEffect, useState } from "react";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function NotificationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Removed orderBy to avoid composite index requirement. Sorting will be done client-side.
    return query(collection(firestore, "notifications"), where("userId", "==", user.uid));
  }, [user, firestore]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!notificationsQuery) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = onSnapshot(notificationsQuery, snap => {
        const fetchedNotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort client-side
        fetchedNotes.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
        setNotes(fetchedNotes);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching notifications: ", error);
        toast({
            title: "Error",
            description: "Could not fetch notifications.",
            variant: "destructive"
        });
        setIsLoading(false);
    });
    return unsub;
  }, [notificationsQuery, isUserLoading]);

  function handleMarkRead(id: string) {
    if (!firestore) return;
    const noteRef = doc(firestore, "notifications", id);
    updateDocumentNonBlocking(noteRef, { read: true });
    toast({ title: "Notification marked as read." });
  }

  function handleDeleteNotification() {
    if (!firestore || !noteToDelete) return;
    const noteRef = doc(firestore, "notifications", noteToDelete);
    deleteDocumentNonBlocking(noteRef);
    toast({ title: "Notification deleted." });
    setNoteToDelete(null);
  }

  const NotificationWrapper = ({ note, children }: { note: any; children: React.ReactNode }) => {
    if (note.link) {
      return <Link href={note.link} className="contents">{children}</Link>;
    }
    return <>{children}</>;
  }

  return (
    <BuyerLayout title="Notifications">
       <div className="max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <AlertDialog onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <section className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in-up">
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          {isLoading ? (
             <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full bg-white/10"/>)}
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-lg border-2 border-dashed border-white/20 min-h-[300px] flex flex-col justify-center items-center">
                <Bell className="h-12 w-12 mx-auto text-primary/70 mb-4"/>
                <h3 className="text-xl font-semibold">No notifications yet.</h3>
                <p className="text-white/70">Updates about your bookings will appear here.</p>
            </div>
          ) :
            <div className="space-y-3">
              {notes.map(n => (
                <div key={n.id} className="group contents">
                  <NotificationWrapper note={n}>
                      <div className={`p-4 rounded-lg flex justify-between items-start gap-4 transition-all duration-300 ${n.read ? 'bg-white/5 opacity-60' : 'bg-white/10 shadow-lg'} ${n.link ? 'cursor-pointer hover:bg-white/20' : ''}`}>
                        <div className="flex-1">
                          <div className="font-medium">{n.title}</div>
                          <p className="text-sm text-white/80">{n.body}</p>
                          <p className="text-xs text-white/50 mt-1">{n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                            {!n.read && <Button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }} variant="ghost" size="sm" className="hover:bg-white/20 flex-shrink-0">Mark as read</Button>}
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive-foreground/70 hover:text-destructive-foreground hover:bg-destructive/20" onClick={(e) => {e.stopPropagation(); setNoteToDelete(n.id)}}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                        </div>
                      </div>
                  </NotificationWrapper>
                </div>
              ))}
            </div>
          }
        </section>
        {noteToDelete && (
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this notification.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteNotification}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        )}
        </AlertDialog>
      </div>
    </BuyerLayout>
  );
}
