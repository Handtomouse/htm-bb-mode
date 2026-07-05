'use client';

/**
 * BBIcon - Unified BlackBerry Luxury Icon System
 *
 * Hybrid icon component supporting 3 visual styles:
 * - pixel: Nostalgic BB hardware aesthetic (navigation/hardware)
 * - outline: Clean luxury strokes (UI/content)
 * - solid: Bold filled shapes (CTAs/emphasis)
 */

import React, { useEffect, useState } from 'react';
import type { IconName, IconVariant } from '@/lib/icon-registry';
import { ICON_REGISTRY_CORE, ICON_METADATA_CORE } from '@/lib/icon-registry-core';
import styles from './BBIcon.module.css';

// The full 1.15MB registry is only needed for long-tail icons (showcase and
// comparison pages). Production surfaces resolve from the 25KB core subset;
// anything else dynamic-imports the full registry once and caches it here.
type FullRegistry = typeof import('@/lib/icon-registry');
let fullRegistryCache: FullRegistry | null = null;

export interface BBIconProps {
  /** Icon name (autocomplete supported) */
  name: IconName;

  /** Visual style variant (auto-selected based on category if not specified) */
  variant?: IconVariant;

  /** Icon color */
  color?: 'accent' | 'white' | 'grey' | 'green' | 'red' | 'inherit';

  /** Icon size in pixels (default: 24) */
  size?: number;

  /** Apply luxury glow effect */
  glow?: boolean;

  /** Additional CSS class names */
  className?: string;

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
}

export function BBIcon({
  name,
  variant,
  color = 'inherit',
  size = 24,
  glow = false,
  className = '',
  ariaLabel,
  onClick
}: BBIconProps) {
  const [full, setFull] = useState<FullRegistry | null>(fullRegistryCache);

  // Get icon metadata for smart defaults (core first, full registry fallback)
  const metadata =
    ICON_METADATA_CORE.find((m) => m.name === name) || full?.getIconMetadata(name);
  const selectedVariant = variant || metadata?.defaultVariant || 'outline';

  // Get SVG content
  const coreSvg = ICON_REGISTRY_CORE[selectedVariant]?.[name];
  const svgContent = coreSvg ?? (full ? full.getIconSVG(name, selectedVariant) : '');

  // Long-tail icon: pull in the full registry on demand
  useEffect(() => {
    if (!coreSvg && !fullRegistryCache) {
      import('@/lib/icon-registry').then((mod) => {
        fullRegistryCache = mod;
        setFull(mod);
      });
    } else if (!coreSvg && fullRegistryCache && !full) {
      setFull(fullRegistryCache);
    }
  }, [coreSvg, full]);

  if (!svgContent) {
    if (full) {
      console.warn(`BBIcon: Icon "${name}" not found`);
    }
    return null;
  }

  // Build CSS classes
  const classes = [
    styles.bbIcon,
    styles[`variant-${selectedVariant}`],
    styles[`color-${color}`],
    glow && styles.glow,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  // Icons with no explicit label and no click handler are decorative:
  // hide them from assistive tech instead of announcing raw icon names
  const isDecorative = !ariaLabel && !onClick;

  return (
    <span
      className={classes}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : ariaLabel || name}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

/**
 * Convenience component for navigation icons (pixel variant)
 */
export function NavIcon(props: Omit<BBIconProps, 'variant'>) {
  return <BBIcon {...props} variant="pixel" />;
}

/**
 * Convenience component for content icons (outline variant)
 */
export function ContentIcon(props: Omit<BBIconProps, 'variant'>) {
  return <BBIcon {...props} variant="outline" />;
}

/**
 * Convenience component for action icons (solid variant)
 */
export function ActionIcon(props: Omit<BBIconProps, 'variant'>) {
  return <BBIcon {...props} variant="solid" />;
}
