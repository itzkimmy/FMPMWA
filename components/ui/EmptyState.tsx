import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in bg-[#131C2E] rounded-xl border border-slate-800 shadow-md">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3.5">
          {icon}
        </div>
      )}
      <p className="font-header text-sm font-semibold text-white mb-1">
        {title}
      </p>
      {description && (
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          {description}
        </p>
      )}
      {action && action.href && (
        <Link
          href={action.href}
          className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {action.label}
        </Link>
      )}
      {action && action.onClick && !action.href && (
        <button
          onClick={action.onClick}
          className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {action.label}
        </button>
      )}
    </div>
  );
}