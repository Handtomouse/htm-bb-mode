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
  style,
  ...props
}: BBButtonProps) {
  // Size-based padding
  const sizeStyles = {
    sm: { padding: "0.375rem 0.75rem", fontSize: "0.7rem" },
    md: { padding: "0.5rem 1rem", fontSize: "0.75rem" },
    lg: { padding: "0.625rem 1.25rem", fontSize: "0.8rem" },
  };

  // Variant-based colors
  const getVariantStyles = () => {
    const isActive = variant === "primary" && !disabled;
    const isDanger = variant === "danger";

    return {
      background: disabled
        ? "transparent"
        : isActive
          ? "rgba(255, 255, 255, 0.1)"
          : isDanger
            ? "rgba(239, 68, 68, 0.1)"
            : "transparent",
      color: disabled
        ? "rgba(255, 255, 255, 0.4)"
        : isDanger
          ? "#ef4444"
          : "rgba(255, 255, 255, 0.8)",
      borderColor: isDanger ? "#ef4444" : "rgba(255, 255, 255, 0.2)",
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={`transition-all hover:scale-110 active:scale-95 ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      style={{
        fontFamily: "monospace",
        letterSpacing: "0.05em",
        textTransform: "capitalize",
        border: "1px solid",
        borderRadius: "6px",
        boxShadow: "none",
        filter: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        ...sizeStyles[size],
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
