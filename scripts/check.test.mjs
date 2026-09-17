import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'css-tree';
import { validateSvgDataUrl, validateMotion, validateAnimatedAssetUsage, validateReadingProtection, validateSignageContrast } from './check.mjs';
import { LICENSE_SCOPE_NOTICE, renderLicenseHeader, renderSource } from './build.mjs';

const svgUrl = (body, attributes = '') => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${attributes}>${body}</svg>`,
)}`;
const checkMotion = (css) => validateMotion(parse(css));
const checkReading = (css) => validateReadingProtection(parse(css));
const sceneMedia = 'screen and (prefers-reduced-motion: no-preference) and (min-width: 320px) and (min-height: 480px)';
const sceneScope = 'body:not(.tk-minimal):not(.tk-disable-motion) .workspace-leaf.mod-active .workspace-leaf-content[data-type="empty"]';
const mirrorFrames = '@keyframes tk-mirror-breathe { from { opacity: .4; } to { opacity: .8; } }';
const mirrorAnimation = 'animation: tk-mirror-breathe 5s ease-in-out infinite';
const mirrorTarget = `${sceneScope} .view-content .empty-state::after`;
const mirrorScene = (selector = mirrorTarget, media = sceneMedia, declaration = mirrorAnimation) =>
  `${mirrorFrames} @media ${media} { ${selector} { ${declaration}; } }`;
const interactionMedia = 'screen and (prefers-reduced-motion: no-preference)';
const interactionScope = 'body:not(.tk-disable-motion)';
const jellyFrames = `@keyframes tk-nav-jelly {
  0%, 100% { transform: scale(1, 1); }
  38% { transform: scale(1.06, 0.9); }
  65% { transform: scale(0.97, 1.055); }
  84% { transform: scale(1.015, 0.985); }
}`;
const noteFrames = `@keyframes tk-note-enter {
  from { opacity: .3; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}`;
const sidebarFrames = `@keyframes tk-sidebar-jelly {
  0%, 100% { transform: scale(1, 1); }
  38% { transform: scale(1.22, 0.78); }
  65% { transform: scale(0.88, 1.14); }
  84% { transform: scale(1.06, 0.94); }
}`;
const interactionCases = [
  {
    frames: jellyFrames,
    animation: 'tk-nav-jelly 520ms ease-out',
    targets: [
      '.workspace-tab-header.is-active .workspace-tab-header-inner-icon',
      '.workspace-tab-header.is-active .workspace-tab-header-inner-title',
      '.nav-file-title.is-active .nav-file-title-content',
      '.nav-folder:not(.is-collapsed) > .nav-folder-title .nav-folder-title-content',
    ],
  },
  {
    frames: noteFrames,
    animation: 'tk-note-enter 460ms ease-out',
    targets: [
      '.workspace-leaf-content[data-type="markdown"] > .view-content > .markdown-reading-view',
      '.workspace-leaf-content[data-type="markdown"] > .view-content > .markdown-source-view.mod-cm6',
    ],
  },
  {
    frames: sidebarFrames,
    animation: 'tk-sidebar-jelly 600ms ease-out',
    targets: [
      '.mod-left-split .workspace-tab-header.is-active .workspace-tab-header-inner-icon',
      '.mod-right-split .workspace-tab-header.is-active .workspace-tab-header-inner-icon',
    ],
  },
];
const interactionCss = ({ frames, animation, targets }, media = interactionMedia, scope = interactionScope) =>
  `${frames} @media ${media} { ${targets.map((target) => `${scope} ${target}`).join(', ')} { animation: ${animation}; } }`;
const morph = '<path d="M0 0Q5 4 10 0L12 4Z"><animate attributeName="d" dur="1s" repeatCount="indefinite" calcMode="linear" keyTimes="0;1" values="M0 0Q5 4 10 0L12 4Z;M0 0Q5 -4 10 0L12 -4Z"/></path>';
const checkAnimatedSvg = (body) => validateSvgDataUrl(svgUrl(body), { allowAnimation: true });
const fishImageDeclaration = 'background-image: var(--tk-fish-swimming-art)';
const mascotImageDeclaration = 'background-image: var(--tk-mascot-living-art)';
const fishAssetCss = (declaration = fishImageDeclaration, selector = `${sceneScope} .view-content::before`) => `
  :root { --tk-fish-swimming-art: url("${svgUrl(morph)}"); --tk-mascot-living-art: url("${svgUrl(morph)}"); }
  @media ${sceneMedia} {
    @container tk-empty (min-width: 320px) and (min-height: 480px) {
      ${sceneScope}::before { ${mascotImageDeclaration}; }
      ${selector} { ${declaration}; }
    }
  }`;
