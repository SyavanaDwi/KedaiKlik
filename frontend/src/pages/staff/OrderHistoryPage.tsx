// pages/OrderHistoryPage.tsx
import React, { useEffect, useState } from "react";
import { getAllOrder } from "../../services/orderService";
import type { Order } from "@/types";
import { ReceiptModal } from "@/components/ReceiptModal";

import { Card, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Search, Receipt, RefreshCcw, User, Calendar } from "lucide-react";

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getAllOrder();
      const dataOrders = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      const historyOrders = dataOrders.filter(
        (o: Order) =>
          o.status === "SELESAI" && o.statusPembayaran === "SUDAH_DIBAYAR",
      );

      setOrders(historyOrders);
    } catch (error) {
      console.error("Gagal mengambil histori order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredOrders = orders.filter((item: any) => {
    const kodeMatch = (item.orderKode || item.id.toString())
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const namaMatch = (item.pelanggan?.nama || "Pelanggan Umum")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return kodeMatch || namaMatch;
  });

  const handleOpenReceipt = (order: Order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Histori Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar pesanan yang telah selesai dan dibayar secara operasional.
          </p>
        </div>

        {/* Tombol Muat Ulang */}
        <Button
          onClick={fetchHistory}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-9 gap-1.5 cursor-pointer border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors">
          <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full sm:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari Order ID / Nama Pelanggan..."
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
            Memuat histori pesanan...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-2xl border border-[#D3D4C0]">
            Tidak ada histori pesanan ditemukan.
          </div>
        ) : (
          filteredOrders.map((item: any) => (
            <Card
              key={item.id}
              className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Baris Atas: Order ID & Status */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Order ID
                    </span>
                    <span className="font-bold text-sm text-[#0A2947]">
                      #{item.orderKode || item.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Nama Pelanggan & Pembayaran */}
                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">
                      {item.pelanggan?.nama || "Pelanggan Umum"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">
                      Pembayaran:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">
                      {item.statusPembayaran}
                    </Badge>
                  </div>
                </div>

                {/* Total & Tombol Struk */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      Total
                    </span>
                    <span className="font-bold text-sm text-[#0A2947]">
                      Rp {Number(item.total).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReceipt(item)}
                    className="h-8 gap-1.5 text-xs border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors cursor-pointer">
                    <Receipt className="h-3.5 w-3.5" /> Struk PDF
                  </Button>
                </div>
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
                <TableHead className="min-w-[130px] text-[#0A2947] font-bold">
                  Order ID
                </TableHead>
                <TableHead className="min-w-[180px] text-[#0A2947] font-bold">
                  Customer
                </TableHead>
                <TableHead className="min-w-[140px] text-[#0A2947] font-bold">
                  Status Order
                </TableHead>
                <TableHead className="min-w-[140px] text-[#0A2947] font-bold">
                  Payment
                </TableHead>
                <TableHead className="min-w-[140px] text-[#0A2947] font-bold">
                  Total
                </TableHead>
                <TableHead className="text-right min-w-[130px] text-[#0A2947] font-bold">
                  Struk PDF
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-slate-500">
                    Memuat histori pesanan...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-slate-500">
                    Tidak ada histori pesanan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-xs sm:text-sm text-[#0A2947]">
                      #{item.orderKode || item.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm text-slate-700 font-medium">
                      {item.pelanggan?.nama || "Pelanggan Umum"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                        {item.statusPembayaran}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-xs sm:text-sm text-[#0A2947]">
                      Rp {Number(item.total).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceipt(item)}
                        className="h-8 gap-1.5 text-xs border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors cursor-pointer">
                        <Receipt className="h-3.5 w-3.5" /> Struk
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderHistoryPage;
