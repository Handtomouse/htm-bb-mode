/**
 * BBIcon - Unified BlackBerry Luxury Icon System
 *
 * Hybrid icon component supporting 3 visual styles:
 * - pixel: Nostalgic BB hardware aesthetic (navigation/hardware)
 * - outline: Clean luxury strokes (UI/content)
 * - solid: Bold filled shapes (CTAs/emphasis)
 */

import React from 'react';
import { IconName, IconVariant, getIconSVG, getIconMetadata } from '@/lib/icon-registry';
import styles from './BBIcon.module.css';

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
  // Get icon metadata for smart defaults
  const metadata = getIconMetadata(name);
  const selectedVariant = variant || metadata?.defaultVariant || 'outline';

  // Get SVG content
  const svgContent = getIconSVG(name, selectedVariant);

  if (!svgContent) {
    console.warn(`BBIcon: Icon "${name}" not found`);
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

  return (
    <span
      className={classes}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || name}
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