const checkFishUsage = (css) => validateAnimatedAssetUsage(parse(css, { parseCustomProperty: true }));

test('license header embeds the complete root MIT license and remains valid CSS', async () => {
  const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  const header = renderLicenseHeader('1.0.1', license);
  assert.ok(header.includes(LICENSE_SCOPE_NOTICE));
  assert.ok(header.includes(license.replace(/\r\n?/g, '\n').trimEnd()));
  assert.doesNotThrow(() => parse(`${header}\n:root { color: black; }`));
});

test('license header rejects missing, incomplete and unsafe license text', async () => {
  const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  for (const invalid of [undefined, '', 'MIT License\nCopyright (c) 2026 ArisaTaki', license.replace('Permission is hereby granted', 'Permission was not granted'), `${license}\n*/`]) {
    assert.throws(() => renderLicenseHeader('1.0.1', invalid));
  }
});

test('SVG accepts static, self-contained artwork and descriptive text', () => {
  assert.deepEqual(validateSvgDataUrl(svgUrl('<title>Moon and clouds</title><desc>Original geometric artwork.</desc><g fill="#caffed" transform="translate(1 2)"><path d="M0 0L10 10Z"/><circle cx="50" cy="50" r="12" stroke="#fff" stroke-width="2"/></g>')), []);
});

test('SVG rejects remote assets, code, animation, references and malformed XML', () => {
  for (const body of [
    '<script>alert(1)</script>',
    '<foreignObject/>',
    '<image href="https://example.com/a.png"/>',
    '<use href="#other"/>',
    '<defs><linearGradient/></defs>',
    '<circle cx="1" cy="1" r="1" onload="alert(1)"/>',
    '<path d="M0 0" style="fill:red"/>',
    '<path d="M0 0" fill="url(https://example.com/a.svg)"/>',
    '<animate attributeName="opacity"/>',
    '<g><path d="M0 0"></g>',
    '<!DOCTYPE svg [<!ENTITY external SYSTEM "https://example.com/">]>',
    '<title>&external;</title>',
  ]) assert.ok(validateSvgDataUrl(svgUrl(body)).length, body);
  assert.ok(validateSvgDataUrl(svgUrl('', ' xmlns="http://www.w3.org/2000/svg"')).length);
  assert.ok(validateSvgDataUrl(svgUrl('', ' viewBox="0 0 5 5"')).length);
});

