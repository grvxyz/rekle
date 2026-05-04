import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function CardAction({ className, children, ...props }) {
  return (
    <div className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}
