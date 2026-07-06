import { cn } from "@/lib/utils";

type XStampProps = {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const sizeClasses = {
  sm: "text-[1em] gap-0.5",
  md: "text-[1em] gap-1",
  lg: "text-[1.25em] gap-1",
  hero: "text-[1em] gap-[0.05em]",
};

export function XStamp({ size = "md", className }: XStampProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-[900] tracking-[-0.03em] text-brand",
        sizeClasses[size],
        className
      )}
      aria-hidden={size === "hero"}
    >
      <span>[</span>
      <span>X</span>
      <span>]</span>
    </span>
  );
}
