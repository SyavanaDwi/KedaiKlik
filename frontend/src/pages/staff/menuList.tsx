import React, { useEffect, useState } from "react";
import { getAllMenu, updateMenu, deleteMenu } from "@/services/menuService";
import type { Menu } from "@/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Utensils, RefreshCcw } from "lucide-react";

export const MenuList = () => {
  // ==================== 1. STATE MANAGEMENT ====================
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const userRole = localStorage.getItem("role") || "STAFF";

  // ==================== 2. DATA FETCHING ====================
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await getAllMenu();
      const data = Array.isArray(res) ? res : res.data || [];
      setMenus(data);
    } catch (err) {
      console.error("Gagal mengambil data menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // ==================== 3. ACTION HANDLERS ====================
  const handleToggleStatus = async (menuItem: Menu) => {
    const newStatus = !menuItem.statusMenu;
    const payload = { statusMenu: newStatus };

    try {
      await updateMenu(menuItem.id, payload);
      setMenus((prev) =>
        prev.map((item) =>
          item.id === menuItem.id ? { ...item, statusMenu: newStatus } : item,
        ),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui status menu");
    }
  };

  const handleDeleteMenu = async (id: number, namaMenu: string) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus menu "${namaMenu}"?`)
    ) {
      try {
        await deleteMenu(id);
        setMenus((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus menu");
      }
    }
  };

  // ==================== 4. FILTER & COMPUTED DATA ====================
  const filteredMenus = menus.filter((item) =>
    item.menu.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ==================== 5. RENDER UI ====================
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Daftar Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola ketersediaan menu makanan & minuman operasional.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Tombol Muat Ulang */}
          <Button
            onClick={fetchMenus}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-9 gap-1.5 cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
            <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
          </Button>

          {userRole === "ADMIN" && (
            <Button
              onClick={() => alert("Buka modal tambah menu")}
              className="w-full sm:w-auto h-9 bg-[#0A2947] hover:bg-[#8B5E3C] text-white cursor-pointer transition-colors">
              <Plus className="h-4 w-4 mr-1.5" /> Tambah Menu Baru
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full sm:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 bg-white border-[#D3D4C0] focus-visible:ring-[#8B5E3C]"
          />
        </div>
      </div>

      {/* TAMPILAN MOBILE / HP: CARD VIEW (Hidden di layar MD ke atas) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-2xl border border-[#D3D4C0]">
            Memuat data menu...
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-2xl border border-[#D3D4C0]">
            Menu tidak ditemukan.
          </div>
        ) : (
          filteredMenus.map((item) => (
            <Card
              key={item.id}
              className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Baris Atas: Nama Menu & Kategori */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-[#0A2947] flex items-center gap-1.5">
                      <Utensils className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{item.menu}</span>
                    </div>
                    {item.deskripsi && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E4C9] text-[#8B5E3C]">
                    {item.kategori}
                  </span>
                </div>

                {/* Harga & Status Ketersediaan */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Harga</span>
                    <span className="font-bold text-sm text-[#0A2947]">
                      Rp {Number(item.harga).toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Toggle Status */}
                  <label className="inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={item.statusMenu}
                      onChange={() => handleToggleStatus(item)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.statusMenu
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                      {item.statusMenu ? "Tersedia" : "Habis"}
                    </span>
                  </label>
                </div>

                {/* Tombol Aksi (Khusus Admin) */}
                {userRole === "ADMIN" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[11px] border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer"
                      onClick={() => alert(`Edit menu ${item.id}`)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[11px] border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                      onClick={() => handleDeleteMenu(item.id, item.menu)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Hapus
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* TAMPILAN DESKTOP: TABEL RESPONSIF (Hidden di layar kecil) */}
      <div className="hidden md:block border border-[#D3D4C0] rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-[#D3D4C0]">
                <TableHead className="min-w-[200px] text-[#0A2947] font-bold">
                  Menu
                </TableHead>
                <TableHead className="min-w-[130px] text-[#0A2947] font-bold">
                  Kategori
                </TableHead>
                <TableHead className="min-w-[130px] text-[#0A2947] font-bold">
                  Harga
                </TableHead>
                <TableHead className="min-w-[160px] text-[#0A2947] font-bold">
                  Status Ketersediaan
                </TableHead>
                {userRole === "ADMIN" && (
                  <TableHead className="text-right min-w-[150px] text-[#0A2947] font-bold">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "ADMIN" ? 5 : 4}
                    className="text-center py-8 text-xs text-slate-500">
                    Memuat data menu...
                  </TableCell>
                </TableRow>
              ) : filteredMenus.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "ADMIN" ? 5 : 4}
                    className="text-center py-8 text-xs text-slate-500">
                    Menu tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMenus.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs sm:text-sm text-[#0A2947] flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{item.menu}</span>
                      </div>
                      {item.deskripsi && (
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.deskripsi}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#F3E4C9] text-[#8B5E3C]">
                        {item.kategori}
                      </span>
                    </TableCell>

                    <TableCell className="font-semibold text-xs sm:text-sm text-[#0A2947]">
                      Rp {Number(item.harga).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell>
                      <label className="inline-flex items-center cursor-pointer gap-2.5">
                        <input
                          type="checkbox"
                          checked={item.statusMenu}
                          onChange={() => handleToggleStatus(item)}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            item.statusMenu
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                          {item.statusMenu ? "Tersedia" : "Habis"}
                        </span>
                      </label>
                    </TableCell>

                    {userRole === "ADMIN" && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer"
                            onClick={() => alert(`Edit menu ${item.id}`)}
                            title="Edit Menu">
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                            onClick={() => handleDeleteMenu(item.id, item.menu)}
                            title="Hapus Menu">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MenuList;
