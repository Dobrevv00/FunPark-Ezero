"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockPreview } from "@/lib/actions/preview";

/**
 * Вход с парола на екрана „Очаквайте скоро“.
 *
 * Паролата се проверява на сървъра (`unlockPreview`) — тук не се пази и не се
 * сравнява нищо. При успех сървърът слага httpOnly бисквитка и посетителят се
 * праща към началната страница.
 */
export default function ComingSoonUnlock() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    const res = await unlockPreview(value);
    if (res.ok) {
      // сървърът вече е сложил бисквитката — начална страница без екрана
      router.replace("/");
      router.refresh();
      return;
    }
    setSending(false);
    setError(res.error);
    setValue("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[30px] cursor-pointer font-mulish text-[13px] font-semibold text-white/55 underline decoration-white/25 underline-offset-[4px] transition-colors hover:text-offwhite hover:decoration-sun"
      >
        Вход с парола
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-[30px] flex w-full max-w-[420px] flex-col items-center gap-[10px]"
    >
      <label htmlFor="cs-password" className="sr-only">
        Парола за достъп
      </label>
      <div className="flex w-full flex-col gap-[10px] sm:flex-row">
        <input
          id="cs-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          placeholder="Парола за достъп"
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          className="h-[46px] w-full rounded-full border border-white/15 bg-white/5 px-[20px] font-mulish text-[14px] text-offwhite outline-none transition-colors placeholder:text-white/40 focus:border-sun/60"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex h-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-sun px-[26px] font-golos text-[14px] font-semibold text-black/80 transition-colors hover:bg-[#e0b32f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sending ? "Проверка…" : "Влез"}
        </button>
      </div>

      {error && (
        <p role="alert" className="font-mulish text-[13px] font-semibold text-sun">
          {error}
        </p>
      )}
    </form>
  );
}
