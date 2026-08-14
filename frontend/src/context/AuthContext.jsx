import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AUTH_STORAGE_KEY = 'event-ticketing-auth-user';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      persistUser(data.user);
    } catch {
      persistUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchProfile();

    const handleAuthSync = (event) => {
      persistUser(event.detail ?? null);
    };

    window.addEventListener('auth:user', handleAuthSync);

    return () => {
      window.removeEventListener('auth:user', handleAuthSync);
    };
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    persistUser(data.user);
    window.dispatchEvent(new CustomEvent('auth:user', { detail: data.user }));
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persistUser(data.user);
    window.dispatchEvent(new CustomEvent('auth:user', { detail: data.user }));
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    persistUser(null);
    window.dispatchEvent(new CustomEvent('auth:user', { detail: null }));
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      setUser: persistUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
