import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, firstname: string, lastname: string) => Promise<AuthResponse>;
  logout: () => void;
  resetPassword: (email: string) => Promise<AuthResponse>;
  verifyEmail: (code: string) => Promise<AuthResponse>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch('###', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstname: string, lastname: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch('###', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Signup failed' };
      }
    } catch (err) {
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch('###', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'Email sent' };
      } else {
        return { success: false, message: data.message || 'Reset failed' };
      }
    } catch (err) {
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch('###', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok) {
        // Update user verification status if needed
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, message: data.message || 'Email verified successfully' };
      } else {
        return { success: false, message: data.message || 'Incorrect verification code' };
      }
    } catch (err) {
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    resetPassword,
    verifyEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};