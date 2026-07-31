import { CheckIcon } from "./icons";

const STEP_LABELS = ["What's the job?", "The quote", "Your verdict"];

interface QuoteCheckStepperProps {
  currentStep: 1 | 2 | 3;
}

export function QuoteCheckStepper({ currentStep }: QuoteCheckStepperProps) {
  return (
    <div className="mb-[clamp(24px,3vw,36px)] flex flex-wrap items-center gap-2.5">
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n <= currentStep;
        return (
          <div key={label} className="flex flex-1 min-w-[140px] items-center gap-2.5">
            {i > 0 && (
              <span className="hidden min-w-[14px] flex-1 h-0.5 rounded-sm bg-[rgba(23,18,14,0.12)] sm:block" />
            )}
            <div
              className={`inline-flex items-center gap-2 text-[13.5px] font-semibold ${
                active ? "text-text-strong" : "text-text-muted"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-[8px] text-[13px] ${
                  active ? "bg-ember-deeper text-white" : "bg-paper-sink text-text-muted"
                }`}
              >
                {n < currentStep ? <CheckIcon size={12} /> : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span className="min-w-[14px] flex-1 h-0.5 rounded-sm bg-[rgba(23,18,14,0.12)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
