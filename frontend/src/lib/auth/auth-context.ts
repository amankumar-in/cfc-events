export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  isEventAdmin?: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
  entitlements?: {
    id: number;
    source: string;
    grantedAt: string;
    event?: { id: number; Slug: string };
    session?: { id: number; Slug: string };
  }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (jwt: string) => Promise<void>;
  logout: () => void;
}
