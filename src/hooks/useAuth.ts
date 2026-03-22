import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linearToken, setLinearToken] = useState<string | null>(null);

  // Load session and Linear token
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadLinearToken(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadLinearToken(session.user.id);
      } else {
        setLinearToken(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadLinearToken = async (userId: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('linear_access_token')
      .eq('id', userId)
      .single();

    setLinearToken(data?.linear_access_token ?? null);
    setLoading(false);
  };

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setLinearToken(null);
  }, []);

  const saveLinearToken = useCallback(async (token: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_settings')
      .upsert({ id: user.id, linear_access_token: token, updated_at: new Date().toISOString() });
    if (error) throw error;
    setLinearToken(token);
  }, [user]);

  const disconnectLinear = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('user_settings')
      .update({ linear_access_token: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setLinearToken(null);
  }, [user]);

  return {
    session,
    user,
    loading,
    linearToken,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    saveLinearToken,
    disconnectLinear,
  };
}
