#!/usr/bin/env node

/**
 * HTM Icon Renaming Script
 * - Removes numeric prefixes (001-, 002-, etc.)
 * - Adds htm- prefix to duplicates that exist in core icons
 * - Copies renamed icons to /public/icons/raw/ for processing
 */

const fs = require('fs');
const path = require('path');

const HTM_RAW_DIR = path.join(__dirname, '../public/icons/htm-raw');
const OUTPUT_DIR = path.join(__dirname, '../public/icons/raw');

// Core icons that already exist (will get htm- prefix if duplicates found)
const CORE_ICONS = [
  'home', 'menu', 'back', 'close', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'mail', 'message', 'phone', 'user', 'users', 'share', 'instagram', 'github', 'mastodon', 'contact',
  'image', 'camera', 'video', 'file', 'folder', 'document', 'download', 'external-link',
  'check', 'plus', 'edit', 'delete', 'search', 'settings', 'info', 'warning', 'bookmark', 'heart'
];

console.log('🔄 HTM Icon Renaming Script\n');

let totalRenamed = 0;
let totalWithPrefix = 0;

// Process each category
['interface', 'contacts', 'commerce', 'text-editor'].forEach(category => {
  const categoryDir = path.join(HTM_RAW_DIR, category);

  if (!fs.existsSync(categoryDir)) {
    console.log(`⚠️  Category not found: ${category}`);
    return;
  }

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.svg'));
  console.log(`\n📁 Processing ${category}: ${files.length} icons`);

  files.forEach(file => {
    // Remove numeric prefix (001-, 002-, etc.)
    let newName = file.replace(/^\d{3}-/, '');

    // Check if this icon name exists in core icons
    const iconName = newName.replace('.svg', '');
    if (CORE_ICONS.includes(iconName)) {
      newName = `htm-${newName}`;
      totalWithPrefix++;
      console.log(`  ✓ ${file} → ${newName} (duplicate handled)`);
    } else {
      console.log(`  ✓ ${file} → ${newName}`);
    }

    // Copy renamed file to output directory
    const sourcePath = path.join(categoryDir, file);
    const destPath = path.join(OUTPUT_DIR, newName);

    fs.copyFileSync(sourcePath, destPath);
    totalRenamed++;
  });
});

console.log(`\n✅ Renaming complete!`);
console.log(`  📊 Total icons renamed: ${totalRenamed}`);
console.log(`  🏷️  Icons with htm- prefix: ${totalWithPrefix}`);
console.log(`  📂 Output: ${OUTPUT_DIR}\n`);
