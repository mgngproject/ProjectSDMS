import { hariIni } from "@/lib/format";

export const text = (f: FormData, k: string): string | null => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};

/** Pesan galat Postgres yang ramah untuk pengguna. */
export function pesanGalat(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    if (error.message.includes("np")) return "NP sudah terdaftar.";
    if (error.message.includes("ktp")) return "No. KTP sudah terdaftar.";
    return "Data sudah ada.";
  }
  if (error.code === "42501") return "Anda tidak memiliki akses untuk tindakan ini.";
  if (error.code === "23514") return "Ada isian yang tidak sesuai aturan.";
  return error.message;
}

export function dengan(path: string, key: "ok" | "error", pesan: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(pesan)}`;
}
