import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

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
      } catch (e) {
        console.error("Error parsing JSON:", e);
        return { message: "Invalid JSON response from server" };
      }
    }

    const text = await response.text();
    console.error("Non-JSON response received:", text);
    return { message: text || response.statusText || "Unexpected server response" };
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log(`[Signup] Attempting to sign up user: ${email}`);
      console.log(`[Signup] Endpoint: ${API_BASE}/signup`);
      
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`[Signup] Response Status: ${response.status}`);
      const data = await parseResponse(response);
      console.log(`[Signup] Response Data:`, data);

      if (response.ok) {
        return { error: null };
      } else {
        return { error: data.message || "Signup failed" };
      }
    } catch (error) {
      console.error("[Signup] Fetch error:", error);
      return { error: error instanceof Error ? error.message : "Unable to connect to server. Please try again." };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`[Login] Attempting to log in user: ${email}`);
      
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`[Login] Response Status: ${response.status}`);
      const data = await parseResponse(response);
      console.log(`[Login] Response Data:`, data);

      if (response.ok) {
        const userData = { email };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("[Login] Fetch error:", error);
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