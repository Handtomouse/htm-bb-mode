interface BBEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function BBEmptyState({ icon = "📭", title, description, action }: BBEmptyStateProps) {
  return (
    <div className="border border-white/10 bg-black/30 p-8 md:p-12 lg:p-16 text-center">
      <div className="mb-4 text-6xl opacity-40">{icon}</div>
      <h3 className="mb-2 text-xl md:text-2xl font-semibold text-white/80">{title}</h3>
      {description && <p className="mb-4 text-sm md:text-base text-white/50">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="border-2 border-[#FF9D23]/50 bg-[#FF9D23]/10 px-6 py-2 text-sm font-semibold text-[#FF9D23] transition-all hover:bg-[#FF9D23]/20 hover:border-[#FF9D23]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
