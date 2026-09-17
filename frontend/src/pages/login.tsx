import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
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

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    const payload = { email, password };
    setLoading(true);

    try {
      const result = await login(payload);

      if (!result.token || !result.data) {
        setErrorMsg("Data login tidak lengkap dari server.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.data));

      const userRole = String(result.data.role || "").toUpperCase();
      if (userRole === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/orders");
      }
    } catch (err: any) {
      const pesanError =
        err.response?.data?.message ||
        "Terjadi kesalahan pada server. Coba lagi nanti.";
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
            Aplikasi Kasir
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Masukkan email dan password untuk masuk ke akun kamu
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs sm:text-sm">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3">
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
                  placeholder="••••••••"
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
              {loading ? "Memproses..." : "Masuk"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9]/50 transition-colors cursor-pointer text-xs sm:text-sm h-9 sm:h-10"
              onClick={() => navigate("/register")}>
              Daftar Akun Baru
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
