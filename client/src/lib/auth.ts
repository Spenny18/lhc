// Client-side auth context. Uses server-side cookie sessions — no localStorage.
// API contract:
//   GET  /api/auth/me        -> { user: PublicUser | null }
//   POST /api/auth/sign-in   { email, password }
//   POST /api/auth/sign-up   { email, password, name }
//   POST /api/auth/sign-out
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, queryClient, setAuthToken } from "./queryClient";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  title?: string | null;
  avatar?: string | null;
  phone?: string | null;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: fetch /api/auth/me on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const data = await readJson(res);
        if (!cancelled) setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/sign-in", { email, password });
    const data = await readJson(res);
    if (data?.token) setAuthToken(data.token);
    setUser(data.user);
    queryClient.invalidateQueries();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await apiRequest("POST", "/api/auth/sign-up", {
        email,
        password,
        name,
      });
      const data = await readJson(res);
      if (data?.token) setAuthToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries();
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/sign-out");
    } catch {
      // ignore network errors on sign-out
    }
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, signIn, signUp, signOut } },
    children,
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
