import type { Severity } from "@/lib/schemas";

interface FurnaceReadoutProps {
  code: string;
  label: string;
  brandName: string;
  series?: string;
  severity: Severity;
}

function ledColor(severity: Severity) {
  switch (severity) {
    case "diy-possible":
      return { color: "var(--safe-led)", glow: "var(--led-glow-green)" };
    case "emergency":
      return { color: "var(--emerg-led)", glow: "var(--led-glow-red)" };
    default:
      return { color: "var(--pro-led)", glow: "var(--led-glow-amber)" };
  }
}

export function FurnaceReadout({
  code,
  label,
  brandName,
  series,
  severity,
}: FurnaceReadoutProps) {
  const { color, glow } = ledColor(severity);

  return (
    <div
      className="mx-auto w-[min(340px,80vw)] rounded-[22px] border border-[rgba(255,170,84,0.18)] p-[26px]"
      style={{
        background: "var(--grad-panel-dark)",
        boxShadow: "var(--shadow-panel), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="mb-3.5 text-[11px] uppercase tracking-[0.28em] text-[#7a6c5c]">
        Furnace control · fault
      </div>
      <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,170,84,0.14)] bg-[radial-gradient(120%_100%_at_50%_0%,#1c1a12,#0c0a06)] px-5 py-[30px] text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,187,99,0.05)_50%,transparent_50%)] bg-[length:100%_4px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-[40%] bg-[linear-gradient(180deg,rgba(255,187,99,0.10),transparent)] motion-safe:animate-[readoutScan_4.5s_linear_infinite]"
          aria-hidden="true"
        />
        <div
          className={`relative font-ui text-[78px] font-bold leading-none tracking-[0.06em] motion-safe:animate-[flicker_6s_infinite] ${severity === "emergency" ? "" : ""}`}
          style={{ color, textShadow: glow }}
        >
          {code}
        </div>
        <div className="relative mt-3 text-[12px] uppercase tracking-[0.22em] text-[#c99a5e]">
          {label}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-[11px] text-[#7a6c5c]">
        <span>{brandName.toUpperCase()}</span>
        {series && <span>{series}</span>}
      </div>
    </div>
  );
}