test('SVG rejects other URL types, invalid encodings and oversized artwork', () => {
  for (const value of ['https://example.com/a.svg', '//example.com/a.svg', './a.svg', 'data:text/html,hello', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/svg+xml,%ZZ']) {
    assert.ok(validateSvgDataUrl(value).length, value);
  }
  assert.ok(validateSvgDataUrl(svgUrl(`<desc>${'a'.repeat(10 * 1024)}</desc>`)).length);
});

test('SVG animation requires explicit opt-in and permits bounded path morphs and group transforms', () => {
  assert.ok(validateSvgDataUrl(svgUrl(morph)).length);
  assert.deepEqual(checkAnimatedSvg(morph), []);
  assert.deepEqual(checkAnimatedSvg(morph.replace('dur="1s"', 'dur="500ms" begin="-0.5s"')), []);
  assert.deepEqual(checkAnimatedSvg(morph.replace('calcMode="linear"', 'calcMode="spline" keySplines=".25 .1 .25 1"')), []);
  for (const [type, values] of [['translate', '0 0;100 10'], ['rotate', '-10 20 30;10 20 30'], ['scale', '1 1;0 1;-1 1']]) {
    assert.deepEqual(checkAnimatedSvg(`<g>${morph}<animateTransform attributeName="transform" type="${type}" dur="20s" repeatCount="indefinite" values="${values}"/></g>`), []);
  }
  assert.deepEqual(checkAnimatedSvg(`<g opacity="0">${morph}<animate attributeName="opacity" dur="18s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.1;.8;1"/></g>`), []);
});

test('SVG animation rejects event clocks, unsafe targets, references and unsupported attributes', () => {
  for (const body of [
    morph.replace('dur="1s"', 'dur="0.49s"'),
    morph.replace('dur="1s"', 'dur="61s"'),
    morph.replace('dur="1s"', 'dur="Infinitys"'),
    morph.replace('dur="1s"', 'dur="1s" begin="click"'),
    morph.replace('dur="1s"', 'dur="1s" begin="other.end"'),
    morph.replace('dur="1s"', 'dur="1s" begin="-61s"'),
    morph.replace('dur="1s"', 'dur="1s" href="#other"'),
    morph.replace('dur="1s"', 'dur="1s" onbegin="alert(1)"'),
    morph.replace('dur="1s"', 'dur="1s" additive="sum"'),
    morph.replace('dur="1s"', 'dur="1s" style="opacity:0"'),
    morph.replace('attributeName="d"', 'attributeName="href"'),
    morph.replace('repeatCount="indefinite"', 'repeatCount="2"'),
    morph.replace('<path d="M0 0Q5 4 10 0L12 4Z">', '<g>').replace('</path>', '</g>'),
    '<path d="M0 0L1 1"><animateTransform attributeName="transform" type="rotate" values="0;10" dur="1s" repeatCount="indefinite"/></path>',
    '<g><animateTransform attributeName="transform" type="matrix" values="1 0 0 1 0 0;1 0 0 1 5 0" dur="1s" repeatCount="indefinite"/></g>',
    '<g><script>alert(1)</script></g>',
  ]) assert.ok(checkAnimatedSvg(body).length, body);
});

test('SVG animation validates finite frame data, morph shapes and timing interpolation', () => {
  for (const body of [
    morph.replace('M0 0Q5 -4 10 0L12 -4Z', 'M0 0L5 -4L12 -4Z'),
    morph.replace('M0 0Q5 -4 10 0L12 -4Z', 'M0 0Q5 -4 10L12 -4Z'),
    morph.replace('M0 0Q5 -4 10 0L12 -4Z', 'M0 0Q5 -4 1e309 0L12 -4Z'),
    morph.replace('keyTimes="0;1"', 'keyTimes="0;.5;1"'),
    morph.replace('keyTimes="0;1"', 'keyTimes=".2;1"'),
    morph.replace('keyTimes="0;1"', 'keyTimes="1;0"'),
    morph.replace('calcMode="linear"', 'calcMode="discrete"'),
    morph.replace('calcMode="linear"', 'calcMode="spline"'),
    morph.replace('calcMode="linear"', 'calcMode="spline" keySplines="0 0 2 1"'),
    morph.replace('calcMode="linear"', 'calcMode="spline" keySplines="0 0 1 1;0 0 1 1"'),
    '<g><animateTransform attributeName="transform" type="translate" values="0 0;10" dur="1s" repeatCount="indefinite"/></g>',
    '<g><animateTransform attributeName="transform" type="scale" values="1;1e309" dur="1s" repeatCount="indefinite"/></g>',
    '<g><animate attributeName="opacity" values="0;1.01" dur="1s" repeatCount="indefinite"/></g>',
    '<g><animate attributeName="opacity" values="0;-1" dur="1s" repeatCount="indefinite"/></g>',
    '<g><animate attributeName="opacity" values="0;1e309" dur="1s" repeatCount="indefinite"/></g>',
    '<g><animate attributeName="opacity" values="0 1;1 0" dur="1s" repeatCount="indefinite"/></g>',
    '<path d="M0 0L1 1"><animate attributeName="opacity" values="0;1" dur="1s" repeatCount="indefinite"/></path>',
  ]) assert.ok(checkAnimatedSvg(body).length, body);
});

test('animated mascot and fish URIs activate only on their separate guarded empty-pane layers', () => {
  assert.deepEqual(checkFishUsage(fishAssetCss()), []);
  for (const css of [
    fishAssetCss().replace('screen and ', ''),
    fishAssetCss().replace('(prefers-reduced-motion: no-preference) and ', ''),
    fishAssetCss().replaceAll('(min-width: 320px)', '(min-width: 300px)'),
    fishAssetCss().replace('tk-empty (min-width: 320px) and (min-height: 480px)', 'tk-empty (min-width: 320px)'),
    fishAssetCss().replace('no-preference', 'reduce'),
    fishAssetCss().replace(':not(.tk-disable-motion)', ''),
    fishAssetCss().replace(':not(.tk-minimal)', ''),
    fishAssetCss().replace('.mod-active', ''),
    fishAssetCss(undefined, '.markdown-rendered'),
    fishAssetCss('background: var(--tk-fish-swimming-art)'),
    fishAssetCss('--tk-alias: var(--tk-fish-swimming-art)'),
    fishAssetCss('--tk-alias: VAR(--tk-fish-swimming-art)'),
    fishAssetCss('--tk-alias: var(--tk-mascot-living-art)'),
    fishAssetCss('background-image: var(--tk-mascot-living-art)'),
    fishAssetCss('background-image: var(--tk-mascot-living-art), var(--tk-fish-swimming-art)'),
    fishAssetCss('background-image: var(--tk-fish-swimming-art), var(--tk-mascot-living-art)'),
    fishAssetCss().replace(`${sceneScope}::before`, `${sceneScope} .view-content::before`),
    fishAssetCss(undefined, `${sceneScope}::before`),
    fishAssetCss('background-image: var(--other, var(--tk-fish-swimming-art))'),
    `${fishAssetCss()} .view-content::before { background-image: var(--tk-fish-swimming-art); }`,
    fishAssetCss().replace(':root { --tk-fish-swimming-art:', '.markdown-rendered { --tk-fish-swimming-art:'),
  ]) assert.ok(checkFishUsage(css).length, css);
});

test('source decoration keeps the guarded scene threshold contract', async () => {
  const css = await renderSource('60-decoration.css');
  const ast = parse(css, { parseCustomProperty: true });
  assert.deepEqual(validateMotion(ast), []);
  assert.deepEqual(validateAnimatedAssetUsage(ast), []);
});

test('each animated scene asset requires one definition and exactly one guarded activation', () => {
  const css = fishAssetCss();
  for (const invalid of [
    '',
    css.replace(/:root \{[^}]+\}/, ''),
    css.replace(`${fishImageDeclaration};`, ''),
    css.replace(`${mascotImageDeclaration};`, ''),
    css.replace(/--tk-fish-swimming-art: url\([^;]+;/, ''),
    css.replace(/--tk-mascot-living-art: url\([^;]+;/, ''),
    `${css}\n${css}`,
    css.replace(`${fishImageDeclaration};`, `${fishImageDeclaration}; ${fishImageDeclaration};`),
    css.replace(`${mascotImageDeclaration};`, `${mascotImageDeclaration}; ${mascotImageDeclaration};`),
  ]) assert.ok(checkFishUsage(invalid).length, invalid || 'missing definition and activation');
});

test('motion accepts static styles, disabling resets and guarded short UI transitions', () => {
  assert.deepEqual(checkMotion('body { color: white; }'), []);
  assert.deepEqual(checkMotion(`
    .markdown-rendered { animation: none; }
    body.tk-disable-motion * { animation-play-state: paused; transition: none; }
    :root { --tk-transition-duration: 0ms; }
    @media (prefers-reduced-motion: no-preference) {
      body:not(.tk-disable-motion) { --tk-transition-duration: 140ms; }
      body:not(.tk-disable-motion) :is(button, .menu-item) { transition: color var(--tk-transition-duration) ease; }
    }
  `), []);
});

test('motion accepts only the two guarded empty-view CSS animations', () => {
  assert.deepEqual(checkMotion(mirrorScene()), []);
  assert.deepEqual(checkMotion(`
    @keyframes tk-mirror-breathe { 0%, 100% { opacity: .6; } 50% { opacity: .8; transform: scale(1.02); } }
    @keyframes tk-water-ripple { from { transform: scale(.94); opacity: .1; } to { transform: scale(1.06); opacity: 0; } }
    @media ${sceneMedia} {
      ${sceneScope} .view-content .empty-state::after { animation: tk-mirror-breathe 5s ease-in-out infinite; }
      ${sceneScope} .view-content .empty-state-container::after { animation: tk-water-ripple 4s ease-out infinite; }
    }
  `), []);
});

test('motion rejects missing media and static-scene guards, reading targets and inactive panes', () => {
  for (const selector of [
    mirrorTarget.replace(':not(.tk-disable-motion)', ''),
    mirrorTarget.replace(':not(.tk-minimal)', ''),
    mirrorTarget.replace('.mod-active', ''),
    mirrorTarget.replace('[data-type="empty"]', '[data-type="markdown"]'),
    `${sceneScope} .markdown-rendered::before`,
    `${sceneScope} .view-content`,
    `${mirrorTarget}, .markdown-reading-view`,
  ]) assert.ok(checkMotion(mirrorScene(selector)).length, selector);
  for (const media of [
    '(prefers-reduced-motion: no-preference)',
    sceneMedia.replace('screen and ', ''),
    sceneMedia.replace('(prefers-reduced-motion: no-preference) and ', ''),
    sceneMedia.replace(' and (min-width: 320px)', ''),
    sceneMedia.replace(' and (min-height: 480px)', ''),
    `${sceneMedia}, screen`,
    sceneMedia.replace('no-preference', 'reduce'),
  ]) assert.ok(checkMotion(mirrorScene(undefined, media)).length, media);
  assert.ok(checkMotion(`${mirrorFrames} ${mirrorTarget} { ${mirrorAnimation}; }`).length);
});

test('motion rejects unsupported names, properties, timing and vendor bypasses', () => {
  for (const declaration of [
    'animation: decorative 1200ms ease 2',
    'animation: var(--motion)',
    'animation: tk-mirror-breathe 1s ease-in-out infinite',
    'animation: tk-mirror-breathe 5s ease-in-out infinite, decorative 1s infinite',
    'animation-name: tk-mirror-breathe',
    'animation-duration: 140ms',
    'animation-timeline: scroll()',
    'animation-play-state: running',
    '-webkit-animation: decorative 140ms ease',
    '-webkit-animation-name: decorative',
  ]) assert.ok(checkMotion(mirrorScene(undefined, undefined, declaration)).length, declaration);
  for (const keyword of ['keyframes', '-webkit-keyframes', '-moz-keyframes']) {
    assert.ok(checkMotion(`@${keyword} decorative { from { transform: rotate(0deg); } to { transform: rotate(3deg); } }`).length, keyword);
  }
  for (const property of ['left: 2px', 'background-position: 10% 20%', 'filter: blur(2px)', 'animation: none']) {
    assert.ok(checkMotion(`@keyframes tk-mirror-breathe { from { ${property}; } to { opacity: .8; } }`).length, property);
  }
  assert.ok(checkMotion(mirrorScene().replace(mirrorFrames, '')).length, 'missing definition');
  assert.ok(checkMotion(mirrorScene().replace('.view-content .empty-state::after', '.view-content::after')).length, 'wrong layer');
});

test('motion rejects former scene layers and timing while keeping the new layout contract', () => {
  assert.ok(checkMotion(mirrorScene().replace('5s ease-in-out', '10s ease-in-out')).length);
  assert.ok(checkMotion(`@keyframes tk-fish-drift { from { transform: translateX(-32px); } to { transform: translateX(32px); } }
    @media ${sceneMedia} { ${sceneScope} .view-content::before { animation: tk-fish-drift 8s ease-in-out infinite alternate; } }`).length);
  for (const [name, timing, oldTarget] of [
    ['tk-mirror-breathe', '5s ease-in-out infinite', '.view-content::after'],
    ['tk-water-ripple', '4s ease-out infinite', '.view-content .empty-state::before'],
    ['tk-water-ripple', '4s ease-out infinite', '.empty-state::before'],
  ]) {
    const css = `@keyframes ${name} { from { opacity: .4; } to { opacity: .8; } }
      @media ${sceneMedia} { ${sceneScope} ${oldTarget} { animation: ${name} ${timing}; } }`;
    assert.ok(checkMotion(css).length, oldTarget);
  }
});

test('motion rejects focus-dependent empty-scene pauses but preserves explicit static resets', () => {
  for (const declaration of ['animation-play-state: paused', 'animation: none']) {
    for (const target of ['.view-content::before', '.view-content .empty-state::after', '.view-content .empty-state-container::after']) {
      assert.ok(checkMotion(`body:not(.is-focused) .workspace-leaf-content[data-type="empty"] ${target} { ${declaration}; }`).length,
        `${target} ${declaration}`);
    }
  }
  assert.deepEqual(checkMotion(`
    body.tk-disable-motion .workspace-leaf-content[data-type="empty"] .view-content::before { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) {
      .workspace-leaf-content[data-type="empty"] .view-content::before { animation: none; }
    }
    body:not(.is-focused) .unrelated-spinner { animation-play-state: paused; }
  `), []);
});

test('motion rejects unguarded, long or reading-targeted UI transitions', () => {
  const transition = 'transition: color var(--tk-transition-duration) ease';
  for (const css of [
    `body:not(.tk-disable-motion) :is(button) { ${transition}; }`,
    `@media (prefers-reduced-motion: no-preference) { body :is(button) { ${transition}; } }`,
    `@media (prefers-reduced-motion: no-preference) { body:not(.tk-disable-motion) :is(.markdown-rendered) { ${transition}; } }`,
    '@media (prefers-reduced-motion: no-preference) { body:not(.tk-disable-motion) :is(button) { transition: all 10s ease; } }',
    '@media (prefers-reduced-motion: no-preference) { body:not(.tk-disable-motion) { --tk-transition-duration: 2s; } }',
  ]) assert.ok(checkMotion(css).length, css);
});

test('motion accepts bounded one-shot navigation labels and Markdown view roots', () => {
  for (const contract of interactionCases) {
    assert.deepEqual(checkMotion(interactionCss(contract)), []);
    assert.deepEqual(checkMotion(interactionCss(contract).replaceAll(' > ', '>')), []);
  }
  assert.deepEqual(checkMotion(interactionCases.map((contract) => interactionCss(contract)).join('\n')), []);
});

test('interaction motion requires screen, reduced-motion and static-mode guards', () => {
  for (const contract of interactionCases) {
    for (const media of [
      'screen',
      '(prefers-reduced-motion: no-preference)',
      'screen and (prefers-reduced-motion: reduce)',
      'print and (prefers-reduced-motion: no-preference)',
      `${interactionMedia}, screen`,
      'screen and (prefers-reduced-motion: no-preference), (prefers-reduced-motion: reduce)',
    ]) assert.ok(checkMotion(interactionCss(contract, media)).length, media);
    for (const scope of ['body', 'body.tk-disable-motion', 'body:not(.tk-minimal)']) {
      assert.ok(checkMotion(interactionCss(contract, undefined, scope)).length, scope);
    }
    assert.ok(checkMotion(`${contract.frames} ${interactionScope} ${contract.targets[0]} { animation: ${contract.animation}; }`).length,
      'unguarded stylesheet');
  }
});

test('interaction motion rejects global, focus-triggered, editing and clickable-row targets', () => {
  const unsafeTargets = [
    '.markdown-reading-view',
    '.markdown-preview-sizer',
    '.markdown-rendered p',
    '.cm-content',
    '.cm-line',
    '.workspace-tab-header.is-active',
    '.nav-file-title.is-active',
    '.workspace-tab-header:hover .workspace-tab-header-inner-title',
    '.nav-file-title:focus .nav-file-title-content',
    '.mod-left-split .workspace-tab-header.is-active',
    '.mod-right-split .workspace-tab-header.is-active .workspace-tab-header-inner-title',
    '.mod-left-split .workspace-tab-header:hover .workspace-tab-header-inner-icon',
    '.mod-left-split .workspace-tab-header .workspace-tab-header-inner-icon',
    '.mod-unknown-split .workspace-tab-header.is-active .workspace-tab-header-inner-icon',
    '.workspace-leaf.mod-active .workspace-leaf-content[data-type="markdown"] > .view-content > .markdown-reading-view',
    '.workspace-leaf-content[data-type="markdown"] > .view-content > .markdown-source-view.mod-cm6:focus-within',
    '.workspace-leaf-content[data-type="markdown"] > .view-content > .markdown-source-view.mod-cm6 .cm-content',
  ];
  for (const contract of interactionCases) {
    for (const target of unsafeTargets) {
      assert.ok(checkMotion(interactionCss({ ...contract, targets: [target] })).length, target);
    }
    assert.ok(checkMotion(interactionCss({ ...contract, targets: [...contract.targets, '.cm-line'] })).length,
      'an allowed selector must not hide an unsafe selector in a list');
  }
  for (const [index, contract] of interactionCases.entries()) {
    for (const [otherIndex, other] of interactionCases.entries()) {
      if (index === otherIndex) continue;
      assert.ok(checkMotion(interactionCss({ ...contract, targets: other.targets })).length,
        'navigation, article and sidebar contracts cannot share targets');
    }
  }
});

test('interaction motion rejects repeat, delay, retained transforms and longhand bypasses', () => {
  for (const contract of interactionCases) {
    for (const animation of [
      `${contract.animation} infinite`,
      `${contract.animation} 2`,
      `${contract.animation} 10s`,
      `${contract.animation} forwards`,
      `${contract.animation} both`,
      `${contract.animation}, ${contract.animation}`,
      contract.animation.replace(/\d+ms/, '2s'),
      `${contract.animation} !important`,
    ]) assert.ok(checkMotion(interactionCss({ ...contract, animation })).length, animation);
    for (const declaration of [
      'animation-duration: 10s',
      'animation-delay: 30s',
      'animation-iteration-count: infinite',
      'animation-fill-mode: forwards',
      'animation-timeline: scroll()',
      'animation-composition: add',
      '-webkit-animation: tk-note-enter 460ms ease-out',
    ]) assert.ok(checkMotion(interactionCss(contract).replace(`animation: ${contract.animation};`,
      `animation: ${contract.animation}; ${declaration};`)).length, declaration);
  }
});

test('interaction keyframes enforce bounded movement and a fully visible settled endpoint', () => {
  const [jelly, note, sidebar] = interactionCases;
  for (const frames of [
    jelly.frames.replace('1.06', '1.5'),
    jelly.frames.replace('0.9', '0.2'),
    jelly.frames.replace('scale(1, 1)', 'scale(1.06, 0.9)'),
    jelly.frames.replace('transform: scale(0.97, 1.055);', 'left: 30px;'),
    jelly.frames.replace('65%', '99%'),
  ]) assert.ok(checkMotion(interactionCss({ ...jelly, frames })).length, frames);
  for (const frames of [
    note.frames.replace('14px', '140px'),
    note.frames.replace('opacity: .3', 'opacity: 0'),
    note.frames.replace('opacity: 1', 'opacity: .3'),
    note.frames.replace('translateY(0)', 'translateY(14px)'),
    note.frames.replace('transform: translateY(14px);', 'filter: blur(14px);'),
    note.frames.replace('opacity: 1;', 'opacity: 1 !important;'),
  ]) assert.ok(checkMotion(interactionCss({ ...note, frames })).length, frames);
  for (const frames of [
    sidebar.frames.replace('1.22', '2.2'),
    sidebar.frames.replace('0.78', '0.1'),
    sidebar.frames.replace('scale(1, 1)', 'scale(1.22, 0.78)'),
    sidebar.frames.replace('transform: scale(1.06, 0.94);', 'width: 40px;'),
    sidebar.frames.replace('84%', '99%'),
  ]) assert.ok(checkMotion(interactionCss({ ...sidebar, frames })).length, frames);
  for (const contract of interactionCases) {
    assert.ok(checkMotion(interactionCss({ ...contract, frames: '' })).length, 'missing keyframes');
    assert.ok(checkMotion(`${contract.frames}\n${interactionCss(contract)}`).length, 'duplicate keyframes');
  }
});

test('reading protection allows solid content fills, markers, resets and empty-view artwork', () => {
  assert.deepEqual(checkReading(`
    :root { --tk-background: #14202a; }
    body.theme-dark { --tk-sidebar: #101820; --tk-raised: #203040; }
    .markdown-reading-view { background: var(--tk-background); }
    .markdown-rendered code { background: var(--tk-sidebar, var(--tk-raised, transparent)); }
    .markdown-rendered pre { background-color: #14202a; }
    .callout { background-color: rgba(var(--tk-sea-rgb), .08); }
    .markdown-rendered td, .callout { background: rgba(80, 150, 140, .08); }
    .markdown-rendered li::marker { content: "•"; color: teal; }
    .inline-title { text-shadow: none; background-image: none; }
    .inline-title, .view-header::after { content: ""; }
    .tk-home h1::after { content: none; display: none; }
    .workspace-leaf-content[data-type="empty"] .view-content::before {
      content: "";
      background: radial-gradient(circle, teal, transparent);
    }
    .view-header::after { content: ""; background: linear-gradient(90deg, teal, gold); }
  `), []);
});

test('reading protection rejects the former heading poster and text-shadow styles', () => {
  for (const css of [
    'body:not(.tk-minimal) .tk-home h1 { background: linear-gradient(120deg, teal, transparent), #14202a; }',
    'body:not(.tk-minimal) .inline-title { text-shadow: 2px 2px 0 teal; }',
    '.markdown-rendered h2 { background: repeating-linear-gradient(45deg, teal, transparent 4px); }',
    '.markdown-source-view .HyperMD-header-1 { background-image: var(--tk-art); }',
    '.cm-content { background: url("data:image/svg+xml,test"); }',
    '.markdown-reading-view { background-image: radial-gradient(circle, gold, transparent); }',
    'h1 { text-shadow: 1px 1px black; }',
  ]) assert.ok(checkReading(css).length, css);
});

test('reading protection rejects generated note artwork, including legacy and grouped selectors', () => {
  for (const selector of [
    '.tk-home h1::before',
    '.markdown-rendered::after',
    '.markdown-preview-sizer::before',
    '.cm-line:before',
    '.inline-title::after',
    '.view-header::before, .markdown-rendered h1::before',
    '.markdown-rendered :is(h1, h2)::after',
  ]) assert.ok(checkReading(`${selector} { content: ""; position: absolute; }`).length, selector);
});

test('reading protection rejects unknown background variables and nested image fallbacks', () => {
  for (const background of [
    'var(--tk-art)',
    'var(--tk-background, var(--tk-art))',
    'var(--tk-background, var(--tk-sidebar, linear-gradient(90deg, teal, transparent)))',
    'var(--tk-background, var(--tk-raised, url("data:image/svg+xml,test")))',
  ]) assert.ok(checkReading(`.markdown-rendered h1 { background: ${background}; }`).length, background);
});

test('reading protection rejects note-scoped overrides of trusted surface tokens', () => {
  for (const variable of ['--tk-background', '--tk-sidebar', '--tk-raised']) {
    for (const value of ['linear-gradient(90deg, teal, transparent)', 'var(--tk-art)']) {
      assert.ok(checkReading(`.markdown-rendered { ${variable}: ${value}; background: var(${variable}); }`).length,
        `${variable}: ${value}`);
    }
  }
});

test('sign contrast checks actual selected-file and branding overrides in both modes', () => {
  const css = `
    :root { --tk-sign-paper: #f4f0dc; --tk-sign-ink: #102437; }
    body:not(.tk-minimal) .nav-file-title.is-active {
      color: var(--tk-sign-ink); background-color: var(--tk-sign-paper);
    }
    body:not(.tk-minimal) .workspace-leaf-content[data-type="file-explorer"] .nav-files-container::before {
      color: var(--tk-sign-paper); background-color: var(--tk-sign-ink);
    }
  `;
  for (const mode of ['dark', 'light']) {
    const result = validateSignageContrast(parse(css), mode);
    assert.deepEqual(result.errors, []);
    assert.ok(result.results['selected-sign'] > 10);
    assert.ok(result.results['brand-sign'] > 10);
    assert.ok(validateSignageContrast(parse(css.replace('#102437', '#e5e2d5')), mode).errors.length);
    assert.ok(validateSignageContrast(parse(css.replace('background-color: var(--tk-sign-paper)', 'background-color: transparent')), mode).errors.length);
    assert.ok(validateSignageContrast(parse(css.replace('--tk-sign-paper: #f4f0dc', '--tk-sign-paper: #f4f0dc80')), mode).errors.length);
  }
});
