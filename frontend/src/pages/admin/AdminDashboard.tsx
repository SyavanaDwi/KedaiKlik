import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Activity,
  RefreshCcw,
  Calendar,
} from "lucide-react";
import api from "@/services/api";

interface DashboardStats {
  totalPendapatan: number;
  totalTransaksi: number;
  totalMenu: number;
  totalPelanggan: number;
  activeUsersCount: number;
  recentOrders: Array<{
    id: number;
    orderKode: string;
    total: number;
    status: string;
    createAt: string;
    pelanggan?: { nama: string };
  }>;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPendapatan: 0,
    totalTransaksi: 0,
    totalMenu: 0,
    totalPelanggan: 0,
    activeUsersCount: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [orderRes, userRes, menuRes, pelangganRes] = await Promise.all([
        api.get("/order").catch(() => ({ data: [] })),
        api.get("/user").catch(() => ({ data: [] })),
        api.get("/menu").catch(() => ({ data: [] })),
        api.get("/pelanggan").catch(() => ({ data: [] })),
      ]);

      const orders = Array.isArray(orderRes.data)
        ? orderRes.data
        : orderRes.data.data || [];
      const users = Array.isArray(userRes.data)
        ? userRes.data
        : userRes.data.data || [];
      const menus = Array.isArray(menuRes.data)
        ? menuRes.data
        : menuRes.data.data || [];
      const pelanggans = Array.isArray(pelangganRes.data)
        ? pelangganRes.data
        : pelangganRes.data.data || [];

      // Hitung total pendapatan dari order yang sukses/sudah dibayar
      const totalPendapatan = orders.reduce((acc: number, curr: any) => {
        return curr.statusPembayaran === "SUDAH_DIBAYAR" ||
          curr.status === "SELESAI"
          ? acc + Number(curr.total || 0)
          : acc;
      }, 0);

      // Hitung user yang aktif berdasarkan properti `statusUser` (true) di database
      const activeUsersCount = users.filter(
        (u: any) => u.statusUser === true,
      ).length;

      setStats({
        totalPendapatan,
        totalTransaksi: orders.length,
        totalMenu: menus.length,
        totalPelanggan: pelanggans.length,
        activeUsersCount,
        recentOrders: orders.slice(0, 5),
      });
    } catch (err) {
      console.error("Gagal memuat data dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Ringkasan eksekutif keuangan, performa operasional, dan aktivitas
            toko secara real-time.
          </p>
        </div>

        {/* Tombol Muat Ulang */}
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-9 gap-1.5 cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
          <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
        </Button>
      </div>

      {/* Grid Statistik Utama (Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card Pendapatan */}
        <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Total Pendapatan
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-[#0A2947]">
              {loading ? "Memuat..." : formatRupiah(stats.totalPendapatan)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Akumulasi pembayaran sukses
            </p>
          </CardContent>
        </Card>

        {/* Card Total Transaksi */}
        <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Total Transaksi
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-[#0A2947]">
              {loading ? "..." : `${stats.totalTransaksi} Pesanan`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Semua status pesanan tercatat
            </p>
          </CardContent>
        </Card>

        {/* Card Staff Aktif */}
        <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Staff / Kasir Online
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold flex items-center gap-2 text-[#0A2947]">
              {loading ? "..." : `${stats.activeUsersCount} Orang`}
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Akun aktif berstatus online
            </p>
          </CardContent>
        </Card>

        {/* Card Katalog Menu & Pelanggan */}
        <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Katalog Menu & Pelanggan
            </CardTitle>
            <div className="p-2 bg-[#F3E4C9] text-[#8B5E3C] rounded-xl">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-[#0A2947]">
              {loading ? "..." : `${stats.totalMenu} Menu`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.totalPelanggan} Pelanggan terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-[#0A2947]">
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* TAMPILAN MOBILE / HP: CARD VIEW (Hidden di MD ke atas) */}
          <div className="block md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Memuat data pesanan...
              </div>
            ) : stats.recentOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Belum ada transaksi pesanan masuk.
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Kode Order
                      </span>
                      <span className="font-bold text-xs text-[#0A2947]">
                        {order.orderKode}
                      </span>
                    </div>
                    <Badge
                      variant={
                        order.status === "SELESAI" ? "default" : "secondary"
                      }
                      className="text-[10px]">
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 font-medium">
                      {order.pelanggan?.nama || "Pelanggan Umum"}
                    </span>
                    <span className="font-bold text-[#0A2947]">
                      {formatRupiah(Number(order.total))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Waktu Transaksi</span>
                    <span>
                      {order.createAt
                        ? new Date(order.createAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
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
                    Kode Order
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Pelanggan
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Total Biaya
                  </TableHead>
                  <TableHead className="text-[#0A2947] font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[#0A2947] font-bold">
                    Waktu
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-xs text-slate-500">
                      Memuat data pesanan...
                    </TableCell>
                  </TableRow>
                ) : stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-xs text-slate-500">
                      Belum ada transaksi pesanan masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-xs sm:text-sm text-[#0A2947]">
                        {order.orderKode}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-slate-700 font-medium">
                        {order.pelanggan?.nama || "Pelanggan Umum"}
                      </TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm text-[#0A2947]">
                        {formatRupiah(Number(order.total))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "SELESAI" ? "default" : "secondary"
                          }
                          className="text-xs">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {order.createAt
                          ? new Date(order.createAt).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
