import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  role: "admin" | "seller" | "buyer" | "guest";
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user from localStorage:", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Partial<User>;
        const safeUser: User = {
          id: parsedUser.id || "",
          username:
            parsedUser.username && parsedUser.username.trim().length > 0
              ? parsedUser.username
              : "Unknown User",
          role: parsedUser.role || "guest",
        };               
        console.log("Setting safeUser from localStorage:", safeUser);
        setUser(safeUser);
      } catch (error) {
        console.error("Fehler beim Parsen des gespeicherten Users:", error);
      }
    }
  }, []);

  useEffect(() => {
    console.log("User changed:", user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
