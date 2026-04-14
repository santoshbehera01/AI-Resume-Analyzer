import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("Content-Type") || response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return { message: "Invalid JSON response" };
      }
    }

    const text = await response.text();
    return { message: text || response.statusText || "Unexpected server response" };
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(response);

      if (response.ok) {
        return { error: null };
      } else {
        return { error: data.message || "Signup failed" };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to connect to server. Please try again." };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(response);

      if (response.ok) {
        const userData = { email };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: data.message || "Login failed" };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to connect to server. Please try again." };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}