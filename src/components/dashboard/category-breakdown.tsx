import type { CategoryBreakdownItem } from "@/lib/finance";
import { formatIDR } from "@/lib/format";

export function CategoryBreakdown({ items }: { items: CategoryBreakdownItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">No spending recorded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.category}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">{item.category}</span>
            <span className="text-zinc-500">
              {formatIDR(item.amount)}{" "}
              <span className="text-zinc-400">
                ({Math.round(item.percentage)}%)
              </span>
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-zinc-100">
            <div
              className="h-2 rounded-full bg-zinc-900"
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
