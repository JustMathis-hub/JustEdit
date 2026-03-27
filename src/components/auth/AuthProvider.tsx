'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  initialUser: User | null;
  initialProfile: Profile | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, initialProfile, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    // Restore session from cookies on mount using getSession()
    // Unlike getUser(), getSession() handles token refresh automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!initialUser) {
        // Only clear if server also didn't have a user
        setUser(null);
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // If INITIAL_SESSION has a valid session, use it
        // If null but we have initialUser from SSR, don't clear — getSession() above will handle it
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        }
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for profile-updated events (from ProfileEditor)
  useEffect(() => {
    const handler = () => refreshProfile();
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
