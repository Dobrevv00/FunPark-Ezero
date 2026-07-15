export default function Badge({ children }: { children: string }) {
  return (
    <div className="flex h-[33px] w-[104px] items-center justify-center overflow-hidden rounded-[17.949px] border-[0.897px] border-[#3f3f46]">
      <p className="whitespace-nowrap text-center text-[10.769px] leading-[1.3] tracking-[0.1077px] text-[#545454]">
        {children}
      </p>
    </div>
  );
}
