import { AlertTriangleIcon } from "./icons";

interface DangerAlertProps {
  message: string;
}

export function DangerAlert({ message }: DangerAlertProps) {
  return (
    <div
      className="alert-presence flex gap-3 rounded-md border border-[#FECACA] border-l-4 border-l-[#DC2626] bg-[#FEF2F2] p-4"
      role="alert"
    >
      <AlertTriangleIcon size={20} className="mt-px shrink-0 text-[#DC2626]" />
      <p className="text-[15px] font-semibold leading-[22px] text-[#7F1D1D]">{message}</p>
    </div>
  );
}
