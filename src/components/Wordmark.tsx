interface WordmarkProps {
  size?: "header" | "footer" | "sm";
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  header: "text-[26px] [&_.ember-o]:w-[0.66em] [&_.ember-o]:h-[0.66em] [&_.ember-o]:translate-y-[0.02em]",
  footer:
    "text-[clamp(56px,11vw,120px)] leading-[0.9] [&_.ember-o]:w-[0.62em] [&_.ember-o]:h-[0.62em] [&_.ember-o]:translate-y-[0.03em] [&_.ember-o]:shadow-[var(--ember-glow-lg)]",
  sm: "text-base [&_.ember-o]:w-[0.68em] [&_.ember-o]:h-[0.68em] [&_.ember-o]:translate-y-[0.02em]",
};

export function Wordmark({ size = "header", pulse = false, className = "" }: WordmarkProps) {
  return (
    <span
      className={`wordmark inline-flex items-center font-display font-extrabold tracking-display text-text-on-dark ${sizeClasses[size]} ${className}`}
    >
      <span>Warml</span>
      <span
        className={`ember-o relative ml-[0.015em] inline-block shrink-0 rounded-full ${pulse ? "ember-o-pulse" : ""}`}
        aria-hidden="true"
      />
    </span>
  );
}
