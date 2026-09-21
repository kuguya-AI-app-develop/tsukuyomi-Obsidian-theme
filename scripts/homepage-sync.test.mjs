import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { parseReleaseArguments, publishRelease, validateReleaseAssets } from './publish-release.mjs';
import { assertVersion, SITE_REPOSITORY, syncHomepage, THEME_REPOSITORY } from './sync-homepage.mjs';

const version = '1.2.0';
const release = {
  tagName: version, isDraft: false, isPrerelease: false, publishedAt: '2026-09-17T13:59:36Z',
  url: `https://github.com/${THEME_REPOSITORY}/releases/tag/${version}`,
  assets: ['manifest.json', 'theme.css', 'SHA256SUMS.txt'].map(name => ({ name, size: 100 })),
};
const dispatch = ['workflow', 'run', 'deploy.yml', '--repo', SITE_REPOSITORY, '--ref', 'main', '-f', `theme_version=${version}`];

function ghFixture({ releaseData = release, privateRepo = false, failCreate = false, failDispatch = false, missingRelease = false } = {}) {
  const calls = [];
  const run = async args => {
    calls.push(args);
    if (args[0] === 'repo') return JSON.stringify({ isPrivate: privateRepo });
    if (args[0] === 'release' && args[1] === 'view') {
      if (missingRelease) throw new Error('release not found');
      return JSON.stringify(releaseData);
    }
    if (args[0] === 'release' && args[1] === 'create') {
      if (failCreate) throw new Error('create failed');
      return release.url;
    }
    if (args[0] === 'workflow') {
      if (failDispatch) throw new Error('dispatch unavailable');
      return '';
    }
    throw new Error(`Unexpected gh call: ${args.slice(0, 2).join(' ')}`);
  };
  return { calls, run };
}

async function filesFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'tsukuyomi-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bytes = {
    'manifest.json': JSON.stringify({ name: 'Tsukuyomi', version }),
    'theme.css': '/* Tsukuyomi 1.2.0 */\nbody { color: white; }\n',
    [`Tsukuyomi-${version}.zip`]: 'opaque existing zip fixture: this script does not package ZIPs',
  };
  for (const [name, data] of Object.entries(bytes)) await writeFile(join(root, name), data);
  await writeFile(join(root, 'package.json'), JSON.stringify({ version }));
  await writeFile(join(root, 'SHA256SUMS.txt'), Object.entries(bytes)
    .map(([name, data]) => `${createHash('sha256').update(data).digest('hex')}  ${name}`).join('\n') + '\n');
  const args = [...Object.keys(bytes), 'SHA256SUMS.txt', '--notes', 'A title with spaces, $(literal), `literal`, and\na newline.'];
  return { root, cwd: root, args };
}

test('stable versions reject flags, prefixes, prereleases and paths', () => {
  assert.equal(assertVersion(version), version);
  for (const value of ['', undefined, 'v1.2.0', '1.2.0-beta', '01.2.0', '../1.2.0', '--repo=x', '1.2.0\n']) {
    assert.throws(() => assertVersion(value));
  }
});

test('repository overrides and unpublished release flags are rejected before gh', () => {
  for (const flag of ['--repo', '--repo=x/y', '-R', '-Rx/y', '--draft', '-d', '--prerelease', '-p', '--verify-tag=false', '--unknown']) {
    assert.throws(() => parseReleaseArguments(['--notes', 'ok', flag]));
  }
  assert.throws(() => parseReleaseArguments(['theme.css']), /Provide/);
  assert.throws(() => parseReleaseArguments(['--notes-file', '-']), /stdin/);
});

test('existing public stable release dispatches the exact version to the fixed site', async () => {
  const gh = ghFixture();
  assert.deepEqual(await syncHomepage(version, gh), { version, releaseUrl: release.url });
  assert.deepEqual(gh.calls.at(-1), dispatch);
});

