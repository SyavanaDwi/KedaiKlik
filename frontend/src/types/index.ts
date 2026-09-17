export type Role = "ADMIN" | "STAFF";
export type Kategori = "MAKANAN" | "MINUMAN";
export type StatusOrder =
  | "MENUNGGU"
  | "DIKONFIRMASI"
  | "DISIAPKAN"
  | "SIAP"
  | "SELESAI"
  | "DIBATALKAN";
export type StatusPembayaran = "SUDAH_DIBAYAR" | "BELUM_DIBAYAR";
export type MetodePembayaran = "CASH" | "QRIS" | "TRANSFER";

export interface ApiResponse<T> {
  message: string;
  data?: T;
  token?: string;
}

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
  statusUser?: boolean;
}

export interface loginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nama: string;
  email: string;
  password: string;
}

export interface Menu {
  id: number;
  menu: string;
  harga: number;
  kategori: Kategori;
  deskripsi?: string | null;
  image?: string | null;
  statusMenu: boolean;
}

export interface CreateMenuPayload {
  menu: string;
  harga: number;
  kategori: Kategori;
  deskripsi?: string;
  image?: string;
  statusMenu?: boolean;
}

export interface UpdateMenuPayload extends Partial<CreateMenuPayload> {}

export interface Pelanggan {
  id: number;
  nama: string;
  nomer_hp: string;
  alamat: string;
  statusPelanggan: boolean;
  member?: Member | null;
}

export interface CreatePelangganPayload {
  nama: string;
  nomer_hp: string;
  alamat: string;
  statusPelanggan?: boolean;
}

export interface UpdatePelangganPayload extends Partial<CreatePelangganPayload> {}

export interface Member {
  id: number;
  pelangganId: number;
  pelanggan?: Pelanggan;
  memberKode: string;
  diskon: number;
  statusMember: boolean;
}

export interface CreateMemberPayload {
  pelangganId: number;
  memberKode: string;
  diskon: number;
  statusMember?: boolean;
}

export interface UpdateMemberPayload extends Partial<CreateMemberPayload> {}

export interface PesanMenu {
  id?: number;
  menuId: number;
  menu?: Menu;
  jumlah: number;
  hargaSnapshot: number;
  subTotal: number;
}

export interface Order {
  id: number;
  orderKode: string;
  pelangganId: number;
  pelanggan?: Pelanggan;
  kasirId: number;
  status: StatusOrder;
  statusPembayaran: StatusPembayaran;
  subTotal: number;
  diskon: number;
  total: number;
  pesanMenu?: PesanMenu[];
}

export interface CreateOrderPayload {
  pelangganId: number;
  kasirId: number;
  items: {
    menuId: number;
    jumlah: number;
  }[];
  diskon?: number;
}

export interface UpdateOrderStatusPayload {
  status: StatusOrder;
  diubahOlehKasirId: number;
}

export interface Pembayaran {
  id: number;
  orderId: number;
  order?: Order;
  jumlah: number;
  metode: MetodePembayaran;
  penerimaKasirId: number;
}

export interface CreatePembayaranPayload {
  orderId: number;
  jumlah: number;
  metode: MetodePembayaran;
  penerimaKasirId: number;
}
