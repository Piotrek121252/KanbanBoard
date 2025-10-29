import { useCookies } from "react-cookie";
import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function useAuth() {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const username = useMemo(() => {
    const token = cookies.token;
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
      if (isExpired) {
        removeCookie("token", { path: "/" });
        return null;
      }
      return decoded.sub || decoded.username || null;
    } catch {
      return null;
    }
  }, [cookies.token, removeCookie]);

  const logout = useCallback(() => {
    removeCookie("token", { path: "/" });
    navigate("/login", { replace: true });
  }, [removeCookie, navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          removeCookie("token", { path: "/" });
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [removeCookie, navigate]);

  return { username, logout };
}
