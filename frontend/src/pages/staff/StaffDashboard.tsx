import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrder } from "../../services/orderService";
import type { Order } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CookingPot,
  CheckCircle2,
  Receipt,
  Plus,
  Eye,
  Search,
  Filter,
} from "lucide-react";

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrder();

        const dataOrders = Array.isArray(response)
          ? response
          : (response as any)?.data || [];

        const activeOnly = dataOrders.filter((o: any) => {
          const isFinishedAndPaid =
            o.status === "SELESAI" && o.statusPembayaran === "SUDAH_DIBAYAR";
          return !isFinishedAndPaid;
        });

        setOrders(activeOnly);
      } catch (error) {
        console.error("Gagal mengambil data order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const countInProgress = orders.filter((o) =>
    ["MENUNGGU", "DIKONFIRMASI", "DISIAPKAN"].includes(o.status),
  ).length;

  const countServed = orders.filter((o) => o.status === "SIAP").length;

  const countUnpaid = orders.filter(
    (o) => o.statusPembayaran === "BELUM_DIBAYAR",
  ).length;

  const filteredOrders = orders.filter((item: any) => {
    const kodeMatch = (item.orderKode || item.id.toString())
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const namaMatch = (item.pelanggan?.nama || "Pelanggan Umum")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSearch = kodeMatch || namaMatch;

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "IN_PROGRESS") {
      return (
        matchesSearch &&
        ["MENUNGGU", "DIKONFIRMASI", "DISIAPKAN"].includes(item.status)
      );
    }
    if (statusFilter === "SERVED") {
      return matchesSearch && item.status === "SIAP";
    }
    if (statusFilter === "UNPAID") {
      return matchesSearch && item.statusPembayaran === "BELUM_DIBAYAR";
    }

    return matchesSearch;
  });

  const renderOrderStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
      case "DIKONFIRMASI":
      case "DISIAPKAN":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200">
            Sedang Diproses
          </Badge>
        );
      case "SIAP":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Siap Disajikan
          </Badge>
        );
      case "DIBATALKAN":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderPaymentBadge = (statusPembayaran: string) => {
    if (statusPembayaran === "SUDAH_DIBAYAR") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-600 border-emerald-200">
          Lunas
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-rose-50 text-rose-600 border-rose-200">
        Belum Lunas
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Pesanan Aktif
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar pesanan aktif dan status pemrosesan operasional kasir
          </p>
        </div>

        <Button
          onClick={() => navigate("/orders/create")}
          className="gap-2 cursor-pointer w-full sm:w-auto bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors">
          <Plus className="h-4 w-4" /> Pesanan Baru
        </Button>
      </div>

      {/* Statistik Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card
          className="cursor-pointer hover:border-[#8B5E3C] transition-all border-[#D3D4C0] shadow-xs rounded-2xl bg-white border-l-4 border-l-amber-500"
          onClick={() => setStatusFilter("IN_PROGRESS")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2947]">
              Sedang Diproses
            </CardTitle>
            <CookingPot className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#0A2947]">
              {countInProgress}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-[#8B5E3C] transition-all border-[#D3D4C0] shadow-xs rounded-2xl bg-white border-l-4 border-l-emerald-500"
          onClick={() => setStatusFilter("SERVED")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2947]">
              Siap Disajikan
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#0A2947]">
              {countServed}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-[#8B5E3C] transition-all border-[#D3D4C0] shadow-xs rounded-2xl bg-white border-l-4 border-l-rose-500"
          onClick={() => setStatusFilter("UNPAID")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2947]">
              Belum Lunas
            </CardTitle>
            <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#0A2947]">
              {countUnpaid}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bagian Filter & Pencarian */}
      <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
        <div className="p-4 border-b border-[#D3D4C0]/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A2947]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari kode order / pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs sm:text-sm h-9 bg-white border-[#D3D4C0] focus-visible:ring-[#8B5E3C]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="h-4 w-4 text-[#F3E4C9]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full sm:w-44 rounded-md border border-[#D3D4C0] bg-white px-3 py-1 text-xs text-[#0A2947] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C]">
              <option value="ALL">Semua Aktif</option>
              <option value="IN_PROGRESS">Sedang Diproses</option>
              <option value="SERVED">Siap Disajikan</option>
              <option value="UNPAID">Belum Lunas Saja</option>
            </select>
          </div>
        </div>

        <CardContent className="p-3 sm:p-0">
          {loading ? (
            <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
              Memuat data pesanan aktif...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
              Tidak ada pesanan aktif saat ini.
            </div>
          ) : (
            <>
              {/* TAMPILAN MOBILE: Kartu-Kartu (Muncul di layar HP) */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {filteredOrders.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/orders/${item.id}`)}
                    className="p-4 rounded-xl border border-[#D3D4C0]/70 bg-white shadow-xs space-y-3 cursor-pointer hover:border-[#8B5E3C] transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-sm text-[#0A2947]">
                        #{item.orderKode || item.id}
                      </span>
                      <span className="font-semibold text-sm text-slate-800">
                        Rp {Number(item.total).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Pelanggan:</span>
                      <span className="font-medium text-slate-900">
                        {item.pelanggan?.nama || "Pelanggan Umum"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {renderOrderStatusBadge(item.status)}
                        {renderPaymentBadge(item.statusPembayaran)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white">
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TAMPILAN DESKTOP: Tabel Klasik (Muncul di layar Tablet/PC) */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#F3E4C9]/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-[#0A2947]">
                        ID Pesanan
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#0A2947]">
                        Pelanggan
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#0A2947]">
                        Status Pesanan
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#0A2947]">
                        Status Pembayaran
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#0A2947]">
                        Total
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#0A2947] text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((item: any) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-[#F3E4C9]/20 transition-colors">
                        <TableCell className="font-semibold text-sm text-[#0A2947]">
                          #{item.orderKode || item.id}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {item.pelanggan?.nama || "Pelanggan Umum"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {renderOrderStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {renderPaymentBadge(item.statusPembayaran)}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-800">
                          Rp {Number(item.total).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${item.id}`);
                            }}
                            className="gap-1 text-xs cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
