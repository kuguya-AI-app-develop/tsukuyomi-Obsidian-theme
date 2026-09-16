import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse } from 'css-tree';
import { validateSvgDataUrl, validateMotion, validateReadingProtection } from './check.mjs';

const svgUrl = (body, attributes = '') => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${attributes}>${body}</svg>`,
)}`;
const checkMotion = (css) => validateMotion(parse(css));
const checkReading = (css) => validateReadingProtection(parse(css));

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

test('motion accepts static styles and short opt-in transitions', () => {
  assert.deepEqual(checkMotion('body { color: white; }'), []);
  assert.deepEqual(checkMotion(`
    :root { --tk-transition-duration: 0ms; }
    @media (prefers-reduced-motion: no-preference) {
      body.tk-enable-motion { --tk-transition-duration: 140ms; }
      body.tk-enable-motion button { transition: color var(--tk-transition-duration) ease; }
    }
  `), []);
});

test('motion rejects every keyframes definition, including opt-in and vendor forms', () => {
  for (const keyword of ['keyframes', '-webkit-keyframes', '-moz-keyframes']) {
    const definition = `@${keyword} decorative { from { transform: rotate(0deg); } to { transform: rotate(3deg); } }`;
    assert.ok(checkMotion(definition).length, keyword);
    assert.ok(checkMotion(`@media (prefers-reduced-motion: no-preference) { ${definition} }`).length, keyword);
  }
});

test('motion rejects animation shorthand, longhands and vendor bypasses in every scope', () => {
  for (const declaration of [
    'animation: decorative 1200ms ease 2',
    'animation: decorative 140ms ease',
    'animation: var(--motion)',
    'animation: none',
    'animation-name: decorative',
    'animation-duration: 140ms',
    'animation-iteration-count: 1',
    'animation-timeline: scroll()',
    '-webkit-animation: decorative 140ms ease',
    '-webkit-animation-name: decorative',
  ]) {
    assert.ok(checkMotion(`button { ${declaration}; }`).length, declaration);
    assert.ok(checkMotion(`@media (prefers-reduced-motion: no-preference) { body.tk-enable-motion button { ${declaration}; } }`).length, declaration);
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
