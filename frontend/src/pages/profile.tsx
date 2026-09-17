import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { updateUser } from "../services/userService";

export const Profile = () => {
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;

  const [nama, setNama] = useState(currentUser?.nama || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      alert("Sesi pengguna tidak valid. Silakan login kembali.");
      return;
    }

    if (!nama.trim() || !email.trim()) {
      alert("Nama dan email tidak boleh kosong");
      return;
    }

    const payload: { nama: string; email: string; password?: string } = {
      nama,
      email,
    };

    if (password) {
      payload.password = password;
    }

    setLoading(true);

    try {
      const res = await updateUser(currentUser.id, payload);
      const updatedUser = res.data?.data || res.data || res;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profil berhasil diperbarui!");
      setPassword("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full bg-white border-[#D3D4C0] shadow-sm rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg sm:text-xl font-bold text-[#0A2947]">
            Edit Profil
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Perbarui informasi nama, email, atau password akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="nama"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="password"
                className="text-xs sm:text-sm font-medium text-[#0A2947]">
                Password Baru (Opsional)
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diubah"
                className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors cursor-pointer text-xs sm:text-sm h-9 sm:h-10 mt-2">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
