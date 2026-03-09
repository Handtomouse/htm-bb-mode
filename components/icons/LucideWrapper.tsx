"use client";

import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface LucideWrapperProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function LucideWrapper({
  name,
  size = 24,
  strokeWidth = 2,
  color = "currentColor",
  className,
}: LucideWrapperProps) {
  // @ts-ignore - Dynamic icon lookup
  const Icon: LucideIcon = LucideIcons[name];

  if (!Icon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.3,
        }}
      >
        ?
      </div>
    );
  }

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
    />
  );
}
