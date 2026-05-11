import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-20 mb-1.5" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className="clinical-card p-5">
      <Skeleton className="h-4 w-36 mb-4" />
      <Skeleton className={cn(height, "w-full")} />
    </div>
  );
}
