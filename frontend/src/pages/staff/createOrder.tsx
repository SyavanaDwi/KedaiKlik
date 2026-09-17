import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/orderService";
import { getAllMenu } from "../../services/menuService";
import { getAllPelanggan } from "../../services/pelangganService";
import type { Menu, Pelanggan, CreateOrderPayload } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
} from "lucide-react";

interface CartItem {
  menuId: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
}

export const CreateOrder = () => {
  const navigate = useNavigate();

  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);

  const [selectedPelangganId, setSelectedPelangganId] = useState<string>("");
  const [diskon, setDiskon] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // State untuk pencarian pelanggan (Combobox/Input bisa diketik)
  const [pelangganSearch, setPelangganSearch] = useState<string>("");
  const [isPelangganOpen, setIsPelangganOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk pencarian menu
  const [menuSearch, setMenuSearch] = useState<string>("");

  // Ambil ID Kasir dari LocalStorage dengan parsing yang aman
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : { id: 1 };
    } catch {
      return { id: 1 };
    }
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadData();

    // Event listener untuk menutup dropdown pelanggan jika klik di luar
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPelangganOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [resMenu, resPelanggan] = await Promise.all([
        getAllMenu(),
        getAllPelanggan(),
      ]);
      setMenuList(
        Array.isArray(resMenu) ? resMenu : (resMenu as any)?.data || [],
      );
      setPelangganList(
        Array.isArray(resPelanggan)
          ? resPelanggan
          : (resPelanggan as any)?.data || [],
      );
    } catch (err) {
      console.error("Gagal memuat data master:", err);
    }
  };

  // Handler Pilih Pelanggan dari list pencarian
  const handleSelectPelanggan = (p: Pelanggan) => {
    setSelectedPelangganId(String(p.id));
    setPelangganSearch(`${p.nama} (${p.nomer_hp})`);
    setIsPelangganOpen(false);

    // Cek jika pelanggan berstatus member
    if (p.member && p.member.statusMember) {
      setDiskon(p.member.diskon || 0);
    } else {
      setDiskon(0);
    }
  };

  const handleAddToCart = (menu: Menu) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.menuId === menu.id);
      if (exist) {
        return prev.map((item) =>
          item.menuId === menu.id ? { ...item, jumlah: item.jumlah + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          menuId: menu.id,
          namaMenu: menu.menu,
          harga: menu.harga,
          jumlah: 1,
        },
      ];
    });
  };

  // Handler Ubah Jumlah Item
  const handleUpdateQty = (menuId: number, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.menuId === menuId) {
              const newQty = item.jumlah + delta;
              return newQty > 0 ? { ...item, jumlah: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  // Kalkulasi Total
  const subTotal = cart.reduce(
    (acc, item) => acc + item.harga * item.jumlah,
    0,
  );
  const potonganDiskon = (subTotal * diskon) / 100;
  const total = Math.max(0, subTotal - potonganDiskon);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!selectedPelangganId) {
      alert("Pilih pelanggan terlebih dahulu!");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang belanja tidak boleh kosong!");
      return;
    }

    setSubmitting(true);
    try {
      const apiPayload: CreateOrderPayload = {
        pelangganId: Number(selectedPelangganId),
        kasirId: Number(currentUser.id || 1),
        diskon: Number(diskon),
        items: cart.map((item) => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
          harga: item.harga,
        })),
      };

      await createOrder(apiPayload);
      alert("Pesanan berhasil dibuat!");
      navigate("/order-history");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membuat orderan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter pelanggan berdasarkan input pencarian
  const filteredPelanggan = pelangganList
    .filter((p) => p.statusPelanggan ?? true)
    .filter(
      (p) =>
        p.nama.toLowerCase().includes(pelangganSearch.toLowerCase()) ||
        p.nomer_hp.includes(pelangganSearch),
    );

  // Filter menu berdasarkan search bar
  const filteredMenu = menuList
    .filter((m) => m.statusMenu ?? true)
    .filter(
      (m) =>
        m.menu.toLowerCase().includes(menuSearch.toLowerCase()) ||
        m.kategori.toLowerCase().includes(menuSearch.toLowerCase()),
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
              Buat Order Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Pilih pelanggan dan menu untuk membuat pesanan operasional
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* KOLOM KIRI: PILIH PELANGGAN & MENU */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Pilih Pelanggan */}
          <Card className="overflow-visible border-[#D3D4C0] shadow-xs rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#D3D4C0]/60">
              <CardTitle className="text-sm sm:text-base font-bold text-[#0A2947]">
                1. Pilih Pelanggan
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors"
                onClick={() => navigate("/pelanggan")}>
                <Plus className="h-3.5 w-3.5" /> Tambah Pelanggan
              </Button>
            </CardHeader>
            <CardContent className="overflow-visible pt-4">
              <div
                className="space-y-2 relative"
                ref={dropdownRef}>
                <Label
                  htmlFor="pelangganSearchInput"
                  className="text-xs font-medium text-slate-700">
                  Cari Pelanggan (Nama / No. HP)
                </Label>
                <div className="relative">
                  <Input
                    id="pelangganSearchInput"
                    placeholder="Ketik nama atau nomor HP pelanggan..."
                    value={pelangganSearch}
                    onChange={(e) => {
                      setPelangganSearch(e.target.value);
                      setIsPelangganOpen(true);
                      if (!e.target.value) setSelectedPelangganId("");
                    }}
                    onFocus={() => setIsPelangganOpen(true)}
                    className="w-full text-xs sm:text-sm h-9 border-[#D3D4C0] focus-visible:ring-[#8B5E3C]"
                  />
                </div>

                {/* Dropdown Hasil Pencarian Pelanggan */}
                {isPelangganOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white text-slate-800 border border-[#D3D4C0] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredPelanggan.length === 0 ? (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        Pelanggan tidak ditemukan
                      </div>
                    ) : (
                      filteredPelanggan.map((p) => (
                        <div
                          key={p.id}
                          className="px-3 py-2.5 text-xs sm:text-sm cursor-pointer hover:bg-[#F3E4C9]/40 border-b border-slate-100 last:border-none flex justify-between items-center transition-colors"
                          onClick={() => handleSelectPelanggan(p)}>
                          <div>
                            <span className="font-semibold text-[#0A2947]">
                              {p.nama}
                            </span>
                            <span className="text-xs text-slate-500 ml-2">
                              ({p.nomer_hp})
                            </span>
                          </div>
                          {p.member && p.member.statusMember && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Member ({p.member.diskon}%)
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Pilih Menu */}
          <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
            <div className="p-4 border-b border-[#D3D4C0]/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A2947]">
              <CardTitle className="text-sm sm:text-base font-bold text-white w-full sm:w-auto">
                2. Pilih Menu Makanan
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari menu atau kategori..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="pl-8 h-9 text-xs bg-white border-[#D3D4C0] focus-visible:ring-[#8B5E3C]"
                />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredMenu.length === 0 ? (
                  <p className="text-xs text-slate-500 col-span-full text-center py-6">
                    Menu tidak ditemukan
                  </p>
                ) : (
                  filteredMenu.map((menu) => (
                    <div
                      key={menu.id}
                      className="border border-[#D3D4C0]/70 rounded-xl p-3 flex flex-col justify-between space-y-3 bg-white shadow-xs hover:border-[#8B5E3C] transition-colors">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E4C9]/60 text-[#8B5E3C]">
                          {menu.kategori}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm mt-2 text-[#0A2947] line-clamp-1">
                          {menu.menu}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-xs font-bold text-slate-800">
                          Rp {Number(menu.harga).toLocaleString("id-ID")}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddToCart(menu)}
                          className="h-8 gap-1 text-xs cursor-pointer bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors">
                          <Plus className="h-3 w-3" /> Tambah
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: RINGKASAN KERANJANG */}
        <div>
          <Card className="sticky top-6 border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-[#D3D4C0]/60 bg-[#F3E4C9]/20">
              <CardTitle className="text-sm sm:text-base font-bold text-[#0A2947] flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#8B5E3C]" /> Ringkasan
                Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-4">
                {/* Daftar Item di Keranjang */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-6">
                      Keranjang belanja masih kosong
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.menuId}
                        className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#0A2947]">
                            {item.namaMenu}
                          </p>
                          <p className="text-slate-500">
                            Rp {item.harga.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 border-[#D3D4C0] cursor-pointer"
                            onClick={() => handleUpdateQty(item.menuId, -1)}>
                            {item.jumlah === 1 ? (
                              <Trash2 className="h-3 w-3 text-rose-600" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="font-bold text-xs w-4 text-center text-[#0A2947]">
                            {item.jumlah}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 border-[#D3D4C0] cursor-pointer"
                            onClick={() => handleUpdateQty(item.menuId, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Perhitungan Biaya */}
                <div className="space-y-2 border-t border-[#D3D4C0]/60 pt-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      Rp {subTotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="diskonInput"
                      className="text-xs font-medium text-slate-700">
                      Diskon (%)
                    </Label>
                    <Input
                      id="diskonInput"
                      type="number"
                      min="0"
                      max="100"
                      value={diskon}
                      onChange={(e) => setDiskon(Number(e.target.value))}
                      className="h-8 text-xs border-[#D3D4C0] focus-visible:ring-[#8B5E3C]"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-emerald-700 font-medium">
                    <span>Potongan Diskon</span>
                    <span>- Rp {potonganDiskon.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold border-t border-[#D3D4C0]/60 pt-2 text-[#0A2947]">
                    <span>Total Bayar</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full cursor-pointer bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors">
                  {submitting ? "Memproses..." : "Submit Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
