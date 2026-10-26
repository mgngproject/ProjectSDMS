"use client";

type Props = {
  label: string;
  message: string;
  className?: string;
  formAction: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string | number;
};

/** Tombol submit yang meminta konfirmasi sebelum menjalankan server action. */
export default function ConfirmSubmit({ label, message, className = "btn-danger", formAction, name, value }: Props) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      name={name}
      value={value}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
