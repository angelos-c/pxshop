import { cn } from "@/lib/utils";

type SpecRowProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function SpecRow({ label, children, className }: SpecRowProps) {
  return (
    <div className={cn("border-b border-border py-4 md:py-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-brand">{label}</span>
        <div className="text-right text-sm font-bold text-brand">{children}</div>
      </div>
    </div>
  );
}
