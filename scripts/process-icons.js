#!/usr/bin/env node

/**
 * BB Mode Icon Processing Script
 * Transforms raw SVGs into 3 luxury variants: pixel, outline, solid
 * Generates TypeScript registry for type-safe icon usage
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '../public/icons/raw');
const PROCESSED_DIR = path.join(__dirname, '../public/icons/processed');
const LIB_DIR = path.join(__dirname, '../lib');

// Icon categories for organization
const CATEGORIES = {
  navigation: ['home', 'menu', 'back', 'close', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
               'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right'],
  communication: ['mail', 'message', 'phone', 'user', 'users', 'share', 'instagram', 'github', 'mastodon', 'contact'],
  content: ['image', 'camera', 'video', 'file', 'folder', 'document', 'download', 'external-link'],
  actions: ['check', 'plus', 'edit', 'delete', 'search', 'settings', 'info', 'warning', 'bookmark', 'heart']
};

// Default variant assignments based on category
const VARIANT_DEFAULTS = {
  navigation: 'pixel',
  communication: 'outline',
  content: 'outline',
  actions: 'solid'
};

/**
 * Process SVG to ensure currentColor and clean structure
 */
function processSVG(svgContent, iconName, variant) {
  let processed = svgContent;

  // Remove XML declaration and comments first
  processed = processed.replace(/<\?xml[^>]*\?>\s*/g, '');
  processed = processed.replace(/<!--[\s\S]*?-->/g, '');

  // Remove unnecessary attributes (but keep x, y for positioning!)
  processed = processed.replace(/\s+id="[^"]*"/g, '');
  processed = processed.replace(/\s+data-[^=]*="[^"]*"/g, '');
  processed = processed.replace(/\s+class="[^"]*"/g, '');
  processed = processed.replace(/\s+xmlns:xlink="[^"]*"/g, '');
  processed = processed.replace(/\s+xml:space="[^"]*"/g, '');
  processed = processed.replace(/\s+version="[^"]*"/g, '');
  processed = processed.replace(/\s+enable-background="[^"]*"/g, '');

  // Remove style from SVG element only (not from shapes)
  processed = processed.replace(/<svg([^>]*)\s+style="[^"]*"/g, '<svg$1');

  // Remove empty groups
  processed = processed.replace(/<g><\/g>/g, '');
  processed = processed.replace(/<g>\s*<\/g>/g, '');

  // Ensure currentColor for dynamic theming - replace existing fills/strokes
  processed = processed.replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
  processed = processed.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');

  // Add fill="currentColor" to shapes that don't have fill or stroke
  const shapeElements = ['path', 'polygon', 'rect', 'circle', 'ellipse', 'polyline'];
  shapeElements.forEach(shape => {
    // Match shape tags that don't have fill or stroke attributes
    const regex = new RegExp(`<${shape}(?![^>]*(?:fill|stroke)=)([^>]*)>`, 'g');
    processed = processed.replace(regex, `<${shape} fill="currentColor"$1>`);
  });

  // Ensure proper viewBox (for icons that don't have one)
  if (!processed.includes('viewBox')) {
    processed = processed.replace('<svg', '<svg viewBox="0 0 24 24"');
  }

  // Add variant-specific attributes
  if (variant === 'pixel') {
    // Keep pixel art crisp
    processed = processed.replace('<svg', '<svg style="image-rendering: pixelated"');
  } else if (variant === 'outline') {
    // Convert to outline style - change fill to stroke
    processed = processed.replace(/fill="currentColor"/g, 'fill="none" stroke="currentColor" stroke-width="2"');
  }

  // Clean up whitespace
  processed = processed.replace(/\n\s+/g, '\n');
  processed = processed.replace(/>\s+</g, '><');

  return processed.trim();
}

/**
 * Get category for an icon
 */
function getCategory(iconName) {
  for (const [category, icons] of Object.entries(CATEGORIES)) {
    if (icons.includes(iconName)) {
      return category;
    }
  }
  return 'misc';
}

/**
 * Get default variant for an icon
 */
function getDefaultVariant(iconName) {
  const category = getCategory(iconName);
  return VARIANT_DEFAULTS[category] || 'outline';
}

