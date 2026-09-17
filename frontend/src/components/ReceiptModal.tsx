// components/ReceiptModal.tsx
import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  pembayaran?: any;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  pembayaran,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const rawItemList = order.pesanMenu || order.items || [];
  const totalBayar = Number(
    pembayaran?.jumlah || order.totalBayar || order.total,
  );
  const kembalian = Number(pembayaran?.kembali || pembayaran?.kembalian || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-xl print:shadow-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-center">Struk Pembayaran</DialogTitle>
        </DialogHeader>

        <div
          ref={printRef}
          className="p-4 bg-white text-slate-800 text-xs font-mono border rounded-md border-dashed border-slate-300 print:border-none print:p-0">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-base font-bold tracking-wider">RestoApp</h2>
            <p className="text-[10px] text-slate-500">Good Food, Good Mood</p>
            <h3 className="text-sm font-bold uppercase mt-2 tracking-widest border-y py-1 border-dashed border-slate-300">
              INVOICE
            </h3>
          </div>

          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-between">
              <span>Invoice No</span>
              <span>: INV-{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Order ID</span>
              <span>: #{order.orderKode || order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>
                :{" "}
                {new Date(order.createdAt || Date.now()).toLocaleDateString(
                  "id-ID",
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer</span>
              <span>: {order.pelanggan?.nama || "Pelanggan Umum"}</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="grid grid-cols-12 font-bold pb-1 text-[11px]">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Subtotal</span>
            </div>
            {rawItemList.map((item: any, idx: number) => {
              const harga = Number(
                item.hargaSnapshot || item.harga || item.menu?.harga || 0,
              );
              const qty = Number(item.jumlah || 0);
              const subtotal = Number(item.subTotal) || qty * harga;

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 text-[11px]">
                  <span className="col-span-6 truncate">
                    {item.menu?.menu || `Menu ID: ${item.menuId}`}
                  </span>
                  <span className="col-span-2 text-center">{qty}</span>
                  <span className="col-span-4 text-right">
                    {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {Number(
                  order.subTotal || order.subtotal || order.total,
                ).toLocaleString("id-ID")}
              </span>
            </div>
            {Number(order.diskon) > 0 && (
              <div className="flex justify-between">
                <span>Diskon ({order.diskon}%)</span>
                <span>
                  -
                  {(
                    Number(order.subTotal || order.total) *
                    (order.diskon / 100)
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed">
              <span>TOTAL</span>
              <span>Rp {Number(order.total).toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* DETAIL PEMBAYARAN */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-4">
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>: {pembayaran?.metode || "CASH"}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Received</span>
              <span>: Rp {totalBayar.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Change</span>
              <span>: Rp {kembalian.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 space-y-1">
            <p>Thank you!</p>
            <p>Please come again.</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-4 print:hidden">
          <Button
            onClick={handlePrint}
            className="w-full gap-2 cursor-pointer">
            <Printer className="h-4 w-4" /> Cetak / Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
