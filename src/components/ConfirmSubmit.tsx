"use client";

type Props = {
  label: string;
  message: string;
  className?: string;
  /** Aksi server. Data baris (mis. nomor) disematkan dengan bind(); nama dan nilai tombol tidak ikut terkirim. */
  formAction: (formData: FormData) => void | Promise<void>;
};

/** Tombol submit yang meminta konfirmasi sebelum menjalankan server action. */
export default function ConfirmSubmit({ label, message, className = "btn-danger", formAction }: Props) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
