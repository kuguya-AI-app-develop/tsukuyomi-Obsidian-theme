import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse } from 'css-tree';
import { validateSvgDataUrl, validateMotion } from './check.mjs';

const svgUrl = (body, attributes = '') => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${attributes}>${body}</svg>`,
)}`;
const checkMotion = (css) => validateMotion(parse(css));

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
