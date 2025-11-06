import { ACCENT, ACCENT_HOVER } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BBButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function BBButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: BBButtonProps) {
  const baseClasses = "font-semibold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[#FF9D23]/50";

  const variantClasses = {
    primary: `border-2 border-[${ACCENT}] bg-[${ACCENT}] text-black hover:bg-[${ACCENT_HOVER}] hover:border-[${ACCENT_HOVER}] disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: "border-2 border-white/20 bg-black/50 text-white hover:border-[#FF9D23] hover:text-[#FF9D23] disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "border-none bg-transparent text-white/70 hover:text-[#FF9D23] disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "border-2 border-red-400 bg-red-400/20 text-red-400 hover:bg-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm",
    md: "px-4 py-2 text-sm md:px-5 md:py-2.5 md:text-base",
    lg: "px-6 py-3 text-base md:px-8 md:py-4 md:text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
