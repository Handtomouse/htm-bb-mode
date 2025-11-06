import { ACCENT } from "@/lib/theme";

interface BBPageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function BBPageHeader({ title, subtitle }: BBPageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="mb-2 font-mono text-2xl md:text-3xl lg:text-4xl uppercase text-white">
        <span style={{ color: ACCENT }}>/</span> {title}
      </h1>
      {subtitle && <p className="text-sm md:text-base text-white/60">{subtitle}</p>}
    </div>
  );
}
