import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generate,
  lexer,
  parse as parseCss,
  walk,
} from 'css-tree';
import { parse as parseYaml } from 'yaml';

import { root, sourceFiles, renderSource } from './build.mjs';

const MIN_APP_VERSION = '1.13.7';
const MAX_CSS_BYTES = 50 * 1024;
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value ?? '');
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function splitTopLevel(value, separator = ',') {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === separator && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  parts.push(value.slice(start).trim());
  return parts;
}

function validateManifest(manifest, packageJson) {
  for (const field of ['name', 'version', 'minAppVersion', 'author']) {
    assert(typeof manifest[field] === 'string' && manifest[field].trim(), `manifest.json requires a non-empty ${field}`);
  }
  assert(manifest.name === 'Tsukuyomi', 'manifest name must be Tsukuyomi');
  assert(parseVersion(manifest.version), `manifest version is not semantic: ${manifest.version}`);
  assert(parseVersion(manifest.minAppVersion), `manifest minAppVersion is not semantic: ${manifest.minAppVersion}`);
  const minimumComparison = compareVersions(manifest.minAppVersion, MIN_APP_VERSION);
  assert(minimumComparison !== null && minimumComparison >= 0, `manifest minAppVersion must be at least ${MIN_APP_VERSION}`);
  assert(packageJson.version === manifest.version, 'package.json and manifest.json versions differ');
}

