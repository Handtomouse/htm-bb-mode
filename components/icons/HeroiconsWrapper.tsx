"use client";

import * as HeroIconsSolid from "@heroicons/react/24/solid";
import * as HeroIconsOutline from "@heroicons/react/24/outline";

interface HeroiconsWrapperProps {
  name: string;
  variant?: "solid" | "outline";
  size?: number;
  className?: string;
}

export function HeroiconsWrapper({
  name,
  variant = "outline",
  size = 24,
  className,
}: HeroiconsWrapperProps) {
  const iconSet = variant === "solid" ? HeroIconsSolid : HeroIconsOutline;
  // @ts-ignore - Dynamic icon lookup
  const Icon = iconSet[name];

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
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
