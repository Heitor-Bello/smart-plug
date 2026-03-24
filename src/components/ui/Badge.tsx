interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "tertiary" | "muted";
  className?: string;
}

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const variants = {
    primary: "bg-primary/20 text-primary border-primary/30",
    tertiary: "bg-tertiary/20 text-tertiary border-tertiary/30",
    muted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
