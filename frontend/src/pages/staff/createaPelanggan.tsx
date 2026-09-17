import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPelanggan } from "../../services/pelangganService";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export const CreatePelanggan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    nomer_hp: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi manual Javascript tanpa Zod
    if (!formData.nama.trim()) {
      setErrorMsg("Nama pelanggan wajib diisi");
      return;
    }

    if (!formData.nomer_hp.trim()) {
      setErrorMsg("Nomer handphone wajib diisi");
      return;
    }

    if (!formData.alamat.trim()) {
      setErrorMsg("Alamat wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await createPelanggan(formData);
      if (res.data || res) {
        navigate("/orders/create");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Gagal menambah pelanggan",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-xl mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2 cursor-pointer text-[#0A2947] hover:bg-slate-100">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <Card className="w-full bg-white border-[#D3D4C0] shadow-sm rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg sm:text-xl font-bold text-[#0A2947]">
            Daftarkan Pelanggan Baru
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Masukkan informasi lengkap pelanggan baru untuk melanjutkan pesanan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl">
              {errorMsg}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="nama"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Nama Pelanggan
              </Label>
              <Input
                id="nama"
                placeholder="Masukkan nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                required
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="nomer_hp"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Nomer Handphone
              </Label>
              <Input
                id="nomer_hp"
                placeholder="08xxxxxxxxxx"
                value={formData.nomer_hp}
                onChange={(e) =>
                  setFormData({ ...formData, nomer_hp: e.target.value })
                }
                required
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="alamat"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Alamat
              </Label>
              <Input
                id="alamat"
                placeholder="Masukkan alamat"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                required
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors cursor-pointer text-xs sm:text-sm h-9 sm:h-10 mt-2">
              {loading ? "Menyimpan..." : "Simpan Pelanggan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePelanggan;
