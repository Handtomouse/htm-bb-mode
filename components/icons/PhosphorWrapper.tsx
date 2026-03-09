"use client";

import * as PhosphorIcons from "phosphor-react";
import { type Icon as PhosphorIconType } from "phosphor-react";

export type PhosphorWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

interface PhosphorWrapperProps {
  name: string;
  size?: number;
  weight?: PhosphorWeight;
  color?: string;
  className?: string;
}

export function PhosphorWrapper({
  name,
  size = 24,
  weight = "regular",
  color = "currentColor",
  className,
}: PhosphorWrapperProps) {
  // @ts-ignore - Dynamic icon lookup
  const Icon: PhosphorIconType = PhosphorIcons[name];

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
      weight={weight}
      color={color}
      className={className}
    />
  );
}
