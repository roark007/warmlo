interface DangerAlertProps {
  message: string;
}

export function DangerAlert({ message }: DangerAlertProps) {
  return (
    <div
      className="flex gap-3.5 rounded-md border border-[rgba(224,73,46,0.32)] bg-[linear-gradient(180deg,#fbeeeb,#f7e2dd)] p-[18px_20px]"
      role="alert"
    >
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-emerg-solid text-sm font-bold text-white">
        !
      </span>
      <p className="text-[15px] font-bold leading-[22px] text-emerg-ink">{message}</p>
    </div>
  );
}
