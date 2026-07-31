interface NumberedStepListProps {
  steps: string[];
  severity?: "diy-possible" | "call-pro-soon" | "emergency";
}

export function NumberedStepList({ steps, severity = "diy-possible" }: NumberedStepListProps) {
  const isSafe = severity === "diy-possible";

  return (
    <div
      className={`rounded-[20px] border p-[clamp(22px,3vw,32px)] ${
        isSafe
          ? "border-[rgba(31,157,99,0.22)] bg-[linear-gradient(180deg,#eef6ef,#e6f2e8)]"
          : "border-[rgba(224,135,26,0.22)] bg-[linear-gradient(180deg,#fbf3e6,#f7ecd9)]"
      }`}
    >
      <ol className="grid list-none gap-3 p-0">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3.5 text-[15.5px] leading-[1.55] text-[#2f3a33]">
            <span
              className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] text-sm font-bold text-white ${
                isSafe ? "bg-safe-solid" : "bg-pro-solid"
              }`}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
