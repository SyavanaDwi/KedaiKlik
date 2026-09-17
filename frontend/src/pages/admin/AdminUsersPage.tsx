import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Search,
  RefreshCcw,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "@/services/api";

interface User {
  id: number;
  nama: string;
  email: string;
  role: "ADMIN" | "STAFF";
  statusUser: boolean;
  isLoggedIn: boolean;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  last_logout_at?: string;
  logoutAt?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/user");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Gagal memuat data user:", err);
      setError("Gagal memuat daftar pengguna dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi untuk Soft Delete / Hapus User
  const handleDeleteUser = async (id: number, nama: string) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus akun "${nama || "Tanpa Nama"}"?`,
      )
    ) {
      try {
        await api.delete(`/user/${id}`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus user.");
      }
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Manajemen Pengguna (Admin)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola akun staff, pantau status login aktif, dan histori aktivitas.
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-9 gap-1.5 border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors cursor-pointer">
          <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama atau email staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm bg-white border-[#D3D4C0] rounded-xl shadow-xs focus-visible:ring-[#0A2947]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Tabel Data Pengguna (Container Card) */}
      <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* TAMPILAN MOBILE / HP: CARD VIEW (Hidden di MD ke atas) */}
          <div className="block md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Memuat data pengguna...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Tidak ada pengguna yang ditemukan.
              </div>
            ) : (
              filteredUsers.map((item) => {
                const logoutTime =
                  item.lastLogoutAt || item.last_logout_at || item.logoutAt;

                return (
                  <div
                    key={item.id}
                    className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-[#0A2947]">
                          {item.nama || "Tanpa Nama"}
                        </h3>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {item.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.role === "ADMIN" ? "default" : "secondary"
                        }
                        className={
                          item.role === "ADMIN"
                            ? "bg-[#0A2947] text-white"
                            : "bg-slate-200 text-slate-700"
                        }>
                        {item.role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          STATUS AKUN
                        </span>
                        {item.statusUser ? (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                            <UserX className="h-3 w-3" /> Nonaktif
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          STATUS LOGIN
                        </span>
                        {item.isLoggedIn ? (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aktif Login
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Offline
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Login Terakhir:</span>
                        <span className="font-medium">
                          {formatDateTime(item.lastLoginAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Logout Terakhir:</span>
                        <span className="font-medium">
                          {formatDateTime(logoutTime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-200/60">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 text-xs gap-1.5"
                        onClick={() => handleDeleteUser(item.id, item.nama)}>
                        <Trash2 className="h-3.5 w-3.5" /> Hapus Akun
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TAMPILAN DESKTOP: TABEL RESPONSIF (Hidden di layar kecil) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-[#D3D4C0]">
                  <TableHead className="min-w-[180px] text-[#0A2947] font-bold">
                    Nama & Email
                  </TableHead>
                  <TableHead className="min-w-[100px] text-[#0A2947] font-bold">
                    Role
                  </TableHead>
                  <TableHead className="min-w-[120px] text-[#0A2947] font-bold">
                    Status Akun
                  </TableHead>
                  <TableHead className="min-w-[130px] text-[#0A2947] font-bold">
                    Status Login
                  </TableHead>
                  <TableHead className="min-w-[150px] text-[#0A2947] font-bold">
                    Login Terakhir
                  </TableHead>
                  <TableHead className="min-w-[150px] text-[#0A2947] font-bold">
                    Logout Terakhir
                  </TableHead>
                  <TableHead className="text-right min-w-[90px] text-[#0A2947] font-bold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-xs text-slate-500">
                      Memuat data pengguna...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-xs text-slate-500">
                      Tidak ada pengguna yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((item) => {
                    const logoutTime =
                      item.lastLogoutAt || item.last_logout_at || item.logoutAt;

                    return (
                      <TableRow
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm text-[#0A2947]">
                            {item.nama || "Tanpa Nama"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.role === "ADMIN" ? "default" : "secondary"
                            }
                            className={
                              item.role === "ADMIN"
                                ? "bg-[#0A2947] text-white"
                                : "bg-slate-200 text-slate-700"
                            }>
                            {item.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.statusUser ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Nonaktif
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.isLoggedIn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Aktif Login
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              Offline
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {formatDateTime(item.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {formatDateTime(logoutTime)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            onClick={() => handleDeleteUser(item.id, item.nama)}
                            title="Hapus Akun">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
