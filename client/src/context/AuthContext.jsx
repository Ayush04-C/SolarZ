import { createContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await api.post('/api/auth/refresh');
      setAccessToken(res.data.accessToken);
      await fetchUser();
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role
    });
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    setAccessToken(res.data.accessToken);
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role
    });
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
