import { cn } from "../../lib/utils";

export function Button({
  as = "button",
  className,
  variant = "default",
  type = "button",
  children,
  ...props
}) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
    link: "bg-transparent px-0 py-0 text-primary underline-offset-4 hover:underline",
  };

  const Component = as;

  return (
    <Component
      type={as === "button" ? type : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
