import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Phone,
  MapPin,
  Percent,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import api from "@/services/api";

interface Member {
  id: number;
  memberKode: string;
  diskon: string | number;
  statusMember: boolean;
}

interface Pelanggan {
  id: number;
  nama: string;
  nomer_hp: string;
  alamat: string;
  statusPelanggan: boolean;
  member?: Member | null;
  _count?: {
    order: number;
  };
}

export const AdminCustomers = () => {
  // ==================== 1. STATE MANAGEMENT ====================
  const [customers, setCustomers] = useState<Pelanggan[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Dialog Atur Diskon Member
  const [isDiskonModalOpen, setIsDiskonModalOpen] = useState<boolean>(false);
  const [updateMode, setUpdateMode] = useState<"single" | "all">("single");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [newDiskon, setNewDiskon] = useState<string>("");
  const [submittingDiskon, setSubmittingDiskon] = useState<boolean>(false);

  // ==================== 2. DATA FETCHING ====================
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pelanggan");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setCustomers(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Gagal memuat data pelanggan:", err);
      setError("Gagal memuat daftar pelanggan dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==================== 3. ACTION HANDLERS ====================

  // Toggle Status Blacklist / Aktif Akun Pelanggan
  const handleToggleBlacklist = async (
    id: number,
    nama: string,
    currentStatus: boolean,
  ) => {
    const willBeBlacklisted = currentStatus;
    const actionText = willBeBlacklisted
      ? "mem-blacklist"
      : "membuka kembali (mengaktifkan)";

    if (
      window.confirm(
        `Apakah Anda yakin ingin ${actionText} pelanggan "${nama}"?`,
      )
    ) {
      try {
        await api.patch(`/pelanggan/${id}/blacklist`, {
          statusPelanggan: !willBeBlacklisted,
        });

        setCustomers(
          customers.map((item) =>
            item.id === id
              ? { ...item, statusPelanggan: !willBeBlacklisted }
              : item,
          ),
        );
      } catch (err: any) {
        alert(
          err.response?.data?.message ||
            "Gagal mengubah status blacklist pelanggan.",
        );
      }
    }
  };

  // Toggle Status Aktif / Nonaktif Member
  const handleToggleMemberStatus = async (
    memberId: number,
    currentStatus: boolean,
    namaPelanggan: string,
  ) => {
    const actionName = currentStatus ? "menonaktifkan" : "mengaktifkan kembali";
    if (
      window.confirm(
        `Apakah Anda yakin ingin ${actionName} status member untuk "${namaPelanggan}"?`,
      )
    ) {
      try {
        await api.put(`/member/${memberId}`, {
          statusMember: !currentStatus,
        });

        setCustomers(
          customers.map((item) => {
            if (item.member && item.member.id === memberId) {
              return {
                ...item,
                member: {
                  ...item.member,
                  statusMember: !currentStatus,
                },
              };
            }
            return item;
          }),
        );
        alert(`Status member berhasil diubah!`);
      } catch (err: any) {
        alert(
          err.response?.data?.message ||
            "Gagal mengubah status keaktifan member.",
        );
      }
    }
  };

  // Ubah Pelanggan Biasa Menjadi Member Baru
  const handleCreateMember = async (
    pelangganId: number,
    namaPelanggan: string,
  ) => {
    const generatedKode = `MBR-${Date.now().toString().slice(-6)}`;

    if (window.confirm(`Jadikan "${namaPelanggan}" sebagai member baru?`)) {
      try {
        const payload = {
          pelangganId: Number(pelangganId),
          memberKode: generatedKode,
          diskon: 10, // Default diskon awal 10%
          statusMember: true,
        };

        await api.post("/member", payload);
        alert("Berhasil mendaftarkan pelanggan sebagai member!");
        fetchCustomers();
      } catch (err: any) {
        console.error("Error createMember:", err);
        alert(
          err?.response?.data?.message || "Gagal menambahkan status member",
        );
      }
    }
  };

  // Update Diskon Member (Single / Massal)
  const handleUpdateDiskon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (updateMode === "single" && !selectedMemberId) {
      alert("Silakan pilih member terlebih dahulu!");
      return;
    }

    try {
      setSubmittingDiskon(true);

      if (updateMode === "all") {
        if (
          !window.confirm(
            "Apakah Anda yakin ingin mengubah diskon untuk SEMUA member sekaligus?",
          )
        ) {
          setSubmittingDiskon(false);
          return;
        }
        await api.put("/member/all/diskon", { diskon: Number(newDiskon) });
        alert("Diskon untuk semua member berhasil diperbarui!");
      } else {
        await api.put(`/member/${selectedMemberId}`, {
          diskon: Number(newDiskon),
        });
        alert("Diskon member berhasil diperbarui!");
      }

      setIsDiskonModalOpen(false);
      setSelectedMemberId("");
      setNewDiskon("");
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui diskon member.");
    } finally {
      setSubmittingDiskon(false);
    }
  };

  // ==================== 4. FILTER & COMPUTED DATA ====================
  const memberList = customers.filter((c) => c.member);

  const filteredCustomers = customers
    .filter(
      (item) =>
        item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomer_hp?.includes(searchQuery) ||
        item.alamat?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.statusPelanggan && !b.statusPelanggan) return -1;
      if (!a.statusPelanggan && b.statusPelanggan) return 1;
      return 0;
    });

  // ==================== 5. RENDER UI ====================
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Manajemen Pelanggan & Member
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola data pelanggan, status keaktifan, dan pengaturan diskon
            member.
          </p>
        </div>

        {/* Tombol Aksi Header */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsDiskonModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 flex-1 sm:flex-none bg-[#0A2947] hover:bg-[#0A2947]/90 text-white cursor-pointer h-9">
            <Percent className="h-4 w-4" /> Atur Diskon Member
          </Button>
          <Button
            onClick={fetchCustomers}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-9 gap-1.5 border-[#D3D4C0] hover:bg-[#0A2947] hover:text-white transition-colors cursor-pointer">
            <RefreshCcw className="h-3.5 w-3.5" /> Muat Ulang
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama, nomor HP, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm bg-white border-[#D3D4C0] rounded-xl shadow-xs focus-visible:ring-[#0A2947]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Tabel Data Pelanggan (Container Card) */}
      <Card className="border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* TAMPILAN MOBILE / HP: CARD VIEW (Hidden di MD ke atas) */}
          <div className="block md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Memuat data pelanggan...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Tidak ada pelanggan ditemukan.
              </div>
            ) : (
              filteredCustomers.map((item) => {
                const isAktif = item.statusPelanggan;
                const hasMember = Boolean(item.member);
                const isMemberAktif = item.member?.statusMember ?? false;

                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-xl space-y-3 ${
                      !isAktif
                        ? "bg-red-50/50 border-red-200"
                        : "bg-slate-50/50 border-slate-200"
                    }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-[#0A2947]">
                          {item.nama}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Total Order: {item._count?.order || 0}x
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          isAktif
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {isAktif ? (
                          <>
                            <ShieldCheck className="h-3 w-3" /> Aktif
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3 w-3" /> Blacklisted
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{item.nomer_hp || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.alamat || "-"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        {hasMember ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                              {item.member?.memberKode}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                isMemberAktif
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                              {isMemberAktif ? "Mbr Aktif" : "Mbr Nonaktif"}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              ({item.member?.diskon}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Reguler</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end items-center gap-1 pt-2 border-t border-slate-200/60">
                      {hasMember && item.member ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            isMemberAktif
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50 h-8 px-2 text-xs"
                              : "border-blue-300 text-blue-700 hover:bg-blue-50 h-8 px-2 text-xs"
                          }
                          onClick={() =>
                            handleToggleMemberStatus(
                              item.member!.id,
                              isMemberAktif,
                              item.nama,
                            )
                          }>
                          {isMemberAktif ? (
                            <UserX className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                          )}
                          {isMemberAktif ? "Matikan Mbr" : "Aktifkan Mbr"}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 text-xs"
                          onClick={() =>
                            handleCreateMember(item.id, item.nama)
                          }>
                          <UserPlus className="h-3.5 w-3.5 mr-1" /> Jadikan
                          Member
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          isAktif
                            ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 text-xs"
                            : "border-green-300 text-green-700 hover:bg-green-50 h-8 px-2 text-xs"
                        }
                        onClick={() =>
                          handleToggleBlacklist(item.id, item.nama, isAktif)
                        }>
                        {isAktif ? "Blacklist" : "Aktifkan"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TAMPILAN DESKTOP: TABEL RESPONSIF (Hidden di layar kecil) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-[#D3D4C0]">
                  <TableHead className="min-w-[150px] text-[#0A2947] font-bold">
                    Nama Pelanggan
                  </TableHead>
                  <TableHead className="min-w-[130px] text-[#0A2947] font-bold">
                    Nomor HP
                  </TableHead>
                  <TableHead className="min-w-[180px] text-[#0A2947] font-bold">
                    Alamat
                  </TableHead>
                  <TableHead className="min-w-[150px] text-[#0A2947] font-bold">
                    Status Member
                  </TableHead>
                  <TableHead className="min-w-[110px] text-[#0A2947] font-bold">
                    Status Akun
                  </TableHead>
                  <TableHead className="text-right min-w-[210px] text-[#0A2947] font-bold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-xs text-slate-500">
                      Memuat data pelanggan...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-xs text-slate-500">
                      Tidak ada pelanggan ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((item) => {
                    const isAktif = item.statusPelanggan;
                    const hasMember = Boolean(item.member);
                    const isMemberAktif = item.member?.statusMember ?? false;

                    return (
                      <TableRow
                        key={item.id}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                          !isAktif ? "bg-red-50/50 opacity-75" : ""
                        }`}>
                        <TableCell>
                          <div className="font-bold text-sm text-[#0A2947]">
                            {item.nama}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Total Order: {item._count?.order || 0}x
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{item.nomer_hp || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-xs truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {item.alamat || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasMember ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.member?.memberKode}
                                </span>
                                {isMemberAktif ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                                    Nonaktif
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Diskon: {item.member?.diskon}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              Reguler
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isAktif ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <ShieldCheck className="h-3 w-3" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <ShieldAlert className="h-3 w-3" /> Blacklisted
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasMember && item.member ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className={
                                  isMemberAktif
                                    ? "border-amber-200 text-amber-700 hover:bg-amber-50 h-8 px-2 text-xs"
                                    : "border-blue-300 text-blue-700 hover:bg-blue-50 h-8 px-2 text-xs"
                                }
                                onClick={() =>
                                  handleToggleMemberStatus(
                                    item.member!.id,
                                    isMemberAktif,
                                    item.nama,
                                  )
                                }>
                                {isMemberAktif ? (
                                  <UserX className="h-3.5 w-3.5 mr-1" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                )}
                                {isMemberAktif ? "Matikan Mbr" : "Aktifkan Mbr"}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 text-xs"
                                onClick={() =>
                                  handleCreateMember(item.id, item.nama)
                                }>
                                <UserPlus className="h-3.5 w-3.5 mr-1" />{" "}
                                Jadikan Member
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                isAktif
                                  ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 text-xs"
                                  : "border-green-300 text-green-700 hover:bg-green-50 h-8 px-2 text-xs"
                              }
                              onClick={() =>
                                handleToggleBlacklist(
                                  item.id,
                                  item.nama,
                                  isAktif,
                                )
                              }>
                              {isAktif ? "Blacklist" : "Aktifkan"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog Pengaturan Diskon Member */}
      <Dialog
        open={isDiskonModalOpen}
        onOpenChange={setIsDiskonModalOpen}>
        <DialogContent className="max-w-md w-[90vw] sm:w-full rounded-2xl border-[#D3D4C0]">
          <DialogHeader>
            <DialogTitle className="text-[#0A2947] font-bold text-lg">
              Pengaturan Diskon Member
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleUpdateDiskon}
            className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                Target Perubahan Diskon
              </label>
              <select
                className="w-full border border-[#D3D4C0] rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A2947]"
                value={updateMode}
                onChange={(e) =>
                  setUpdateMode(e.target.value as "single" | "all")
                }>
                <option value="single">Pilih Satu Member Tertentu</option>
                <option value="all">Semua Member Sekaligus (Massal)</option>
              </select>
            </div>

            {updateMode === "single" && (
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Pilih Member
                </label>
                <select
                  required={updateMode === "single"}
                  className="w-full border border-[#D3D4C0] rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A2947]"
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    const found = memberList.find(
                      (m) => m.member?.id.toString() === e.target.value,
                    );
                    if (found && found.member) {
                      setNewDiskon(found.member.diskon.toString());
                    }
                  }}>
                  <option value="">-- Pilih Nama Member --</option>
                  {memberList.map((item) => (
                    <option
                      key={item.member?.id}
                      value={item.member?.id}>
                      {item.nama} ({item.member?.memberKode} -{" "}
                      {item.member?.diskon}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {updateMode === "all"
                  ? "Nilai Diskon Baru untuk SEMUA Member (%)"
                  : "Nilai Diskon Baru (%)"}
              </label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Contoh: 10 atau 5.5"
                value={newDiskon}
                onChange={(e) => setNewDiskon(e.target.value)}
                className="rounded-xl border-[#D3D4C0]"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDiskonModalOpen(false)}
                className="rounded-xl border-[#D3D4C0]">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingDiskon}
                className="rounded-xl bg-[#0A2947] hover:bg-[#0A2947]/90 text-white">
                {submittingDiskon ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