for (const [name, options] of [
  ['missing release', { missingRelease: true }],
  ['private repository', { privateRepo: true }],
  ['draft', { releaseData: { ...release, isDraft: true } }],
  ['prerelease', { releaseData: { ...release, isPrerelease: true } }],
  ['unpublished release', { releaseData: { ...release, publishedAt: null } }],
  ['wrong tag', { releaseData: { ...release, tagName: '1.1.0' } }],
  ['missing asset', { releaseData: { ...release, assets: release.assets.slice(1) } }],
  ['empty asset', { releaseData: { ...release, assets: release.assets.map(asset => ({ ...asset, size: 0 })) } }],
  ['duplicate asset', { releaseData: { ...release, assets: [...release.assets, release.assets[0]] } }],
]) {
  test(`${name} never dispatches`, async () => {
    const gh = ghFixture(options);
    await assert.rejects(syncHomepage(version, gh));
    assert.equal(gh.calls.some(args => args[0] === 'workflow'), false);
  });
}

test('dispatch failure reports the existing release and a safe retry command', async () => {
  const gh = ghFixture({ failDispatch: true });
  await assert.rejects(syncHomepage(version, gh), /already published[\s\S]*npm run sync:site -- 1\.2\.0/);
  const retry = ghFixture();
  await syncHomepage(version, retry);
  assert.equal(retry.calls.some(args => args[1] === 'create'), false);
});

test('successful publish preserves arguments exactly then dispatches once', async t => {
  const files = await filesFixture(t);
  const gh = ghFixture();
  await publishRelease(version, files.args, { ...files, ...gh });
  assert.deepEqual(gh.calls[0], ['release', 'create', version, ...files.args, '--verify-tag', '--repo', THEME_REPOSITORY]);
  assert.deepEqual(gh.calls.at(-1), dispatch);
  assert.equal(gh.calls.filter(args => args[0] === 'workflow').length, 1);
});

test('create failure does not dispatch or attempt to recreate', async t => {
  const files = await filesFixture(t);
  const gh = ghFixture({ failCreate: true });
  await assert.rejects(publishRelease(version, files.args, { ...files, ...gh }), /create failed/);
  assert.equal(gh.calls.length, 1);
});

test('post-publish failure tells the operator not to recreate the release', async t => {
  const files = await filesFixture(t);
  const gh = ghFixture({ failDispatch: true });
  await assert.rejects(publishRelease(version, files.args, { ...files, ...gh }), /has been created; do not recreate[\s\S]*npm run sync:site -- 1\.2\.0/);
  assert.equal(gh.calls.filter(args => args[1] === 'create').length, 1);
});

test('local version mismatch, tampered checksum and omitted attachment fail before gh', async t => {
  const files = await filesFixture(t);
  const gh = ghFixture();
  await writeFile(join(files.root, 'package.json'), JSON.stringify({ version: '1.1.0' }));
  await assert.rejects(publishRelease(version, files.args, { ...files, ...gh }), /must match/);
  await writeFile(join(files.root, 'package.json'), JSON.stringify({ version }));
  const checksum = await readFile(join(files.root, 'SHA256SUMS.txt'), 'utf8');
  await writeFile(join(files.root, 'SHA256SUMS.txt'), checksum.replace(/^[a-f\d]{64}/, '0'.repeat(64)));
  await assert.rejects(publishRelease(version, files.args, { ...files, ...gh }), /Checksum/);
  await writeFile(join(files.root, 'SHA256SUMS.txt'), checksum);
  await assert.rejects(publishRelease(version, files.args.filter(arg => arg !== 'theme.css'), { ...files, ...gh }), /theme.css/);
  await assert.rejects(publishRelease(version, files.args.filter(arg => arg !== `Tsukuyomi-${version}.zip`), { ...files, ...gh }), /attachment not supplied/);
  assert.equal(gh.calls.length, 0);
});

test('attachment labels and literal shell punctuation remain data', async t => {
  const files = await filesFixture(t);
  const args = files.args.map(arg => arg === 'theme.css' ? 'theme.css#Theme $(literal)' : arg);
  await validateReleaseAssets(version, args, files);
  assert.throws(() => parseReleaseArguments(['--notes=ok', '--']), /Unsupported/);
  await assert.rejects(validateReleaseAssets(version, [...files.args, 'private-notes.md'], files), /Unexpected release attachment/);
});
