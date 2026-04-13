import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuthError, User as SupabaseUser } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUser = (user: SupabaseUser | null): AuthUser | null => {
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email };
};

const formatAuthError = (error: AuthError | null) => {
  if (!error) return null;
  const message = error.message.toLowerCase();
  if (message.includes("already registered") || message.includes("duplicate")) {
    return "Email already in use";
  }
  if (message.includes("user not found") || message.includes("no user")) {
    return "User not found";
  }
  if (message.includes("invalid login credentials") || message.includes("invalid password")) {
    return "Invalid email or password";
  }
  if (message.includes("invalid email")) {
    return "Invalid email address";
  }
  return error.message;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(defaultUser(data.session?.user ?? null));
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(defaultUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔄 Signup attempt:", normalizedEmail);
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
      console.log("📝 Signup response:", { inputEmail: normalizedEmail, createdUserEmail: data?.user?.email ?? data?.session?.user?.email, data, error });
      
      if (error) {
        console.error("❌ Signup error:", error.message);
        return { error: formatAuthError(error) };
      }

      if (data.session?.user) {
        setUser(defaultUser(data.session.user));
      }
      
      return { error: null };
    } catch (err) {
      console.error("💥 Signup exception:", err);
      return { error: "Signup failed - please try again" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔄 Login attempt:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      console.log("📝 Login response:", { inputEmail: normalizedEmail, responseEmail: data?.session?.user?.email ?? data?.user?.email, data, error });
      
      if (error) {
        console.error("❌ Login error:", error.message);
        return { error: formatAuthError(error) };
      }

      if (data.session) {
        console.log("✅ Login successful, session created for:", data.session.user?.email ?? data.user?.email);
      }

      const authUser = defaultUser(data.session?.user ?? data.user ?? null);
      if (!authUser) {
        console.error("❌ No user after login");
        return { error: "Invalid email or password" };
      }
      setUser(authUser);
      return { error: null };
    } catch (err) {
      console.error("💥 Login exception:", err);
      return { error: "Login failed - please try again" };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("❌ SignOut error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
