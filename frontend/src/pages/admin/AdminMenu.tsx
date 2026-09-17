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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, RefreshCcw } from "lucide-react";
import api from "@/services/api";

interface MenuItem {
  id: number;
  menu: string;
  harga: number;
  kategori: "MAKANAN" | "MINUMAN";
  deskripsi?: string;
  statusMenu: boolean;
}

export const AdminMenu = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    menu: "",
    harga: "",
    kategori: "MAKANAN" as "MAKANAN" | "MINUMAN",
    deskripsi: "",
    statusMenu: true,
  });

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/menu");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setMenus(data);
    } catch (err) {
      console.error("Gagal memuat data menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      menu: "",
      harga: "",
      kategori: "MAKANAN",
      deskripsi: "",
      statusMenu: true,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      menu: item.menu,
      harga: item.harga.toString(),
      kategori: item.kategori,
      deskripsi: item.deskripsi || "",
      statusMenu: item.statusMenu,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await api.put(`/menu/${currentId}`, formData);
      } else {
        await api.post("/menu", formData);
      }
      setIsOpen(false);
      fetchMenus();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan menu.");
    }
  };

  const handleDelete = async (id: number, namaMenu: string) => {
    if (window.confirm(`Yakin ingin menghapus menu "${namaMenu}"?`)) {
      try {
        await api.delete(`/menu/${id}`);
        setMenus(menus.filter((m) => m.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus menu.");
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter menu berdasarkan search query
  const filteredMenus = menus.filter(
    (item) =>
      item.menu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Manajemen Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola katalog makanan dan minuman, harga, serta status
            ketersediaan.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={fetchMenus}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-9 gap-1.5 cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
            <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none h-9 gap-2 bg-[#0A2947] hover:bg-[#0A2947]/90 text-white cursor-pointer">
            <Plus className="h-4 w-4" /> Tambah Menu
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama menu, kategori, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-[#D3D4C0] rounded-xl shadow-xs focus-visible:ring-[#0A2947]"
          />
        </div>
      </div>

      {/* Tabel Menu (Container Card) */}
      <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* TAMPILAN MOBILE / HP: CARD VIEW (Hidden di MD ke atas) */}
          <div className="block md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Memuat data menu...
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Tidak ada menu yang ditemukan.
              </div>
            ) : (
              filteredMenus.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2947]">
                        {item.menu}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.deskripsi || "-"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0">
                      {item.kategori}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
                    <span className="font-bold text-[#0A2947]">
                      {formatRupiah(item.harga)}
                    </span>
                    <Badge
                      variant={item.statusMenu ? "default" : "secondary"}
                      className="text-[10px]">
                      {item.statusMenu ? "Tersedia" : "Habis"}
                    </Badge>
                  </div>

                  <div className="flex justify-end items-center gap-1 pt-2 border-t border-slate-200/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenEdit(item)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-red-50"
                      onClick={() => handleDelete(item.id, item.menu)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TAMPILAN DESKTOP: TABEL RESPONSIF (Hidden di layar kecil) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-[#D3D4C0]">
                  <TableHead className="text-[#0A2947] font-bold">
                    Nama Menu
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Kategori
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Harga
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[#0A2947] font-bold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-xs text-slate-500">
                      Memuat data menu...
                    </TableCell>
                  </TableRow>
                ) : filteredMenus.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-xs text-slate-500">
                      Tidak ada menu yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMenus.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-bold text-sm text-[#0A2947]">
                          {item.menu}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.deskripsi || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs">
                          {item.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-sm text-[#0A2947]">
                        {formatRupiah(item.harga)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.statusMenu ? "default" : "secondary"}
                          className="text-xs">
                          {item.statusMenu ? "Tersedia" : "Habis"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50"
                          onClick={() => handleOpenEdit(item)}>
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() => handleDelete(item.id, item.menu)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Form Tambah / Edit Menu */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl border-[#D3D4C0] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A2947] font-bold text-lg">
              {isEditing ? "Edit Menu" : "Tambah Menu Baru"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Nama Menu
              </label>
              <Input
                required
                value={formData.menu}
                onChange={(e) =>
                  setFormData({ ...formData, menu: e.target.value })
                }
                placeholder="Contoh: Nasi Goreng Spesial"
                className="rounded-xl border-[#D3D4C0]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Harga (Rp)
              </label>
              <Input
                required
                type="number"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: e.target.value })
                }
                placeholder="Contoh: 25000"
                className="rounded-xl border-[#D3D4C0]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Kategori
              </label>
              <select
                className="w-full border border-[#D3D4C0] rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A2947]"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kategori: e.target.value as "MAKANAN" | "MINUMAN",
                  })
                }>
                <option value="MAKANAN">MAKANAN</option>
                <option value="MINUMAN">MINUMAN</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Deskripsi (Opsional)
              </label>
              <Input
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Keterangan singkat menu"
                className="rounded-xl border-[#D3D4C0]"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="statusMenu"
                checked={formData.statusMenu}
                onChange={(e) =>
                  setFormData({ ...formData, statusMenu: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-[#0A2947] focus:ring-[#0A2947]"
              />
              <label
                htmlFor="statusMenu"
                className="text-sm font-medium text-slate-700 cursor-pointer">
                Menu Tersedia / Aktif
              </label>
            </div>
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-[#D3D4C0]">
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#0A2947] hover:bg-[#0A2947]/90 text-white">
                {isEditing ? "Simpan Perubahan" : "Tambah Menu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
