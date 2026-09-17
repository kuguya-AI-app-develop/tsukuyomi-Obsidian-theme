import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { renderSwimmingFish } from './generate-fish.mjs';
import { renderMascots } from './generate-mascots.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const LICENSE_SCOPE_NOTICE = 'MIT applies to original code only; third-party character designs are excluded. See NOTICE.md in source repository.';
export const sourceFiles = [
  '00-settings.css',
  '10-palette.css',
  '20-semantic.css',
  '30-workspace.css',
  '40-editor.css',
  '50-components.css',
  '55-mermaid.css',
  '60-decoration.css',
  '90-mobile-print.css',
];

export function renderLicenseHeader(version, licenseText) {
  if (typeof licenseText !== 'string' || !licenseText.trim()) {
    throw new Error('LICENSE must contain the project MIT license.');
  }
  const license = licenseText.replace(/\r\n?/g, '\n').trimEnd();
  for (const text of [
    'MIT License',
    'Copyright (c)',
    'Permission is hereby granted, free of charge',
    'The above copyright notice and this permission notice shall be included',
    'THE SOFTWARE IS PROVIDED "AS IS"',
  ]) {
    if (!license.includes(text)) throw new Error(`LICENSE is not a complete MIT license: missing "${text}".`);
  }
  if (license.includes('*/') || license.includes('\0')) {
    throw new Error('LICENSE contains text that cannot be embedded safely in a CSS comment.');
  }
  return `/* Tsukuyomi ${version}\n${LICENSE_SCOPE_NOTICE}\n\n${license}\n*/`;
}

export async function renderSource(name) {
  let css = await readFile(resolve(root, 'src', name), 'utf8');
  for (const [token, asset] of [
    ['__TK_CLOUDS_SVG__', 'stage-clouds.svg'],
    ['__TK_CITY_SVG__', 'tsukuyomi-city.svg'],
    ['__TK_GATE_SVG__', 'tsukuyomi-gate.svg'],
    ['__TK_FISH_SVG__', 'tsukuyomi-fish.svg'],
    ['__TK_FISH_SWIMMING_SVG__', 'tsukuyomi-fish-swimming.svg'],
    ['__TK_MASCOTS_SVG__', 'tsukuyomi-mascots.svg'],
    ['__TK_MASCOTS_LIVING_SVG__', 'tsukuyomi-mascots-living.svg'],
    ['__TK_MIRROR_SVG__', 'tsukuyomi-mirror.svg'],
  ]) {
    if (!css.includes(token)) continue;
    const assetSource = await readFile(resolve(root, 'assets', asset), 'utf8');
    if (asset === 'tsukuyomi-fish-swimming.svg') {
      const fishSource = await readFile(resolve(root, 'assets', 'tsukuyomi-fish.svg'), 'utf8');
      if (assetSource !== renderSwimmingFish(fishSource)) {
        throw new Error('Swimming fish is stale. Run node scripts/generate-fish.mjs before building.');
      }
    }
    if (asset === 'tsukuyomi-mascots.svg' || asset === 'tsukuyomi-mascots-living.svg') {
      if (assetSource !== renderMascots({ animated: asset === 'tsukuyomi-mascots-living.svg' })) {
        throw new Error('Companion artwork is stale. Run node scripts/generate-mascots.mjs before building.');
      }
    }
    const svg = assetSource.replace(/<!--[\s\S]*?-->/g, '').trim().replace(/>\s+</g, '><');
    const uri = `data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}`;
    css = css.replaceAll(token, uri);
  }
  return css;
}

export async function build() {
  // Keep generated output inside this project even if a destination was replaced.
  for (const relative of ['theme.css', 'dist', 'dist/Tsukuyomi', 'dist/Tsukuyomi/theme.css', 'dist/Tsukuyomi/manifest.json']) {
    try {
      const stat = await lstat(resolve(root, relative));
      if (stat.isSymbolicLink()) throw new Error(`Refusing symlink output: ${relative}`);
      const isDirectory = relative === 'dist' || relative === 'dist/Tsukuyomi';
      if (isDirectory ? !stat.isDirectory() : !stat.isFile()) throw new Error(`Unexpected output type: ${relative}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const [manifestText, licenseText] = await Promise.all([
    readFile(resolve(root, 'manifest.json'), 'utf8'),
    readFile(resolve(root, 'LICENSE'), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestText);
  if (manifest.name !== 'Tsukuyomi') throw new Error('Theme name must match installation directory Tsukuyomi.');
  const sections = await Promise.all(sourceFiles.map(async (name) => {
    const css = await renderSource(name);
    return `/* Source: ${name} */\n${css.trim()}\n`;
  }));
  const css = `${renderLicenseHeader(manifest.version, licenseText)}\n\n${sections.join('\n')}`;
  const output = resolve(root, 'dist', 'Tsukuyomi');
  await mkdir(output, { recursive: true });
  await writeFile(resolve(root, 'theme.css'), css);
  await writeFile(resolve(output, 'theme.css'), css);
  await writeFile(resolve(output, 'manifest.json'), manifestText);
  return { css, output };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { css, output } = await build();
  console.log(`Built ${Buffer.byteLength(css)} bytes → ${output}`);
}