function validateSettings(sourceCss) {
  const blocks = [...sourceCss.matchAll(/\/\*\s*@settings\s*([\s\S]*?)\*\//g)];
  assert(blocks.length === 1, `expected exactly one @settings block, found ${blocks.length}`);
  if (blocks.length !== 1) return 0;

  let settingsDocument;
  try {
    settingsDocument = parseYaml(blocks[0][1]);
  } catch (error) {
    failures.push(`@settings YAML is invalid: ${error.message}`);
    return 0;
  }

  assert(typeof settingsDocument?.name === 'string' && /^Tsukuyomi(?:\s|（|\(|$)/.test(settingsDocument.name),
    '@settings name must identify Tsukuyomi');
  assert(typeof settingsDocument?.id === 'string' && settingsDocument.id.length > 0, '@settings requires an id');
  const settings = settingsDocument?.settings;
  assert(Array.isArray(settings), '@settings settings must be an array');
  if (!Array.isArray(settings)) return 0;

  const expectedIds = [
    'tk-minimal',
    'tk-reading-width',
    'tk-density',
    'tk-decoration-opacity',
    'tk-disable-motion',
  ];
  const byId = new Map(settings.map((setting) => [setting?.id, setting]));
  assert(settings.length === expectedIds.length, `@settings must contain exactly ${expectedIds.length} options`);
  assert(byId.size === settings.length, '@settings option ids must be unique');
  for (const id of expectedIds) assert(byId.has(id), `@settings is missing ${id}`);
  for (const setting of settings) {
    assert(expectedIds.includes(setting?.id), `unexpected @settings option ${setting?.id ?? '(missing id)'}`);
    assert(typeof setting?.title === 'string' && setting.title.trim(), `${setting?.id ?? 'setting'} requires a title`);
  }

  for (const id of ['tk-minimal', 'tk-disable-motion']) {
    const setting = byId.get(id);
    if (!setting) continue;
    assert(setting.type === 'class-toggle', `${id} must be a class-toggle`);
    assert(setting.default === false, `${id} must default to false`);
  }

  const width = byId.get('tk-reading-width');
  if (width) {
    assert(width.type === 'variable-number-slider', 'tk-reading-width must be a variable-number-slider');
    assert(width.default === 40, 'tk-reading-width must default to 40');
    assert(width.format === 'rem', 'tk-reading-width must use rem');
    assert(Number.isFinite(width.min) && Number.isFinite(width.max) && width.min <= width.default && width.default <= width.max,
      'tk-reading-width default must be within its numeric range');
    assert(Number.isFinite(width.step) && width.step > 0, 'tk-reading-width step must be positive');
  }

  const opacity = byId.get('tk-decoration-opacity');
  if (opacity) {
    assert(opacity.type === 'variable-number-slider', 'tk-decoration-opacity must be a variable-number-slider');
    assert(opacity.default === 0.7, 'tk-decoration-opacity must default to 0.70');
    assert(Number.isFinite(opacity.min) && Number.isFinite(opacity.max)
      && opacity.min <= opacity.default && opacity.default <= opacity.max,
    'tk-decoration-opacity default must be within its numeric range');
    assert(Number.isFinite(opacity.step) && opacity.step > 0, 'tk-decoration-opacity step must be positive');
  }

  const density = byId.get('tk-density');
  if (density) {
    assert(density.type === 'class-select', 'tk-density must be a class-select');
    const options = Array.isArray(density.options) ? density.options : [];
    const values = new Set(options.map((option) => option?.value));
    assert(options.length === 2 && values.size === 2, 'tk-density must have exactly two unique options');
    assert(values.has('tk-density-standard') && values.has('tk-density-compact'),
      'tk-density options must be standard and compact');
    assert(density.default === 'tk-density-standard', 'tk-density must default to standard');
    assert(density.allowEmpty === false, 'tk-density must not allow an empty selection');
    for (const option of options) {
      assert(typeof option?.label === 'string' && option.label.trim(), 'tk-density options require labels');
    }
  }

  return settings.length;
}

// Deliberately support only the small, static SVG vocabulary used by the original
// geometric artwork. A restrictive tokenizer keeps scripts, references and XML
// entities out without adding a general-purpose XML dependency to the build.
export function validateSvgDataUrl(value) {
  const invalid = (reason) => [`SVG asset: ${reason}`];
  if (!value.startsWith('data:image/svg+xml,')) return invalid('only percent-encoded data:image/svg+xml URLs are allowed');
  let svg;
  try {
    svg = decodeURIComponent(value.slice('data:image/svg+xml,'.length));
  } catch {
    return invalid('invalid percent encoding');
  }
  if (Buffer.byteLength(svg) > 10 * 1024) return invalid('decoded artwork exceeds 10 KiB');
  if (/[&\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(svg)) return invalid('entities and control characters are not allowed');

  const attributesByElement = {
    svg: ['xmlns', 'viewBox', 'width', 'height', 'preserveAspectRatio'],
    g: [], path: ['d'], circle: ['cx', 'cy', 'r'], ellipse: ['cx', 'cy', 'rx', 'ry'],
    rect: ['x', 'y', 'width', 'height', 'rx', 'ry'], line: ['x1', 'x2', 'y1', 'y2'],
    polyline: ['points'], polygon: ['points'], title: [], desc: [],
  };
  const presentation = new Set(['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'stroke-miterlimit', 'stroke-dasharray', 'opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'fill-rule']);
  const numeric = /^[+\-\d.eE\s,]+$/;
  const stack = [];
  let rootSeen = false;
  let cursor = 0;
  const tokens = /<[^>]*>|[^<]+/gy;
  let token;
  while ((token = tokens.exec(svg))) {
    cursor = tokens.lastIndex;
    const text = token[0];
    if (!text.startsWith('<')) {
      if (text.trim() && !['title', 'desc'].includes(stack.at(-1))) return invalid('text is allowed only in title and desc');
      continue;
    }
    const closing = /^<\/([A-Za-z]+)\s*>$/.exec(text);
    if (closing) {
      if (stack.pop() !== closing[1]) return invalid('mismatched element nesting');
      continue;
    }
    const opening = /^<([A-Za-z]+)([\s\S]*?)(\/?)>$/.exec(text);
    if (!opening) return invalid('unsupported XML markup');
    const [, element, rest, selfClosing] = opening;
    if (!Object.hasOwn(attributesByElement, element)) return invalid(`element ${element} is not allowed`);
    if (!stack.length) {
      if (rootSeen || element !== 'svg') return invalid('expected one SVG root');
      rootSeen = true;
    } else if (!['svg', 'g'].includes(stack.at(-1)) || element === 'svg') {
      return invalid('invalid graphics nesting');
    }
    const seen = new Set();
    let remaining = rest;
    while (remaining.trim()) {
      const attribute = /^\s+([A-Za-z][\w:-]*)\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)')/.exec(remaining);
      if (!attribute) return invalid('malformed attribute');
      const name = attribute[1];
      const content = attribute[2] ?? attribute[3];
      remaining = remaining.slice(attribute[0].length);
      if (seen.has(name)) return invalid(`duplicate attribute ${name}`);
      seen.add(name);
      if (!attributesByElement[element].includes(name) && !presentation.has(name)) return invalid(`attribute ${name} is not allowed`);
      if (name === 'xmlns') {
        if (content !== 'http://www.w3.org/2000/svg') return invalid('invalid SVG namespace');
      } else if (name === 'fill' || name === 'stroke') {
        if (!/^(?:none|currentColor|#[\da-f]{3,4}|#[\da-f]{6}|#[\da-f]{8})$/i.test(content)) return invalid(`invalid ${name} color`);
      } else if (name === 'd') {
        if (!/^[MmZzLlHhVvCcSsQqTtAa+\-\d.eE\s,]+$/.test(content)) return invalid('invalid path data');
      } else if (name === 'transform') {
        if (!/^(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\([+\-\d.eE\s,]+\)\s*)+$/.test(content)) return invalid('invalid transform');
      } else if (name === 'stroke-linecap') {
        if (!/^(?:butt|round|square)$/.test(content)) return invalid('invalid linecap');
      } else if (name === 'stroke-linejoin') {
        if (!/^(?:miter|round|bevel)$/.test(content)) return invalid('invalid linejoin');
      } else if (name === 'fill-rule') {
        if (!/^(?:nonzero|evenodd)$/.test(content)) return invalid('invalid fill rule');
      } else if (name === 'preserveAspectRatio') {
        if (!/^(?:none|x(?:Min|Mid|Max)Y(?:Min|Mid|Max)(?:\s+(?:meet|slice))?)$/.test(content)) return invalid('invalid aspect ratio');
      } else if (!numeric.test(content)) return invalid(`invalid numeric attribute ${name}`);
    }
    if (element === 'svg' && (!seen.has('xmlns') || !seen.has('viewBox'))) return invalid('root requires xmlns and viewBox');
    if (!selfClosing) stack.push(element);
  }
  if (cursor !== svg.length || stack.length || !rootSeen) return invalid('incomplete SVG document');
  return [];
}

export function validateMotion(ast) {
  const errors = [];
  const scenePrefix = 'body:not(.tk-minimal):not(.tk-disable-motion) .workspace-leaf.mod-active .workspace-leaf-content[data-type="empty"] ';
  const contracts = new Map([
    ['tk-fish-drift', { value: 'tk-fish-drift 8s ease-in-out infinite alternate', targets: ['.view-content::before'] }],
    ['tk-mirror-breathe', { value: 'tk-mirror-breathe 5s ease-in-out infinite', targets: ['.view-content .empty-state::after'] }],
    ['tk-water-ripple', { value: 'tk-water-ripple 4s ease-out infinite', targets: ['.view-content .empty-state-container::after'] }],
  ]);
  const requiredMedia = ['screen', '(prefers-reduced-motion:no-preference)', '(min-width:601px)', '(min-height:561px)'];
  const transitionTargets = new Set(['.workspace-tab-header', '.nav-file-title', '.nav-folder-title',
    '.tree-item-self', '.clickable-icon', 'button', '.suggestion-item', '.menu-item', '.canvas-node-container']);
  const ancestors = [];
  const definitions = new Set();
  const references = new Set();
  const mediaTerms = () => ancestors.filter((node) => node.name.toLowerCase() === 'media')
    .flatMap((node) => generate(node.prelude).toLowerCase().split(/\s+and\s+/).map((term) => term.replace(/\s+/g, '')));

  walk(ast, {
    enter(node) {
      if (node.type === 'Atrule') {
        ancestors.push(node);
        if (/keyframes$/i.test(node.name)) {
          const name = node.prelude ? generate(node.prelude) : '';
          if (node.name !== 'keyframes' || !contracts.has(name)) {
            errors.push(`motion: unsupported keyframes ${node.name} ${name}`);
          }
          if (definitions.has(name)) errors.push(`motion: duplicate keyframes ${name}`);
          definitions.add(name);
        }
        return;
      }
      if (node.type !== 'Declaration') return;
      const property = node.property.toLowerCase();
      const value = generate(node.value).trim();
      if (ancestors.some((ancestor) => /keyframes$/i.test(ancestor.name))) {
        if (!['transform', 'opacity'].includes(property) || node.important) {
          errors.push(`motion: keyframes may contain only transform and opacity, found ${property}`);
        }
        return;
      }

      if (property === '--tk-transition-duration' && !['0ms', '0s'].includes(value)) {
        const selector = this.rule?.prelude ? generate(this.rule.prelude) : '';
        if (value !== '140ms' || selector !== 'body:not(.tk-disable-motion)'
          || !mediaTerms().includes('(prefers-reduced-motion:no-preference)')) {
          errors.push('motion: nonzero UI transition duration requires the static-scene and reduced-motion guards, with a 140ms limit');
        }
      }
      if (/^(?:-\w+-)?transition(?:-|$)/i.test(property)) {
        if (property === 'transition' && value === 'none') return;
        const parts = splitTopLevel(value);
        if (property !== 'transition'
          || !parts.every((part) => /^(?:color|background-color|border-color|box-shadow) var\(--tk-transition-duration\) ease$/.test(part))) {
          errors.push(`motion: unsupported UI transition ${property}: ${value}`);
        }
        const terms = mediaTerms();
        if (!terms.includes('(prefers-reduced-motion:no-preference)')
          || terms.some((term) => !['screen', '(prefers-reduced-motion:no-preference)'].includes(term))) {
          errors.push('motion: UI transitions require the reduced-motion guard');
        }
        const selectors = this.rule?.prelude;
        if (selectors?.type !== 'SelectorList') errors.push('motion: UI transitions require a guarded UI selector');
        else selectors.children.forEach((selector) => {
          const match = /^body:not\(\.tk-disable-motion\) :is\((.+)\)$/.exec(generate(selector));
          if (!match || !splitTopLevel(match[1]).every((target) => transitionTargets.has(target))) {
            errors.push('motion: UI transitions require the static-scene guard and known UI targets');
          }
        });
        return;
      }

      if (!/^(?:-\w+-)?animation(?:-|$)/i.test(property)) return;
      if ((property === 'animation' && value === 'none')
        || (property === 'animation-play-state' && value === 'paused')) {
        // An active, visible empty scene must keep moving when focus goes to
        // another app. Preserve ordinary static-mode/reduced-motion resets.
        this.rule?.prelude?.children?.forEach((selector) => {
          const text = generate(selector);
          if (/\.is-focused\b/.test(text) && /\[data-type=(?:"empty"|'empty'|empty)\]/.test(text)) {
            errors.push('motion: visible empty scenes must not pause based on window focus');
          }
        });
        return;
      }
      if (property !== 'animation') {
        errors.push(`motion: unsupported animation property ${property}`);
        return;
      }
      const name = value.split(/\s+/)[0];
      const contract = contracts.get(name);
      if (!contract || value !== contract.value || node.important) {
        errors.push(`motion: unsupported scene animation ${value}`);
        return;
      }
      references.add(name);
      const terms = mediaTerms();
      if (!requiredMedia.every((term) => terms.includes(term))
        || terms.some((term) => !requiredMedia.includes(term))) {
        errors.push(`motion: ${name} requires screen, reduced-motion and minimum viewport guards`);
      }
      const selectors = this.rule?.prelude;
      if (selectors?.type !== 'SelectorList') {
        errors.push(`motion: ${name} requires a scoped empty-view selector`);
        return;
      }
      selectors.children.forEach((selector) => {
        const text = generate(selector);
        if (!contract.targets.some((target) => text === scenePrefix + target)) {
          errors.push(`motion: ${name} is outside its active empty-view pseudo-element: ${text}`);
        }
      });
    },
    leave(node) {
      if (node.type === 'Atrule') ancestors.pop();
    },
  });
  for (const name of references) {
    if (!definitions.has(name)) errors.push(`motion: missing keyframes ${name}`);
  }
  return errors;
}

// A regression guard for this theme's explicit reading selectors, not a full
// cascade or accessibility analysis. Solid code/table/callout fills remain valid;
// decorative images and generated artwork belong outside note content.
export function validateReadingProtection(ast) {
  const errors = [];
  const readingClass = /^(?:markdown-(?:source-view|reading-view|preview-view|preview-section|preview-sizer|rendered)|cm-[\w-]+|HyperMD-header-[1-6]|inline-title|tk-home|callout(?:-[\w-]+)?|metadata-container)$/;
  const resetValue = /^(?:none|initial|revert|revert-layer|unset)$/i;
  // Keep variable-based shorthand limited to our known solid surfaces. Other
  // variable tints should use background-color, which cannot render an image.
  const solidBackgroundVariables = new Set(['--tk-background', '--tk-sidebar', '--tk-raised']);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (rule.prelude?.type !== 'SelectorList') return;
      rule.prelude.children.forEach((selectorNode) => {
        let reading = false;
        let generatedPseudo = false;
        walk(selectorNode, {
          enter(node) {
            if (node.type === 'ClassSelector' && readingClass.test(node.name)) reading = true;
            if (node.type === 'TypeSelector' && /^h[1-6]$/i.test(node.name)) reading = true;
            if (['PseudoElementSelector', 'PseudoClassSelector'].includes(node.type)
              && /^(?:before|after)$/i.test(node.name)) generatedPseudo = true;
          },
        });
        if (!reading) return;

        const selector = generate(selectorNode);
        rule.block.children.forEach((node) => {
          if (node.type !== 'Declaration') return;
          const property = node.property.toLowerCase();
          const value = generate(node.value);
          if (solidBackgroundVariables.has(node.property)) {
            errors.push(`reading protection: ${property} must be defined on root or theme modes, not ${selector}`);
          }
          const imageBackground = (property === 'background-image' && !resetValue.test(value))
            || (property === 'background' && /(?:\burl|\b(?:repeating-)?(?:linear|radial|conic)-gradient)\(/i.test(value));
          if (imageBackground) errors.push(`reading protection: image backgrounds are not allowed in ${selector}`);
          if (property === 'background') {
            for (const [, variable] of value.matchAll(/\bvar\(\s*(--[\w-]+)/gi)) {
              if (!solidBackgroundVariables.has(variable)) {
                errors.push(`reading protection: background shorthand in ${selector} uses non-surface variable ${variable}; use background-color for solid variable fills`);
              }
            }
          }
          if (property === 'text-shadow' && !resetValue.test(value)) {
            errors.push(`reading protection: text shadows are not allowed in ${selector}`);
          }
          if (generatedPseudo && property === 'content' && !resetValue.test(value) && value !== 'normal') {
            errors.push(`reading protection: generated decoration is not allowed in ${selector}`);
          }
        });
      });
    },
  });
  return errors;
}

function validateCss(ast, css) {
  let validatedValues = 0;
  let dynamicValues = 0;
  let unknownValues = 0;
  const declaredThemeVariables = new Set();
  const referencedThemeVariables = new Set();

  walk(ast, {
    visit: 'Atrule',
    enter(node) {
      const name = node.name.toLowerCase();
      assert(name !== 'import', '@import is not allowed');
    },
  });

  walk(ast, {
    visit: 'Url',
    enter(node) {
      const value = String(node.value?.value ?? node.value ?? '').trim().replace(/^['"]|['"]$/g, '');
      failures.push(...validateSvgDataUrl(value));
    },
  });

  walk(ast, {
    visit: 'Declaration',
    enter(node) {
      const property = node.property.toLowerCase();
      const value = generate(node.value);
      const selector = this.rule?.prelude ? generate(this.rule.prelude) : '';

      if (property.startsWith('--tk-')) declaredThemeVariables.add(property);
      for (const match of value.matchAll(/var\(\s*(--tk-[\w-]+)/g)) referencedThemeVariables.add(match[1]);

      assert(property !== 'backdrop-filter' && property !== '-webkit-backdrop-filter',
        `${property} is outside the visual-effects budget`);

      const editorSurface = /\.(?:cm-editor|cm-content|cm-line|cm-scroller|markdown-source-view|markdown-preview-view|markdown-reading-view)\b/.test(selector);
      const pseudoElement = /::(?:before|after)\b/.test(selector);
      if (property === 'position' && /^(?:absolute|fixed|sticky)$/.test(value) && editorSurface && !pseudoElement) {
        failures.push(`forced editor positioning is not allowed: ${selector} { position: ${value} }`);
      }

      if (property.startsWith('--font-')) failures.push(`theme must not override user font variable ${property}`);
      if (property === 'font-family' && !/^(?:inherit|revert|revert-layer|unset|var\(--font-(?:text|interface|monospace)\))$/.test(value)) {
        failures.push(`theme must preserve the user's font family: ${selector || '(at-rule)'} uses ${value}`);
      }
      if (property === 'font' && !/^(?:inherit|revert|revert-layer|unset)$/.test(value)) {
        failures.push(`font shorthand can override the user's font family: ${selector || '(at-rule)'}`);
      }
      if (property === 'font-size' && /^(?:body|:root)(?:,|$)/.test(selector)) {
        failures.push(`theme must preserve the user's base font size: ${selector} uses ${value}`);
      }

      if (property.startsWith('--')) return;
      if (property.startsWith('-') || !lexer.getProperty(property)) {
        unknownValues += 1;
        return;
      }

      const match = lexer.matchProperty(property, node.value);
      if (match.matched) {
        validatedValues += 1;
      } else if (/\b(?:var|env|attr)\(/i.test(value)
        || match.error?.message?.includes('Matching for a tree with var() is not supported')) {
        dynamicValues += 1;
      } else {
        failures.push(`invalid ${property} value "${value}"${selector ? ` in ${selector}` : ''}`);
      }
    },
  });

  failures.push(...validateMotion(ast));
  failures.push(...validateReadingProtection(ast));

  for (const variable of referencedThemeVariables) {
    assert(declaredThemeVariables.has(variable), `unresolved Tsukuyomi variable ${variable}`);
  }

  assert(Buffer.byteLength(css) < MAX_CSS_BYTES,
    `theme.css must stay below 50 KiB (found ${(Buffer.byteLength(css) / 1024).toFixed(1)} KiB)`);
  return { validatedValues, dynamicValues, unknownValues };
}

function selectorSpecificity(selector) {
  const ids = (selector.match(/#[\w-]+/g) ?? []).length;
  const classes = (selector.match(/\.[\w-]+|:[\w-]+/g) ?? []).length;
  const elements = (selector.match(/^(?:body|html)\b/) ?? []).length;
  return ids * 100 + classes * 10 + elements;
}

function globalSelectorSpecificity(selector, mode) {
  const compact = selector.replace(/\s+/g, '');
  const allowed = new Set([
    ':root',
    'body',
    `.theme-${mode}`,
    `body.theme-${mode}`,
    `:root.theme-${mode}`,
  ]);
  return allowed.has(compact) ? selectorSpecificity(compact) : null;
}

function collectModeVariables(ast, mode) {
  const candidates = new Map();
  let order = 0;

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (!rule.prelude?.children || this.atrule) return;
      const specificities = [];
      rule.prelude.children.forEach((selector) => {
        const specificity = globalSelectorSpecificity(generate(selector), mode);
        if (specificity !== null) specificities.push(specificity);
      });
      if (!specificities.length) return;
      const specificity = Math.max(...specificities);

      rule.block.children.forEach((declaration) => {
        if (declaration.type !== 'Declaration' || !declaration.property.startsWith('--')) return;
        order += 1;
        const candidate = {
          value: generate(declaration.value),
          important: Boolean(declaration.important),
          specificity,
          order,
        };
        const current = candidates.get(declaration.property);
        const wins = !current
          || Number(candidate.important) > Number(current.important)
          || (candidate.important === current.important && candidate.specificity > current.specificity)
          || (candidate.important === current.important && candidate.specificity === current.specificity
            && candidate.order > current.order);
        if (wins) candidates.set(declaration.property, candidate);
      });
    },
  });

  return new Map([...candidates].map(([name, candidate]) => [name, candidate.value]));
}

function resolveVariables(value, variables, stack = []) {
  let result = value;
  for (let pass = 0; pass < 50 && /var\(/.test(result); pass += 1) {
    const start = result.indexOf('var(');
    let depth = 1;
    let end = start + 4;
    while (end < result.length && depth > 0) {
      if (result[end] === '(') depth += 1;
      if (result[end] === ')') depth -= 1;
      end += 1;
    }
    if (depth !== 0) throw new Error(`unclosed var() in ${value}`);

    const expression = result.slice(start + 4, end - 1);
    const [name, ...fallbackParts] = splitTopLevel(expression);
    const fallback = fallbackParts.join(', ');
    if (stack.includes(name)) throw new Error(`cyclic variable reference: ${[...stack, name].join(' -> ')}`);
    const replacement = variables.has(name)
      ? resolveVariables(variables.get(name), variables, [...stack, name])
      : fallback
        ? resolveVariables(fallback, variables, stack)
        : null;
    if (replacement === null) throw new Error(`unresolved variable ${name}`);
    result = `${result.slice(0, start)}${replacement}${result.slice(end)}`;
  }
  if (/var\(/.test(result)) throw new Error(`too many nested variable references in ${value}`);
  return result.trim();
}

function parseChannel(value) {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? number * 2.55 : number;
}

function parseAlpha(value = '1') {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? number / 100 : number;
}

function hslToRgb(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (offset) => {
    let t = h + offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(1 / 3) * 255, channel(0) * 255, channel(-1 / 3) * 255];
}

function parseColorMix(value, variables) {
  const contents = value.slice(value.indexOf('(') + 1, -1);
  const parts = splitTopLevel(contents);
  if (parts.length !== 3 || !/^in\s+srgb(?:\s|$)/i.test(parts[0])) {
    throw new Error(`only two-color sRGB color-mix() is supported: ${value}`);
  }

  const parseStop = (stop) => {
    const percentageMatch = /\s+([+-]?(?:\d*\.)?\d+)%\s*$/.exec(stop);
    const percentage = percentageMatch ? Number(percentageMatch[1]) / 100 : null;
    const colorText = percentageMatch ? stop.slice(0, percentageMatch.index).trim() : stop;
    return { color: parseColor(colorText, variables), percentage };
  };
  const first = parseStop(parts[1]);
  const second = parseStop(parts[2]);
  if (first.percentage === null && second.percentage === null) {
    first.percentage = 0.5;
    second.percentage = 0.5;
  } else if (first.percentage === null) {
    first.percentage = 1 - second.percentage;
  } else if (second.percentage === null) {
    second.percentage = 1 - first.percentage;
  }
  const total = first.percentage + second.percentage;
  if (!(total > 0)) throw new Error(`invalid color-mix() percentages: ${value}`);
  const alphaMultiplier = Math.min(total, 1);
  const firstWeight = first.percentage / total;
  const secondWeight = second.percentage / total;
  const alpha = (first.color.a * firstWeight + second.color.a * secondWeight) * alphaMultiplier;
  const premultiplied = (channel) => alpha === 0 ? 0 : (
    first.color[channel] * first.color.a * firstWeight
      + second.color[channel] * second.color.a * secondWeight
  ) / (first.color.a * firstWeight + second.color.a * secondWeight || 1);
  return { r: premultiplied('r'), g: premultiplied('g'), b: premultiplied('b'), a: alpha };
}

function parseColor(value, variables) {
  const resolved = resolveVariables(value, variables).trim().toLowerCase();
  if (resolved === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (resolved === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (resolved === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (resolved.startsWith('color-mix(') && resolved.endsWith(')')) return parseColorMix(resolved, variables);

  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(resolved);
  if (hex) {
    const expanded = hex[1].length <= 4 ? [...hex[1]].map((part) => part + part).join('') : hex[1];
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(([\s\S]*)\)$/.exec(resolved);
  if (rgb) {
    let channels;
    let alpha = '1';
    if (rgb[1].includes(',')) {
      channels = splitTopLevel(rgb[1]);
      if (channels.length === 4) alpha = channels.pop();
    } else {
      const slash = splitTopLevel(rgb[1], '/');
      channels = slash[0].trim().split(/\s+/);
      if (slash[1]) alpha = slash[1];
    }
    if (channels.length === 3) {
      return { r: parseChannel(channels[0]), g: parseChannel(channels[1]), b: parseChannel(channels[2]), a: parseAlpha(alpha) };
    }
  }

  const hsl = /^hsla?\(([\s\S]*)\)$/.exec(resolved);
  if (hsl) {
    let channels;
    let alpha = '1';
    if (hsl[1].includes(',')) {
      channels = splitTopLevel(hsl[1]);
      if (channels.length === 4) alpha = channels.pop();
    } else {
      const slash = splitTopLevel(hsl[1], '/');
      channels = slash[0].trim().split(/\s+/);
      if (slash[1]) alpha = slash[1];
    }
    if (channels.length === 3) {
      const [r, g, b] = hslToRgb(Number.parseFloat(channels[0]), Number.parseFloat(channels[1]), Number.parseFloat(channels[2]));
      return { r, g, b, a: parseAlpha(alpha) };
    }
  }

  throw new Error(`unsupported color ${resolved}`);
}

function composite(foreground, background) {
  const alpha = foreground.a + background.a * (1 - foreground.a);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const channel = (name) => (
    foreground[name] * foreground.a + background[name] * background.a * (1 - foreground.a)
  ) / alpha;
  return { r: channel('r'), g: channel('g'), b: channel('b'), a: alpha };
}

function luminance(color) {
  const transform = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(color.r) + 0.7152 * transform(color.g) + 0.0722 * transform(color.b);
}

function contrast(foreground, background, underlay = { r: 255, g: 255, b: 255, a: 1 }) {
  const solidBackground = composite(background, underlay);
  const solidForeground = composite(foreground, solidBackground);
  const lighter = Math.max(luminance(solidForeground), luminance(solidBackground));
  const darker = Math.min(luminance(solidForeground), luminance(solidBackground));
  return (lighter + 0.05) / (darker + 0.05);
}

function collectObsidianColorDeclarations(ast) {
  const declarations = [];
  walk(ast, {
    visit: 'Declaration',
    enter(node) {
      if (node.property === '--callout-color' || /^--canvas-color-[1-6]$/.test(node.property)) {
        declarations.push({
          property: node.property,
          value: generate(node.value),
          selector: this.rule?.prelude ? generate(this.rule.prelude) : '(unknown selector)',
        });
      }
    },
  });
  return declarations;
}

function validateObsidianColors(ast, mode, variables) {
  const declarations = collectObsidianColorDeclarations(ast);
  const canvasNames = new Set(declarations.filter(({ property }) => property.startsWith('--canvas-color-')).map(({ property }) => property));
  const calloutDeclarations = declarations.filter(({ property }) => property === '--callout-color');
  assert(calloutDeclarations.length > 0, 'expected at least one --callout-color declaration');
  for (let index = 1; index <= 6; index += 1) {
    assert(canvasNames.has(`--canvas-color-${index}`), `expected --canvas-color-${index}`);
  }

  const calloutColors = [];
  for (const declaration of declarations) {
    try {
      const resolved = resolveVariables(declaration.value, variables);
      const recoveredErrors = [];
      const valueAst = parseCss(resolved, {
        context: 'value',
        onParseError(error) { recoveredErrors.push(error); },
      });
      const match = lexer.matchProperty('color', valueAst);
      assert(recoveredErrors.length === 0 && Boolean(match.matched),
        `${mode} ${declaration.property} must resolve to a complete CSS color in ${declaration.selector} (found ${resolved})`);
      if (declaration.property === '--callout-color' && match.matched) calloutColors.push(parseColor(resolved, variables));
    } catch (error) {
      failures.push(`${mode} ${declaration.property} could not be resolved in ${declaration.selector}: ${error.message}`);
    }
  }
  return calloutColors;
}

// Evaluate the explicit decorative overrides separately from Obsidian's semantic
// nav variables. This is intentionally limited to the two theme-owned rules.
export function validateSignageContrast(ast, mode) {
  const variables = collectModeVariables(ast, mode);
  const targets = new Map([
    ['selected-sign', 'body:not(.tk-minimal) .nav-file-title.is-active'],
    ['brand-sign', 'body:not(.tk-minimal) .workspace-leaf-content[data-type="file-explorer"] .nav-files-container::before'],
  ]);
  const rules = new Map([...targets.keys()].map((name) => [name, new Map()]));
  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (rule.prelude?.type !== 'SelectorList' || this.atrule) return;
      rule.prelude.children.forEach((selector) => {
        for (const [name, target] of targets) {
          if (generate(selector) !== target) continue;
          rule.block.children.forEach((declaration) => {
            if (declaration.type === 'Declaration') {
              rules.get(name).set(declaration.property, generate(declaration.value).trim());
            }
          });
        }
      });
    },
  });

  const errors = [];
  const results = {};
  for (const [name, declarations] of rules) {
    const foreground = declarations.get('color');
    const background = declarations.get('background-color');
    const signToken = /^var\(--tk-sign-(?:paper|ink)\)$/;
    if (!signToken.test(foreground ?? '') || !signToken.test(background ?? '')) {
      errors.push(`${mode} ${name} must declare color and an opaque background-color using the sign paper/ink tokens`);
      continue;
    }
    try {
      const foregroundColor = parseColor(foreground, variables);
      const backgroundColor = parseColor(background, variables);
      if (foregroundColor.a !== 1 || backgroundColor.a !== 1) {
        errors.push(`${mode} ${name} colors must be opaque`);
      }
      results[name] = contrast(foregroundColor, backgroundColor);
      if (results[name] < 4.5) errors.push(`${mode} ${name} contrast is ${results[name].toFixed(2)}:1; expected at least 4.5:1`);
    } catch (error) {
      errors.push(`${mode} ${name} colors could not be resolved: ${error.message}`);
    }
  }
  return { errors, results };
}

function validateContrast(ast, mode) {
  const variables = collectModeVariables(ast, mode);
  const palette = [
    '--tk-background', '--tk-sidebar', '--tk-raised', '--tk-text', '--tk-muted', '--tk-faint',
    '--tk-border', '--tk-border-strong', '--tk-sea', '--tk-rose', '--tk-gold', '--tk-violet',
    '--tk-on-accent', '--tk-sea-rgb', '--tk-rose-rgb', '--tk-gold-rgb', '--tk-violet-rgb',
  ];
  for (const variable of palette) assert(variables.has(variable), `${mode} palette is missing ${variable}`);

  const color = (name) => {
    if (!variables.has(name)) throw new Error(`${mode} mode is missing ${name}`);
    return parseColor(variables.get(name), variables);
  };
  const backgrounds = ['--background-primary', '--background-secondary', '--background-primary-alt'].map(color);
  const minAgainstSurfaces = (foregroundName) => Math.min(...backgrounds.map((background) => contrast(color(foregroundName), background)));
  const primary = color('--background-primary');
  const secondary = color('--background-secondary');
  const selection = composite(color('--text-selection'), primary);
  const navHover = composite(color('--nav-item-background-hover'), secondary);
  const navActive = composite(color('--nav-item-background-active'), secondary);
  const calloutColors = validateObsidianColors(ast, mode, variables);
  const calloutBackgrounds = calloutColors.map((calloutColor) => composite({ ...calloutColor, a: calloutColor.a * 0.08 }, primary));
  const unresolvedLink = variables.has('--link-unresolved-color') ? '--link-unresolved-color' : '--link-color';
  const tintedLinkColors = [
    '--link-color', '--link-color-hover', '--link-external-color', '--link-external-color-hover', unresolvedLink,
  ].map(color);
  const tagBackground = composite(color('--tag-background'), primary);
  const tagHoverBackground = composite(color('--tag-background-hover'), primary);

  const results = {
    normal: minAgainstSurfaces('--text-normal'),
    muted: minAgainstSurfaces('--text-muted'),
    link: contrast(color('--link-color'), primary),
    'link-hover': contrast(color('--link-color-hover'), primary),
    external: Math.min(
      contrast(color('--link-external-color'), primary),
      contrast(color('--link-external-color-hover'), primary),
    ),
    unresolved: contrast(color(unresolvedLink), primary),
    button: Math.min(
      contrast(color('--text-on-accent'), color('--interactive-accent')),
      contrast(color('--text-on-accent'), color('--interactive-accent-hover')),
    ),
    selection: contrast(color('--text-normal'), selection),
    tag: Math.min(
      contrast(color('--tag-color'), tagBackground),
      contrast(color('--tag-color'), tagHoverBackground),
    ),
    callout: Math.min(...calloutColors.map((calloutColor, index) => contrast(calloutColor, calloutBackgrounds[index]))),
    'tinted-link': Math.min(...calloutBackgrounds.flatMap((background) => (
      tintedLinkColors.map((linkColor) => contrast(linkColor, background))
    ))),
    state: Math.min(
      contrast(color('--nav-item-color-hover'), navHover),
      contrast(color('--nav-item-color-active'), navActive),
    ),
    focus: Math.min(...backgrounds.map((background) => contrast(color('--background-modifier-border-focus'), background))),
  };

  for (const [label, ratio] of Object.entries(results)) {
    const target = label === 'focus' ? 3 : 4.5;
    assert(ratio >= target, `${mode} ${label} contrast is ${ratio.toFixed(2)}:1; expected at least ${target}:1`);
  }
  const signage = validateSignageContrast(ast, mode);
  failures.push(...signage.errors);
  Object.assign(results, signage.results);
  return results;
}

function formatContrast(results) {
  return Object.entries(results).map(([label, ratio]) => `${label} ${ratio.toFixed(2)}`).join(', ');
}

async function main() {
  const [manifestText, packageText, ...sourceTexts] = await Promise.all([
    readFile(resolve(root, 'manifest.json'), 'utf8'),
    readFile(resolve(root, 'package.json'), 'utf8'),
    ...sourceFiles.map((name) => renderSource(name)),
  ]);
  const manifest = JSON.parse(manifestText);
  const packageJson = JSON.parse(packageText);
  validateManifest(manifest, packageJson);

  const expectedCss = `/* Tsukuyomi ${manifest.version} | Generated from src/; edit source files, then npm run build. */\n\n${sourceFiles
    .map((name, index) => `/* Source: ${name} */\n${sourceTexts[index].trim()}\n`)
    .join('\n')}`;
  const [rootCss, distributionCss, distributionManifest] = await Promise.all([
    readFile(resolve(root, 'theme.css'), 'utf8'),
    readFile(resolve(root, 'dist', 'Tsukuyomi', 'theme.css'), 'utf8'),
    readFile(resolve(root, 'dist', 'Tsukuyomi', 'manifest.json'), 'utf8'),
  ]);
  assert(rootCss === expectedCss, 'root theme.css is stale or differs from the deterministic source build');
  assert(distributionCss === expectedCss, 'dist/Tsukuyomi/theme.css differs from the deterministic source build');
  assert(distributionManifest === manifestText, 'dist/Tsukuyomi/manifest.json differs from manifest.json');

  let ast;
  try {
    const recoveredParseErrors = [];
    ast = parseCss(rootCss, {
      positions: true,
      parseCustomProperty: true,
      onParseError(error) { recoveredParseErrors.push(error); },
    });
    for (const error of recoveredParseErrors) {
      failures.push(`theme.css recovered syntax error: ${error.formattedMessage ?? error.message}`);
    }
  } catch (error) {
    failures.push(`theme.css syntax error: ${error.formattedMessage ?? error.message}`);
    ast = null;
  }

  const settingsCount = validateSettings(sourceTexts.join('\n'));
  let cssStats = { validatedValues: 0, dynamicValues: 0, unknownValues: 0 };
  const contrastResults = new Map();
  if (ast) {
    cssStats = validateCss(ast, rootCss);
    for (const mode of ['dark', 'light']) {
      try {
        contrastResults.set(mode, validateContrast(ast, mode));
      } catch (error) {
        failures.push(`${mode} contrast could not be evaluated: ${error.message}`);
      }
    }
  }

  if (failures.length) {
    console.error(`Check failed (${failures.length}):`);
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(`✓ manifest: Tsukuyomi ${manifest.version}, Obsidian >=${manifest.minAppVersion}`);
  console.log(`✓ build: ${sourceFiles.length} ordered sources match root and dist (${(Buffer.byteLength(rootCss) / 1024).toFixed(1)} KiB)`);
  console.log(`✓ CSS: parsed; ${cssStats.validatedValues} property values checked, ${cssStats.dynamicValues} dynamic and ${cssStats.unknownValues} unknown/vendor skipped`);
  console.log(`✓ Style Settings: 1 YAML block, ${settingsCount} valid options`);
  for (const [mode, results] of contrastResults) console.log(`✓ ${mode} contrast: ${formatContrast(results)}`);
  console.log('✓ reading guard: explicit note selectors checked for image backgrounds, text shadows and generated decoration');
  console.log('✓ policy: self-contained graphics; three guarded empty-scene animations and short UI transitions; no remote imports, backdrop filters, forced editor positioning, or user-font overrides');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
