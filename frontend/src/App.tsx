import { Routes, Route, Navigate } from "react-router-dom";

import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Profile } from "./pages/profile";

// Halaman Staff & Umum
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { OrderHistoryPage } from "./pages/staff/OrderHistoryPage";
import { OrderDetail } from "./pages/staff/OrderDetail";
import { CreateOrder } from "./pages/staff/createOrder";
import { MenuList } from "./pages/staff/menuList";
import { CreatePelanggan } from "./pages/staff/createaPelanggan";
import { MemberList } from "./pages/staff/MemberList";

// Halaman Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsersPage";
import { AdminMenu } from "./pages/admin/AdminMenu";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />

      {/* Rute yang dilindungi Auth & Layout */}
      <Route
        element={<ProtectedRoute allowedRoles={["STAFF", "KASIR", "ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
          <Route
            path="/dashboard"
            element={<StaffDashboard />}
          />
          <Route
            path="/order-history"
            element={<OrderHistoryPage />}
          />
          <Route
            path="/orders/create"
            element={<CreateOrder />}
          />
          <Route
            path="/orders/:id"
            element={<OrderDetail />}
          />
          <Route
            path="/menu"
            element={<MenuList />}
          />
          <Route
            path="/pelanggan"
            element={<CreatePelanggan />}
          />
          <Route
            path="/member"
            element={<MemberList />}
          />
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Rute Khusus Admin */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />
            <Route
              path="/admin/menu"
              element={<AdminMenu />}
            />

            <Route
              path="/admin/customers"
              element={<AdminCustomers />}
            />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
