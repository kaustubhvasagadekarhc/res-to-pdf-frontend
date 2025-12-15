import { cn } from "@/lib/utils";

type DashboardShellProps = React.HTMLAttributes<HTMLDivElement>

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen bg-background text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
