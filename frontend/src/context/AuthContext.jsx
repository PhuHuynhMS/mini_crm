import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/axios';

const TOKEN_KEY = 'mini_crm_token';
const USER_KEY = 'mini_crm_user';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      persistSession(response.data.data.token, response.data.data.user);
      return response.data;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const response = await api.post('/auth/register', payload);
      persistSession(response.data.data.token, response.data.data.user);
      return response.data;
    },
    [persistSession]
  );

  const refreshProfile = useCallback(async () => {
    const response = await api.get('/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
    setUser(response.data.data);
    return response.data.data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    refreshProfile()
      .catch(() => clearSession())
      .finally(() => setIsBootstrapping(false));
  }, [clearSession, refreshProfile, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      register,
      refreshProfile,
      logout
    }),
    [isBootstrapping, login, logout, refreshProfile, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
