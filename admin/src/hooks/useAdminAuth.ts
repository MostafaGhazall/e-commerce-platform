import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../api/axios";

export const useAdminAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await adminApi.get("/api/admin/auth/me"); // ✅ verify session
      } catch {
        navigate("/login"); // ❌ unauthorized, go to login
      }
    };

    checkAuth();
  }, [navigate]);
};
