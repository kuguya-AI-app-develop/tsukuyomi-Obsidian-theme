import { lstat, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const tau = Math.PI * 2;
const number = (value) => String(Math.round(value * 10) / 10);
const wave = (x, phase) => {
  // The nose and eye stay fixed; displacement grows toward the tail joint.
  const progress = Math.max(0, Math.min(1, (x - 18) / 95));
  return 5.2 * progress ** 1.45 * Math.sin(phase - (x - 18) * tau / 150);
};

function rotate(x, y, pivotX, pivotY, angle) {
  const dx = x - pivotX;
  const dy = y - pivotY;
  return [
    pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
    pivotY + dx * Math.sin(angle) + dy * Math.cos(angle),
  ];
}

function bend(x, y, phase) {
  if (x <= 113) return [x, y + wave(x, phase)];
  // All tail strokes share the same moving joint, including the spine tip.
  const angle = 0.22 * Math.sin(phase - 127 * tau / 150);
  const [tailX, tailY] = rotate(x, y, 113, 17, angle);
  return [tailX, tailY + wave(113, phase)];
}

function pose(segments, phase) {
  return segments.map((commands, subpath) => commands.map(({ command, values }, step) => {
    const coordinates = [];
    for (let index = 0; index < values.length; index += 2) {
      let [x, y] = values.slice(index, index + 2);
      // The fin bases retain their body coordinates; only their tips articulate.
      if ((subpath === 7 || subpath === 8) && step === 1 && index === 0) {
        const upper = subpath === 7;
        [x, y] = rotate(x, y, 65.5, upper ? 5 : 33,
          0.18 * Math.sin(phase - 47 * tau / 150 + (upper ? 0.7 : 2)));
      }
      coordinates.push(...bend(x, y, phase).map(number));
    }
    return command + coordinates.join(' ');
  }).join('')).join('');
}

function fish(segments, { color, center, size, period, phase, routeDuration, route, heading }) {
  const poses = Array.from({ length: 6 }, (_, index) => pose(segments, phase + index * tau / 6));
  poses.push(poses[0]);
  return `<g stroke="${color}" stroke-width="2" transform="translate(${center})" opacity="0">
<animate attributeName="opacity" dur="${routeDuration}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;.06;.3;.38;.5;.56;.8;.88;1" values="0;1;1;0;0;1;1;0;0"/>
<g><animateTransform attributeName="transform" type="translate" dur="${routeDuration}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;.4;.48;.9;1" values="${route.map((x) => `${x} 0`).join(';')}"/>
<g><animateTransform attributeName="transform" type="scale" dur="${routeDuration}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;.4;.44;.48;.9;.95;1" values="${heading.map((x) => `${x} 1`).join(';')}"/>
<g transform="scale(${size}) translate(-74.5 -20)">
<path d="${poses[0]}"><animate attributeName="d" dur="${period}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;.1667;.3333;.5;.6667;.8333;1" values="${poses.join(';')}"/></path>
<circle cx="14" cy="18" r="2" fill="#dfc38a" stroke="none"/>
</g></g></g></g>`;
}

export function renderSwimmingFish(source) {
  // Keep the original single-path skeleton as the editable geometry source.
  const original = source.match(/<path d="([^"]+)"\/>/)?.[1];
  if (!original) throw new Error('The original skeletal fish path is missing.');
  const segments = original.split(/(?=M)/).map((subpath) =>
    [...subpath.matchAll(/([MLQZ])([^MLQZ]*)/g)].map(([, command, values]) => ({
      command,
      values: [...values.matchAll(/[-+]?(?:\d*\.\d+|\d+)/g)].map(([value]) => Number(value)),
    })),
  );
  if (segments.length !== 11) throw new Error('The original fish subpaths have changed.');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
<title>One-way skeletal fish passes</title><desc>Original continuous skeletons bend from head to tail. Each one-way pass fades completely before an opposite-facing pass appears. Buildings belong to separate static assets.</desc>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${fish(segments, { color: '#79ded6', center: '294 76', size: 1, period: 1.2, phase: 0, routeDuration: 18, route: [45, -55, -55, 45, 45], heading: [1, 1, 0, -1, -1, 0, 1] })}
${fish(segments, { color: '#b6a2ea', center: '945 82', size: 0.82, period: 1.4, phase: 0.9, routeDuration: 22, route: [-50, 50, 50, -50, -50], heading: [-1, -1, 0, 1, 1, 0, -1] })}
</g></svg>
`;

  if (Buffer.byteLength(svg) > 10 * 1024) throw new Error('Swimming fish exceeds the 10 KiB asset budget.');
  return svg;
}

// Importing the renderer has no filesystem side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = new URL('../assets', import.meta.url);
  const directoryStat = await lstat(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new Error('Refusing to generate fish in a symlink or non-directory assets path.');
  }
  const assets = new URL('../assets/', import.meta.url);
  const target = new URL('tsukuyomi-fish-swimming.svg', assets);
  const targetStat = await lstat(target).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (targetStat && (targetStat.isSymbolicLink() || !targetStat.isFile())) {
    throw new Error('Refusing to overwrite a symlink or non-file fish asset.');
  }
  const source = await readFile(new URL('tsukuyomi-fish.svg', assets), 'utf8');
  const svg = renderSwimmingFish(source);
  await writeFile(target, svg);
  console.log(`Generated tsukuyomi-fish-swimming.svg (${Buffer.byteLength(svg)} bytes).`);
}
