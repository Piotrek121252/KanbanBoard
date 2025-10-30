import { useCookies } from "react-cookie";
import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function useAuth() {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const token = cookies.token;

  const username = useMemo(() => {
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
  }, [token, removeCookie]);

  const logout = useCallback(() => {
    removeCookie("token", { path: "/" });
    navigate("/login", { replace: true });
  }, [removeCookie, navigate]);

  return { username, token, logout };
}
