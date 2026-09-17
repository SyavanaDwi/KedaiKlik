import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">
        <SidebarTrigger className="mb-4" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
