import type { ReactNode } from "react";

export function EmptyState({ icon, title, subtitle, action }: { icon: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="reveal mt-6 flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-soft text-4xl shadow-[0_14px_32px_-12px_rgba(224,132,154,0.5)]">{icon}</div>
      <p className="mt-4 font-display text-xl font-bold text-ink">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-muted">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
