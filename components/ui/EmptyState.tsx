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

/**
 * Empty state component — every list has this, not a blank page.
 * Per PROMPT.md §Definition of done.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-studio-panel border border-studio-border flex items-center justify-center text-studio-text-faint mb-4">
          {icon}
        </div>
      )}
      <p className="font-header text-base font-semibold text-studio-text mb-1">
        {title}
      </p>
      {description && (
        <p className="text-sm text-studio-text-muted max-w-xs mb-5">
          {description}
        </p>
      )}
      {action && action.href && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {action.label}
        </Link>
      )}
      {action && action.onClick && !action.href && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {action.label}
        </button>
      )}
    </div>
  );
}
