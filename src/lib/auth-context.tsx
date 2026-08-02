import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { setRememberMe, supabase } from "@/lib/supabase";

type AuthResult = { error: string | null };
type SignUpResult = AuthResult & { /** False when email confirmation is required before a session exists. */ signedIn: boolean };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  /** True until the initial session lookup has resolved. */
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string, remember: boolean) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Makes sure a `profiles` row exists for the given user. The database
 * already creates one automatically via an `on auth.users insert` trigger,
 * this is a defensive client-side fallback in case a profile is ever
 * missing (e.g. a user created before the trigger existed).
 */
async function ensureProfile(user: User) {
  const { data, error } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (error || data) return;

  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: (user.user_metadata?.["full_name"] as string | undefined) ?? user.email?.split("@")[0] ?? "",
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (newSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void ensureProfile(newSession.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return { error: error.message, signedIn: false };
    if (data.user) await ensureProfile(data.user);
    return { error: null, signedIn: Boolean(data.session) };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password, remember) => {
    setRememberMe(remember);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const sendPasswordReset: AuthContextValue["sendPasswordReset"] = async (email) => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updatePassword: AuthContextValue["updatePassword"] = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
