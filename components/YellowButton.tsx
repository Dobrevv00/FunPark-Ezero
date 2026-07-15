export default function YellowButton({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={`flex items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] transition-colors hover:bg-[#e0b32f] ${className}`}
    >
      <span className="whitespace-nowrap text-center text-[15px] font-semibold leading-[20px] text-black/80">
        {children}
      </span>
    </a>
  );
}
