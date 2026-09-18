import Link from "next/link";

export function Logo({ className }: { className: string }) {
  return (
    <Link
      href="/"
      className={`fx-icon relative block overflow-hidden ${className}`}
    >
      <span className="absolute inset-[2.67%_0_0_0]">
        <img src="/icons/logo-mark.svg" alt="Fun Park Ezero" className="size-full" />
      </span>
      <span className="absolute inset-[0_37%_78.73%_34.4%]">
        <img src="/icons/logo-leaf.svg" alt="" className="size-full" />
      </span>
    </Link>
  );
}
