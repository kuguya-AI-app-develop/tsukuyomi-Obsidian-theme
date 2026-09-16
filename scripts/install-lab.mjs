import { copyFile, mkdir, realpath, lstat, access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { build, root } from './build.mjs';

// Fixed project-local destination. No arbitrary-vault argument is accepted.
if (process.argv.length > 2) throw new Error('This script only installs into the bundled lab and accepts no arguments.');
const lab = resolve(root, 'lab', 'Tsukuyomi Lab');
const theme = resolve(lab, '.obsidian', 'themes', 'Tsukuyomi');
for (const path of [resolve(root, 'lab'), lab, resolve(lab, '.obsidian'), resolve(lab, '.obsidian', 'themes'), theme]) {
  try {
    if ((await lstat(path)).isSymbolicLink()) throw new Error(`Refusing symlink destination: ${path}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
await access(resolve(lab, '00-欢迎来到月读.md'));
await mkdir(theme, { recursive: true });
if (!(await realpath(theme)).startsWith((await realpath(root)) + sep)) throw new Error('Lab destination must remain inside the project.');
for (const name of ['theme.css', 'manifest.json']) {
  try {
    if (!(await lstat(resolve(theme, name))).isFile()) throw new Error(`Refusing non-file target: ${name}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const { output } = await build();
for (const name of ['theme.css', 'manifest.json']) await copyFile(resolve(output, name), resolve(theme, name));
console.log(`Theme installed into project lab only: ${theme}`);
