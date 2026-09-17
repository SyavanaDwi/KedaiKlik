import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../services/orderService";
import {
  createPembayaran,
  getPembayaranByOrderId,
} from "../../services/pembayaran";
import type { Order, Pembayaran, MetodePembayaran } from "../../types";
import { ReceiptModal } from "@/components/ReceiptModal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Receipt,
  Search,
  Printer,
} from "lucide-react";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [pembayaran, setPembayaran] = useState<Pembayaran | null>(null);
  const [loading, setLoading] = useState(true);

  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<MetodePembayaran>("CASH");
  const [jumlahBayar, setJumlahBayar] = useState<number>(0);
  const [processingPay, setProcessingPay] = useState(false);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : { id: 3 };

  useEffect(() => {
    const parsedId = Number(id);
    if (id && !isNaN(parsedId)) {
      loadOrderDetail(parsedId);
    } else {
      console.warn("ID pesanan di URL tidak valid:", id);
      setLoading(false);
    }
  }, [id]);

  const loadOrderDetail = async (orderId: number) => {
    setLoading(true);
    try {
      const resOrder = await getOrderById(orderId);
      const data: any = resOrder?.data || resOrder;

      if (data) {
        setOrder(data);
        setJumlahBayar(Number(data.total) || 0);

        if (data.statusPembayaran === "SUDAH_DIBAYAR") {
          try {
            const resPay: any = await getPembayaranByOrderId(orderId);
            const payData = resPay?.data?.data || resPay?.data || resPay;
            setPembayaran(payData || null);
          } catch (err: any) {
            console.warn("Data pembayaran belum ditemukan/error:", err);
            setPembayaran(null);
          }
        } else {
          setPembayaran(null);
        }
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error("Gagal mengambil detail order:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return;

    const payload = {
      status: newStatus,
      diubahOlehKasirId: Number(currentUser?.id || 3),
    };

    try {
      const res = await updateOrderStatus(order.id, payload);
      if (res.data) {
        setOrder(res.data);
      } else {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      await loadOrderDetail(order.id);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui status order");
    }
  };

  const handleMetodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMethod = e.target.value as MetodePembayaran;
    setMetodeBayar(selectedMethod);

    if (selectedMethod !== "CASH" && order) {
      setJumlahBayar(Number(order.total));
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (jumlahBayar < Number(order.total)) {
      alert("Jumlah pembayaran kurang dari total tagihan");
      return;
    }

    const payload = {
      orderId: Number(order.id),
      jumlah: Number(jumlahBayar),
      metode: metodeBayar,
      penerimaKasirId: Number(currentUser.id || 3),
    };

    setProcessingPay(true);
    try {
      const resPay = await createPembayaran(payload);
      alert("Pembayaran berhasil diproses!");

      if (resPay.data) {
        setPembayaran(resPay.data);
      }

      await loadOrderDetail(order.id);
      setIsReceiptOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memproses pembayaran");
    } finally {
      setProcessingPay(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm">Memuat detail pesanan...</div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Pesanan tidak ditemukan atau ID tidak valid.
      </div>
    );
  }

  const orderAny = order as any;
  const payAny = pembayaran as any;
  const rawItemList = order.pesanMenu || orderAny.items || [];

  const itemList = rawItemList.filter((item: any) => {
    const namaMenu =
      item.menu?.menu || item.menu?.nama || `Menu ID: ${item.menuId}`;
    return namaMenu.toLowerCase().includes(itemSearchTerm.toLowerCase());
  });

  const kembalian = Math.max(0, jumlahBayar - Number(order.total));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2 cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.orderKode || order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pelanggan:{" "}
            <span className="font-semibold text-foreground">
              {order.pelanggan?.nama || orderAny.namaPelanggan || "Umum"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1">
            Status Order: <b className="ml-1">{order.status}</b>
          </Badge>
          <Badge
            variant={
              order.statusPembayaran === "SUDAH_DIBAYAR"
                ? "default"
                : "destructive"
            }
            className="text-sm px-3 py-1">
            {order.statusPembayaran === "SUDAH_DIBAYAR" ? "PAID" : "UNPAID"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Item Pesanan
              </CardTitle>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari menu..."
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-md"
                  />
                </div>

                {order.status === "MENUNGGU" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("DIKONFIRMASI")}>
                    Konfirmasi
                  </Button>
                )}
                {order.status === "DIKONFIRMASI" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("DISIAPKAN")}>
                    Mulai Siapkan
                  </Button>
                )}
                {order.status === "DISIAPKAN" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("SIAP")}>
                    Pesanan Siap
                  </Button>
                )}
                {order.status === "SIAP" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("SELESAI")}>
                    Selesaikan
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {itemList.length === 0 ? (
                  <p className="py-4 text-xs text-center text-muted-foreground">
                    Menu tidak ditemukan.
                  </p>
                ) : (
                  itemList.map((item: any, idx: number) => {
                    const itemHarga = Number(
                      item.hargaSnapshot || item.harga || item.menu?.harga || 0,
                    );
                    const itemJumlah = Number(item.jumlah || 0);
                    const itemSubTotal =
                      Number(item.subTotal) || itemJumlah * itemHarga;

                    return (
                      <div
                        key={item.id || idx}
                        className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">
                            {item.menu?.menu ||
                              item.menu?.nama ||
                              `Menu ID: ${item.menuId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {itemJumlah} x Rp{" "}
                            {itemHarga.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span className="font-semibold">
                          Rp {itemSubTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t pt-4 mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    Rp{" "}
                    {Number(
                      order.subTotal || orderAny.subtotal || order.total,
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(order.diskon) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon Member ({order.diskon}%)</span>
                    <span>
                      - Rp{" "}
                      {(
                        Number(
                          order.subTotal || orderAny.subtotal || order.total,
                        ) *
                        (order.diskon / 100)
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total Tagihan</span>
                  <span>Rp {Number(order.total).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pembayaran
              </CardTitle>
            </CardHeader>

            <CardContent>
              {order.statusPembayaran === "SUDAH_DIBAYAR" ? (
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-bold">Lunas</p>
                      <p className="text-xs">
                        Metode:{" "}
                        {pembayaran?.metode || payAny?.metodeBayar || "CASH"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
                    <div className="flex justify-between">
                      <span>Total Bayar:</span>
                      <span className="font-medium text-foreground">
                        Rp{" "}
                        {Number(
                          pembayaran?.jumlah ||
                            payAny?.totalBayar ||
                            order.total,
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kembalian:</span>
                      <span className="font-medium text-foreground">
                        Rp{" "}
                        {Number(
                          payAny?.kembali || payAny?.kembalian || 0,
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsReceiptOpen(true)}
                    className="w-full gap-2 cursor-pointer mt-2">
                    <Printer className="h-4 w-4" /> Cetak / Download Struk
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleProcessPayment}
                  className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="metode">Metode Pembayaran</Label>
                    <select
                      id="metode"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={metodeBayar}
                      onChange={handleMetodeChange}>
                      <option value="CASH">CASH (TUNAI)</option>
                      <option value="QRIS">QRIS</option>
                      <option value="TRANSFER">TRANSFER</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bayar">Jumlah Uang Diterima</Label>
                    <Input
                      id="bayar"
                      type="number"
                      value={jumlahBayar}
                      onChange={(e) => setJumlahBayar(Number(e.target.value))}
                      required
                    />
                  </div>

                  {jumlahBayar >= Number(order.total) && (
                    <div className="p-2 bg-slate-100 rounded text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Kembalian:</span>
                        <span className="font-bold text-emerald-600">
                          Rp {kembalian.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={
                      processingPay || jumlahBayar < Number(order.total)
                    }>
                    {processingPay ? "Memproses..." : "Bayar Sekarang"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={order}
        pembayaran={pembayaran}
      />
    </div>
  );
};