/**
 * Main processing function
 */
function processIcons() {
  console.log('🎨 BB Mode Icon Processor\n');

  // Create processed directory
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  // Create variant directories
  ['pixel', 'outline', 'solid'].forEach(variant => {
    const variantDir = path.join(PROCESSED_DIR, variant);
    if (!fs.existsSync(variantDir)) {
      fs.mkdirSync(variantDir, { recursive: true });
    }
  });

  // Read all SVG files
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.svg'));
  console.log(`📦 Found ${files.length} raw SVG files\n`);

  const iconRegistry = {
    pixel: {},
    outline: {},
    solid: {}
  };

  const iconMetadata = [];

  // Process each icon
  files.forEach(file => {
    const iconName = path.basename(file, '.svg');
    const rawContent = fs.readFileSync(path.join(RAW_DIR, file), 'utf8');

    console.log(`  Processing: ${iconName}`);

    // Generate all 3 variants
    ['pixel', 'outline', 'solid'].forEach(variant => {
      const processed = processSVG(rawContent, iconName, variant);
      const outputPath = path.join(PROCESSED_DIR, variant, file);
      fs.writeFileSync(outputPath, processed);

      // Store in registry (as single-line string for TS)
      iconRegistry[variant][iconName] = processed.replace(/\n/g, '');
    });

    // Add metadata
    const category = getCategory(iconName);
    const defaultVariant = getDefaultVariant(iconName);
    iconMetadata.push({
      name: iconName,
      category,
      defaultVariant,
      keywords: [iconName, category]
    });
  });

  console.log(`\n✅ Processed ${files.length} icons × 3 variants = ${files.length * 3} files\n`);

  // Generate TypeScript registry
  generateTypeScriptRegistry(iconRegistry, iconMetadata);

  console.log('🎉 Icon processing complete!\n');
}

/**
 * Generate TypeScript icon registry
 */
function generateTypeScriptRegistry(registry, metadata) {
  console.log('📝 Generating TypeScript registry...');

  const iconNames = metadata.map(m => m.name).sort();

  const tsContent = `/**
 * BB Mode Icon Registry
 * Auto-generated by scripts/process-icons.js
 * DO NOT EDIT MANUALLY
 */

// Icon name type for autocomplete
export type IconName = ${iconNames.map(n => `'${n}'`).join(' | ')};

// Icon variant type
export type IconVariant = 'pixel' | 'outline' | 'solid';

// Icon metadata
export interface IconMetadata {
  name: IconName;
  category: string;
  defaultVariant: IconVariant;
  keywords: string[];
}

// Icon registry - maps icon names to SVG strings
export const ICON_REGISTRY: Record<IconVariant, Record<IconName, string>> = ${JSON.stringify(registry, null, 2)};

// Icon metadata for search and organization
export const ICON_METADATA: IconMetadata[] = ${JSON.stringify(metadata, null, 2)};

/**
 * Get icon SVG by name
 */
export function getIconSVG(name: IconName, variant?: IconVariant): string {
  const meta = ICON_METADATA.find(m => m.name === name);
  const selectedVariant = variant || meta?.defaultVariant || 'outline';
  return ICON_REGISTRY[selectedVariant]?.[name] || '';
}

/**
 * Get icon metadata
 */
export function getIconMetadata(name: IconName): IconMetadata | undefined {
  return ICON_METADATA.find(m => m.name === name);
}

/**
 * Get all icon names
 */
export function getAllIconNames(): IconName[] {
  return ${JSON.stringify(iconNames)};
}

/**
 * Get icons by category
 */
export function getIconsByCategory(category: string): IconName[] {
  return ICON_METADATA
    .filter(m => m.category === category)
    .map(m => m.name);
}
`;

  // Write TypeScript file
  const tsPath = path.join(LIB_DIR, 'icon-registry.ts');
  fs.writeFileSync(tsPath, tsContent);

  console.log(`  ✅ Created ${tsPath}`);
  console.log(`  📊 ${iconNames.length} icons with full type support\n`);
}

// Run the script
try {
  processIcons();
} catch (error) {
  console.error('❌ Error processing icons:', error);
  process.exit(1);
}
