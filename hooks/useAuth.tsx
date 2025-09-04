import React, { createContext, useContext, useEffect, useState } from 'react';
// Fix: Switched to Firebase v8 compatibility syntax for User type.
// Fix: Use firebase/compat/* for v8 compatibility to get the User type.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { crmService } from '../services/crmService';


interface AuthContextType {
    user: firebase.User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<any>;
    signUp: (name: string, email: string, pass: string) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = crmService.onAuthStateChangedListener((user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = (email: string, pass: string) => {
        return crmService.signInWithEmail(email, pass);
    };

    const signUp = (name: string, email: string, pass: string) => {
       return crmService.signUpWithEmail(name, email, pass);
    };

    const signOut = () => {
        return crmService.signOut();
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};