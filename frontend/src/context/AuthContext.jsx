import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("access_token"));
  const [isSuperuser, setIsSuperuser] = useState(
    () => sessionStorage.getItem("is_superuser") === "true"
  );

  const login = useCallback(({ accessToken, refreshToken, superuser }) => {
    sessionStorage.setItem("access_token", accessToken);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
    sessionStorage.setItem("is_superuser", superuser ? "true" : "false");
    setToken(accessToken);
    setIsSuperuser(!!superuser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("is_superuser");
    setToken(null);
    setIsSuperuser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isSuperuser, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}