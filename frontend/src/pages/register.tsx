import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { register } from "../services/authService";

export const Register = () => {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Semua bidang input wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password minimal terdiri dari 6 karakter.");
      return;
    }

    const payload = { nama, email, password };
    setLoading(true);

    try {
      await register(payload);
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err: any) {
      const pesanError =
        err.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.";
      setErrorMsg(pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3E4C9]/40">
      <Card className="w-full max-w-sm bg-white border-[#D3D4C0] shadow-md rounded-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-xl sm:text-2xl font-bold text-[#0A2947]">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Buat akun baru untuk mengakses aplikasi kasir
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs sm:text-sm">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="nama"
                  className="text-xs sm:text-sm font-medium text-[#0A2947]">
                  Nama Lengkap
                </Label>
                <Input
                  id="nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap"
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-medium text-[#0A2947]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="border-[#D3D4C0] focus-visible:ring-[#0A2947] text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors cursor-pointer text-xs sm:text-sm h-9 sm:h-10">
              {loading ? "Memproses..." : "Daftar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9]/50 transition-colors cursor-pointer text-xs sm:text-sm h-9 sm:h-10"
              onClick={() => navigate("/login")}>
              Sudah punya akun? Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
