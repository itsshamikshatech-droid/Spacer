
'use client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { User } from 'firebase/auth';

export const saveUser = async (user: User) => {
  const { firestore } = getSdks(user.app);
  if (!user.email) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const [firstName, ...lastName] = user.displayName?.split(' ') || ['', ''];
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName.join(' '),
      profilePicture: user.photoURL,
      phoneNumber: user.phoneNumber || '',
      verificationStatus: 'unverified',
    });
  }
};

export const updateUser = async (user: User, data: any) => {
    const { firestore } = getSdks(user.app);
    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, data);
};
