import { CheckIcon } from "./icons";

const STEP_LABELS = ["What's the job?", "The quote", "Your verdict"];

interface QuoteCheckStepperProps {
  currentStep: 1 | 2 | 3;
}

export function QuoteCheckStepper({ currentStep }: QuoteCheckStepperProps) {
  return (
    <div>
      <div className="flex gap-1.5 sm:hidden">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full ${
              n < currentStep ? "bg-ink-900" : n === currentStep ? "bg-pilot-600" : "bg-line"
            }`}
          />
        ))}
      </div>
      <div className="hidden sm:flex sm:items-start sm:justify-between">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const completed = n < currentStep;
          const current = n === currentStep;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && <div className="h-0.5 flex-1 bg-line" />}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold ${
                    completed
                      ? "bg-pilot-700 text-white"
                      : current
                        ? "bg-ink-900 text-paper"
                        : "border-[1.5px] border-line-strong bg-surface text-ink-500"
                  }`}
                >
                  {completed ? <CheckIcon size={14} /> : n}
                </div>
                {i < STEP_LABELS.length - 1 && <div className="h-0.5 flex-1 bg-line" />}
              </div>
              <p className="mt-2 max-w-[8rem] text-center text-[13px] font-medium text-ink-700">
                {label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[13px] font-medium text-ink-600 sm:mt-3">
        Step {currentStep} of 3{" "}
        <span className="font-semibold text-ink-900">{STEP_LABELS[currentStep - 1]}</span>
      </p>
    </div>
  );
}
