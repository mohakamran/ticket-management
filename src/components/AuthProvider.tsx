import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            // Auto-create profile for special emails or users who signed in but missed profile creation
            const isAdmin = firebaseUser.email === 'admin@omniticket.com' || firebaseUser.email === 'mohammadkamran1515@gmail.com';
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || (isAdmin ? 'System Admin' : 'New User'),
              email: firebaseUser.email || '',
              role: isAdmin ? 'ADMIN' : 'EMPLOYEE',
              createdAt: serverTimestamp(),
            });
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          }

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: data.name,
              email: data.email,
              role: data.role as UserRole,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              photoURL: data.photoURL,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { serverTimestamp } = await import('firebase/firestore');
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Default admin email as specified in instruction
    const isAdmin = email === 'admin@omniticket.com';
    
    const newUser: User = {
      id: firebaseUser.uid,
      name,
      email,
      role: isAdmin ? 'ADMIN' : 'EMPLOYEE',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
    });

    setUser(newUser);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
