/**
 * Aurora background (Aceternity "Aurora Background", ported to this project's
 * Tailwind v4 setup). Pure CSS — the animation + gradients live in globals.css
 * (`.aurora-bg`). Drop it inside a `relative isolate overflow-hidden` parent as
 * a decorative layer; content should sit in a sibling with `relative z-10`.
 */
export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="aurora-bg" />
    </div>
  );
}
