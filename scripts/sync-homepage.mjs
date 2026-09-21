import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const THEME_REPOSITORY = 'kuguya-AI-app-develop/tsukuyomi-Obsidian-theme';
export const SITE_REPOSITORY = 'ArisaTaki/roku-homepage';
export const REQUIRED_ASSETS = ['manifest.json', 'theme.css', 'SHA256SUMS.txt'];

export function assertVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error('Expected a stable release version such as 1.2.0 (without v, prerelease suffixes or flags).');
  }
  return version;
}

/** Use the existing gh session; never extract a token or invoke a shell. */
export function runGh(args, { cwd = process.cwd() } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn('gh', args, {
      cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'], timeout: 180_000,
      env: { ...process.env, GH_PROMPT_DISABLED: '1' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolveRun(stdout.trim());
      else reject(new Error(`gh ${args.slice(0, 2).join(' ')} failed (${signal || code}): ${stderr.trim() || 'no diagnostic output'}`));
    });
  });
}

export async function syncHomepage(version, { run = runGh } = {}) {
  assertVersion(version);
  const repository = JSON.parse(await run(['repo', 'view', THEME_REPOSITORY, '--json', 'isPrivate']));
  if (repository.isPrivate !== false) throw new Error('The theme repository must be public before syncing the website.');
  const release = JSON.parse(await run([
    'release', 'view', version, '--repo', THEME_REPOSITORY,
    '--json', 'tagName,isDraft,isPrerelease,publishedAt,assets,url',
  ]));
  if (release.tagName !== version || release.isDraft !== false || release.isPrerelease !== false
      || !release.publishedAt || !Number.isFinite(Date.parse(release.publishedAt))) {
    throw new Error(`${version} is not a published stable release; website dispatch was skipped.`);
  }
  for (const name of REQUIRED_ASSETS) {
    const assets = release.assets?.filter(asset => asset.name === name) ?? [];
    if (assets.length !== 1 || !Number.isSafeInteger(assets[0].size) || assets[0].size <= 0) {
      throw new Error(`${version} is missing a complete ${name} release asset; website dispatch was skipped.`);
    }
  }
  try {
    await run([
      'workflow', 'run', 'deploy.yml', '--repo', SITE_REPOSITORY,
      '--ref', 'main', '-f', `theme_version=${version}`,
    ]);
  } catch (cause) {
    throw new Error(`Release ${version} is already published. Website dispatch failed; retry only: npm run sync:site -- ${version}\n${cause.message}`, { cause });
  }
  return { version, releaseUrl: release.url };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: npm run sync:site -- <version>');
    const result = await syncHomepage(process.argv[2]);
    console.log(`Requested irop.one deployment for Tsukuyomi ${result.version}. Follow GitHub Actions in ${SITE_REPOSITORY}; dispatch is not deployment completion.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
