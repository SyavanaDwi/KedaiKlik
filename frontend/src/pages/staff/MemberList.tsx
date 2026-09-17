import React, { useEffect, useState } from "react";
import { getAllPelanggan } from "../../services/pelangganService";
import { createMember, updateMember } from "../../services/memberService";

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
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Phone,
  MapPin,
  UserPlus,
  UserCheck,
  UserX,
  RefreshCcw,
} from "lucide-react";

export const MemberList = () => {
  // ==================== 1. STATE MANAGEMENT ====================
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ==================== 2. DATA FETCHING ====================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllPelanggan();
      const data = Array.isArray(res) ? res : res.data || [];
      setPelangganList(data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggan/member:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================== 3. ACTION HANDLERS ====================
  const handleCreateMember = async (
    pelangganId: number,
    namaPelanggan: string,
  ) => {
    const generatedKode = `MBR-${Date.now().toString().slice(-6)}`;

    if (window.confirm(`Jadikan "${namaPelanggan}" sebagai member baru?`)) {
      const payload = {
        pelangganId: Number(pelangganId),
        memberKode: generatedKode,
        diskon: 10, // Default diskon awal 10%
        statusMember: true,
      };

      try {
        await createMember(payload);
        alert("Berhasil mengaktifkan member!");
        loadData();
      } catch (err: any) {
        console.error("Error createMember:", err);
        alert(
          err?.response?.data?.message || "Gagal menambahkan status member",
        );
      }
    }
  };

  const handleToggleStatus = async (
    memberId: number,
    statusSaatIni: boolean,
    namaPelanggan: string,
  ) => {
    const actionName = statusSaatIni ? "menonaktifkan" : "mengaktifkan kembali";
    if (
      window.confirm(
        `Apakah Anda yakin ingin ${actionName} status member untuk "${namaPelanggan}"?`,
      )
    ) {
      const payload = {
        statusMember: !statusSaatIni,
      };

      try {
        await updateMember(memberId, payload);
        loadData();
      } catch (err) {
        alert("Gagal memperbarui status member");
      }
    }
  };

  // ==================== 4. FILTER & COMPUTED DATA ====================
  const filteredPelanggan = pelangganList
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      const namaMatch = item.nama?.toLowerCase().includes(search);
      const hpMatch = (item.nomer_hp || item.nomerHp || "")
        .toLowerCase()
        .includes(search);
      const alamatMatch = item.alamat?.toLowerCase().includes(search);
      const kodeMatch = item.member?.memberKode?.toLowerCase().includes(search);

      return namaMatch || hpMatch || alamatMatch || kodeMatch;
    })
    .sort((a, b) => {
      const statusA = a.statusPelanggan !== false;
      const statusB = b.statusPelanggan !== false;
      if (statusA && !statusB) return -1;
      if (!statusA && statusB) return 1;
      return 0;
    });

  // ==================== 5. RENDER UI ====================
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100/75 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D3D4C0] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2947]">
            Daftar Pelanggan & Member
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola data pelanggan dan aktivasi status member operasional.
          </p>
        </div>

        {/* Tombol Muat Ulang */}
        <Button
          onClick={loadData}
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
            placeholder="Cari nama, nomor HP, alamat, atau kode member..."
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
            Memuat data pelanggan...
          </div>
        ) : filteredPelanggan.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-2xl border border-[#D3D4C0]">
            Tidak ada pelanggan ditemukan.
          </div>
        ) : (
          filteredPelanggan.map((item) => {
            const isAktif = item.statusPelanggan !== false;
            const hasMember = Boolean(item.member);
            const isMemberAktif = item.member?.statusMember ?? false;
            const totalOrder =
              item._count?.order ||
              item._count?.orders ||
              item.orders?.length ||
              0;

            return (
              <Card
                key={item.id}
                className={`border-[#D3D4C0] shadow-xs rounded-2xl bg-white overflow-hidden ${
                  !isAktif ? "bg-red-50/50 opacity-80" : ""
                }`}>
                <CardContent className="p-4 space-y-3">
                  {/* Baris Atas: Nama & Status Akun */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2947]">
                        {item.nama}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Total Order: {totalOrder}x
                      </p>
                    </div>
                    <div>
                      {isAktif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <ShieldAlert className="h-3 w-3" /> Blacklisted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kontak & Alamat */}
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{item.nomer_hp || item.nomerHp || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.alamat || "-"}</span>
                    </div>
                  </div>

                  {/* Status Member & Aksi */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      {hasMember ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E4C9] text-[#8B5E3C]">
                            {item.member.memberKode}
                          </span>
                          {isMemberAktif ? (
                            <span className="text-[10px] font-bold text-emerald-600">
                              (Member Aktif)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                              (Nonaktif)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">
                          Pelanggan Reguler
                        </span>
                      )}
                    </div>

                    <div>
                      {hasMember ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-7 px-2.5 text-[11px] cursor-pointer ${
                            isMemberAktif
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-blue-300 text-blue-700 hover:bg-blue-50"
                          }`}
                          onClick={() =>
                            handleToggleStatus(
                              item.member.id,
                              isMemberAktif,
                              item.nama,
                            )
                          }>
                          {isMemberAktif ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" /> Matikan Mbr
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" /> Aktifkan
                              Mbr
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-[11px] cursor-pointer bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors"
                          onClick={() =>
                            handleCreateMember(item.id, item.nama)
                          }>
                          <UserPlus className="h-3 w-3 mr-1" /> Jadikan Member
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* TAMPILAN DESKTOP: TABEL RESPONSIF (Hidden di layar kecil) */}
      <div className="hidden md:block border border-[#D3D4C0] rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
                <TableHead className="min-w-[160px] text-[#0A2947] font-bold">
                  Status Member
                </TableHead>
                <TableHead className="min-w-[110px] text-[#0A2947] font-bold">
                  Status Akun
                </TableHead>
                <TableHead className="text-right min-w-[160px] text-[#0A2947] font-bold">
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
              ) : filteredPelanggan.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-slate-500">
                    Tidak ada pelanggan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPelanggan.map((item) => {
                  const isAktif = item.statusPelanggan !== false;
                  const hasMember = Boolean(item.member);
                  const isMemberAktif = item.member?.statusMember ?? false;
                  const totalOrder =
                    item._count?.order ||
                    item._count?.orders ||
                    item.orders?.length ||
                    0;

                  return (
                    <TableRow
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                        !isAktif ? "bg-red-50/50 opacity-75" : ""
                      }`}>
                      <TableCell>
                        <div className="font-semibold text-xs sm:text-sm text-[#0A2947]">
                          {item.nama}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total Order: {totalOrder}x
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{item.nomer_hp || item.nomerHp || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-xs truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.alamat || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasMember ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#F3E4C9] text-[#8B5E3C]">
                                {item.member.memberKode}
                              </span>
                              {isMemberAktif ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                                  Nonaktif
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Diskon: {item.member.diskon}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 font-medium">
                              Reguler
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Diskon: 0%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAktif ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                            <ShieldAlert className="h-3 w-3" /> Blacklisted
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasMember ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className={
                                isMemberAktif
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50 h-8 px-2.5 text-xs cursor-pointer"
                                  : "border-blue-300 text-blue-700 hover:bg-blue-50 h-8 px-2.5 text-xs cursor-pointer"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  item.member.id,
                                  isMemberAktif,
                                  item.nama,
                                )
                              }>
                              {isMemberAktif ? (
                                <>
                                  <UserX className="h-3.5 w-3.5 mr-1" /> Matikan
                                  Mbr
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />{" "}
                                  Aktifkan Mbr
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 px-2.5 text-xs cursor-pointer bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors"
                              onClick={() =>
                                handleCreateMember(item.id, item.nama)
                              }>
                              <UserPlus className="h-3.5 w-3.5 mr-1" /> Jadikan
                              Member
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
