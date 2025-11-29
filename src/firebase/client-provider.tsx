'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// It's safe to initialize here as this is a client component.
const firebaseServices = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    if (firebaseServices.auth) {
        const unsub = onAuthStateChanged(firebaseServices.auth, (user) => {
        // Once auth state is confirmed, we can show the actual UI.
        if (!ready) setReady(true);
        });
        return () => unsub();
    } else {
        // If there's no auth service, we're "ready" from the start.
        setReady(true);
    }
  }, [ready]);
  
  if (!ready) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
            <p>Loading...</p> 
        </div>
      )
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
