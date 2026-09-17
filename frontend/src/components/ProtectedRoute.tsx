import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    const hasRole = allowedRoles.some(
      (role) => role.toUpperCase() === userRole,
    );

    if (!hasRole) {
      const fallbackRoute =
        userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      return (
        <Navigate
          to={fallbackRoute}
          replace
        />
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
