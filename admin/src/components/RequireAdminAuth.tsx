import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import adminApi from "../api/axios";

const RequireAdminAuth = () => {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        await adminApi.get("/api/admin/auth/me");
        setIsAuthed(true);
      } catch {
        setIsAuthed(false);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) {
    return <div className="text-center py-10 text-gray-500">Checking login...</div>;
  }

  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RequireAdminAuth;
