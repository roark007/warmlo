interface LedChipProps {
  children: React.ReactNode;
  size?: "default" | "small";
}

export function LedChip({ children, size = "default" }: LedChipProps) {
  const sizeClasses =
    size === "small"
      ? "text-xs px-2 py-1 h-6 tracking-[0.04em]"
      : "text-sm px-2.5 py-1.5 h-7 tracking-[0.04em]";

  return (
    <span
      className={`led-glow inline-flex items-center rounded-[4px] bg-ink-900 font-semibold [font-feature-settings:"tnum"] ${sizeClasses}`}
    >
      {children}
    </span>
  );
}
