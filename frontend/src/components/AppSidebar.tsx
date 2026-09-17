import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  History,
  Utensils,
  Users,
  LogOut,
  UserCheck,
  User as UserIcon,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import type { User } from "@/types";
import api from "@/services/api";

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Gagal parse data user dari localStorage", error);
      }
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  // Menu Operasional / Kasir
  const staffMenus = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Histori Order", path: "/order-history", icon: History },
    { label: "Menu Makanan", path: "/menu", icon: Utensils },
    { label: "Pelanggan", path: "/pelanggan", icon: Users },
    { label: "Member", path: "/member", icon: UserCheck },
  ];

  // Menu Khusus Admin
  const adminMenus = [
    {
      label: "Dashboard Admin",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Manajemen Pengguna", path: "/admin/users", icon: ShieldAlert },
    { label: "Manajemen Menu", path: "/admin/menu", icon: Utensils },
    { label: "Manajemen Pelanggan", path: "/admin/customers", icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await api.post("user/logout");
    } catch (err) {
      console.error("Gagal update status logout di server", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#D3D4C0] bg-white text-slate-800">
      {/* Header Sidebar */}
      <SidebarHeader className="p-4 border-b border-[#D3D4C0]/60 bg-[#0A2947] text-white">
        <div className="font-bold text-base md:text-lg tracking-tight group-data-[collapsible=icon]:hidden flex items-center gap-2">
          <Utensils className="h-5 w-5 text-[#F3E4C9]" />
          <span>Aplikasi Kasir</span>
        </div>
      </SidebarHeader>

      {/* Konten Menu */}
      <SidebarContent className="px-2 py-3 space-y-4 bg-white">
        {/* GROUP 1: MENU UTAMA / OPERASIONAL */}
        <SidebarMenu>
          <div className="px-2 pb-1.5 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Menu Utama
          </div>
          {staffMenus.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`transition-colors rounded-xl my-0.5 ${
                    isActive
                      ? "bg-[#0A2947] text-white hover:bg-[#0A2947]/90 font-medium shadow-xs"
                      : "text-slate-700 hover:bg-[#F3E4C9]/60 hover:text-[#0A2947]"
                  }`}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#F3E4C9]" : "text-[#0A2947]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* GROUP 2: ADMIN AREA (Hanya tampil jika Admin) */}
        {isAdmin && (
          <SidebarMenu className="pt-3 border-t border-[#D3D4C0]/60">
            <div className="px-2 py-1.5 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              Admin Area
            </div>
            {adminMenus.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={`transition-colors rounded-xl my-0.5 ${
                      isActive
                        ? "bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90 font-medium shadow-xs"
                        : "text-slate-700 hover:bg-[#F3E4C9]/60 hover:text-[#8B5E3C]"
                    }`}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-2">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-[#F3E4C9]" : "text-[#8B5E3C]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>

      {/* Footer Sidebar (Profil & Logout) */}
      <SidebarFooter className="p-3 border-t border-[#D3D4C0]/60 space-y-2 bg-[#F3E4C9]/10">
        {/* Info User */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#D3D4C0]/50 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none shadow-xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A2947] text-[#F3E4C9]">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold truncate leading-tight text-[#0A2947]">
              {user?.nama || "User Unknown"}
            </span>
            <span className="text-[9px] font-bold text-[#8B5E3C] uppercase tracking-wider">
              {user?.role || "STAFF"}
            </span>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/profile"}
              tooltip="Profil"
              className={`transition-colors rounded-xl ${
                location.pathname === "/profile"
                  ? "bg-[#0A2947] text-white hover:bg-[#0A2947]/90 font-medium"
                  : "text-slate-700 hover:bg-[#F3E4C9]/60 hover:text-[#0A2947]"
              }`}>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2">
                <UserCog
                  className={`h-4 w-4 shrink-0 ${
                    location.pathname === "/profile"
                      ? "text-[#F3E4C9]"
                      : "text-[#0A2947]"
                  }`}
                />
                <span>Edit Profil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              tooltip="Logout">
              <LogOut className="h-4 w-4 shrink-0 text-rose-600" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
