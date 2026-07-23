import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api/authApi";
import { TOKEN_STORAGE_KEY } from "@/lib/apiClient";
const AuthContext = createContext(undefined);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi.me().then(setUser).catch(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }).finally(() => setIsLoading(false));
  }, []);
  const login = async payload => {
    const res = await authApi.login(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
    return res.user;
  };
  const register = async payload => {
    const res = await authApi.register(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
    return res.user;
  };
  const loginWithToken = async token => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const me = await authApi.me();
    setUser(me);
    return me;
  };
  const applyAuthResponse = res => {
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    window.location.href = "/login";
  };
  const hasRole = role => user?.roles.includes(role) ?? false;
  return <AuthContext.Provider value={{
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithToken,
    applyAuthResponse,
    logout,
    hasRole
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}