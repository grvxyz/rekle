import { cn } from "../../lib/utils";

function Badge({ className, children, variant = "default", ...props }) {
  const variants = {
    default: "border border-border bg-secondary text-secondary-foreground shadow-sm",
    secondary: "border border-border bg-background text-foreground shadow-sm",
    dark: "border border-white/10 bg-white/10 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
