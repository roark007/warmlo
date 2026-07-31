interface NumberedStepListProps {
  steps: string[];
}

export function NumberedStepList({ steps }: NumberedStepListProps) {
  return (
    <ol className="relative list-none space-y-5 pl-11">
      <span
        className="absolute bottom-3.5 left-3.5 top-3.5 w-px bg-line"
        aria-hidden="true"
      />
      {steps.map((step, index) => (
        <li key={index} className="relative">
          <span
            className="absolute -left-11 flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-line-strong bg-surface text-sm font-semibold text-ink-900 [font-feature-settings:'tnum']"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <p className="max-w-[68ch] text-base leading-[1.55] text-ink-700">{step}</p>
        </li>
      ))}
    </ol>
  );
}
