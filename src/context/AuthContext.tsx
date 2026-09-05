import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  provider?: string;
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  availableUsers: User[];
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (email?: string, name?: string) => Promise<boolean>;
  register: (name: string, email: string, role: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickLogin: (user: User) => void;
  refreshUsers: () => Promise<void>;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'paw_and_book_user';
const STORAGE_TOKEN_KEY = 'paw_and_book_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const { toast } = useToast();

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableUsers(json.data);
      }
    } catch (err) {
      console.warn('Could not fetch database users', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const saveSession = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
  };

  const login = async (email: string, password = 'password123'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: 'Sign in failed',
          description: data.error || 'Could not verify credentials.',
          variant: 'destructive',
        });
        return false;
      }

      saveSession(data.data.user, data.data.token);
      toast({
        title: `Welcome back, ${data.data.user.name}!`,
        description: `Signed in as ${data.data.user.role} (${data.data.user.email})`,
      });
      refreshUsers();
      return true;
    } catch (err: any) {
      toast({
        title: 'Connection error',
        description: err.message || 'Could not connect to authentication service.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    customEmail = 'alhamramzrn@gmail.com',
    customName = 'Alham Ramzrn'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail,
          name: customName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: 'Google sign-in error',
          description: data.error || 'Unable to authenticate with Google.',
          variant: 'destructive',
        });
        return false;
      }

      saveSession(data.data.user, data.data.token);
      toast({
        title: 'Google authentication successful',
        description: `Logged in as ${data.data.user.email}`,
      });
      refreshUsers();
      return true;
    } catch (err: any) {
      toast({
        title: 'Google Auth error',
        description: err.message || 'Authentication error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    role: string,
    password = 'password123'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: 'Registration failed',
          description: data.error || 'Could not create account.',
          variant: 'destructive',
        });
        return false;
      }

      saveSession(data.data.user, data.data.token);
      toast({
        title: 'Account created & saved to database',
        description: `Welcome to Paw & Book, ${data.data.user.name}!`,
      });
      refreshUsers();
      return true;
    } catch (err: any) {
      toast({
        title: 'Registration error',
        description: err.message || 'Could not register user.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (selectedUser: User) => {
    const testToken = `paw-token-${selectedUser.id}-${Date.now()}`;
    saveSession(selectedUser, testToken);
    toast({
      title: `Switched to ${selectedUser.name}`,
      description: `Active role: ${selectedUser.role} · ${selectedUser.email}`,
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    toast({
      title: 'Signed out',
      description: 'You have been safely signed out of Paw & Book.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        availableUsers,
        login,
        loginWithGoogle,
        register,
        logout,
        quickLogin,
        refreshUsers,
        isDbModalOpen,
        setIsDbModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
