"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ADMIN_PASS, ADMIN_USER, AUTH_KEY } from "@/lib/adminAuth";

export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onClose();
      router.push("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-[16px]"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Вход за администратор"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[400px] max-w-full flex-col items-center rounded-[10px] bg-offwhite px-[32px] py-[40px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.15)]"
      >
        <button
          type="button"
          aria-label="Затвори"
          className="absolute right-[18px] top-[16px] cursor-pointer font-golos text-[18px] leading-none text-[#a1a1aa] transition-colors hover:text-ink"
          onClick={onClose}
        >
          ✕
        </button>

        <Logo className="h-[49px] w-[71px]" />
        <h2 className="mt-[20px] font-golos text-[25px] font-bold text-ink">
          Админ панел
        </h2>
        <p className="mt-[6px] text-[14px] text-[#545454]">
          Влезте, за да управлявате резервациите
        </p>

        <label className="mt-[28px] w-full font-golos text-[14px] font-medium text-ink">
          Име
        </label>
        <input
          type="text"
          value={user}
          onChange={(e) => {
            setUser(e.target.value);
            setError(false);
          }}
          autoFocus
          className="mt-[8px] h-[41px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] text-[16px] text-ink outline-none focus:ring-2 focus:ring-forest/40"
        />

        <label className="mt-[16px] w-full font-golos text-[14px] font-medium text-ink">
          Парола
        </label>
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setError(false);
          }}
          className="mt-[8px] h-[41px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] text-[16px] text-ink outline-none focus:ring-2 focus:ring-forest/40"
        />

        {error && (
          <p className="mt-[12px] w-full text-[13px] text-red-600">
            Грешно име или парола. Опитайте отново.
          </p>
        )}

        <button
          type="submit"
          className="mt-[24px] w-full cursor-pointer rounded-[10px] bg-sun py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 transition-colors hover:bg-[#e0b32f]"
        >
          Вход
        </button>
      </form>
    </div>
  );
}
