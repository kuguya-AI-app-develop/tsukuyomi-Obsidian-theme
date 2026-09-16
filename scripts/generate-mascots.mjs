import { lstat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { renderMendako } from './render-mendako.mjs';
import { renderFox } from './render-fox.mjs';

const assets = new URL('../assets/', import.meta.url);

const motion = {
  tail: '<animateTransform attributeName="transform" type="rotate" values="-7 444 270;7 444 270;-7 444 270" keyTimes="0;.5;1" dur="4s" repeatCount="indefinite" calcMode="linear"/>',
  float: '<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" keyTimes="0;.5;1" dur="5s" repeatCount="indefinite" calcMode="linear"/>',
  gills: '<animateTransform attributeName="transform" type="rotate" values="-3 793 253;3 793 253;-3 793 253" keyTimes="0;.5;1" dur="6s" repeatCount="indefinite" calcMode="linear"/>',
};

export function renderMascots({ animated = false } = {}) {
  const animate = (name) => animated ? motion[name] : '';
  const mendako = renderMendako({ animated });
  const fox = renderFox({ animated });
  const dog = `<g transform="translate(-225 0)" stroke-width="1.2"><g>${animate('tail')}<path d="M445 265Q420 246 397 254L389 260Q384 250 390 240Q377 254 380 278Q383 299 404 302Q428 301 449 281Z" fill="#58c8c4"/><path d="M442 266Q420 251 399 258L393 263Q388 256 391 249Q385 258 386 277Q389 294 405 296Q426 296 445 278Z" fill="#e2b66f"/></g><path d="M447 252Q428 251 419 271Q410 293 426 302Q440 310 455 301L465 282L462 257Z" fill="#e2b66f"/><path d="M455 241Q433 244 421 268Q415 285 431 299L454 288L467 251Z" fill="#668d53"/><path d="M457 247Q440 261 432 290M447 258L433 252M440 272L424 268" fill="none" stroke="#405c3a"/><path d="M457 239Q449 250 449 270L447 300Q455 308 466 303Q475 310 486 304Q498 308 502 299L497 262Q493 244 480 239Z" fill="#e2b66f"/><path d="M445 304Q456 311 469 304Q461 298 449 297M477 304Q490 311 503 302Q492 297 479 298" fill="#58c8c4" stroke="none"/><path d="M447 297Q457 303 469 298L469 304Q458 311 447 302ZM478 298Q490 304 502 297L502 303Q490 311 478 304Z" fill="#8e6d6c"/><path d="M472 267L471 302" fill="none"/><path d="M439 209Q405 204 399 169Q423 168 454 188ZM480 184L494 155Q497 151 501 156Q510 176 505 202" fill="#58c8c4"/><path d="M440 204Q412 199 405 173Q426 174 453 188ZM483 185L496 158Q498 155 500 159Q507 177 503 199" fill="#e2b66f"/><path d="M438 197Q418 191 411 176L420 177L424 181L430 178L436 184L449 187M486 183L497 164L499 171L503 173L501 194" fill="#f7eed8"/><path d="M429 207Q431 188 450 181Q474 173 494 188Q510 200 510 219Q509 239 491 249Q471 259 449 251Q431 246 426 230Q423 218 429 207Z" fill="#e2b66f"/><ellipse cx="439" cy="228" rx="10" ry="8" fill="#ed927d" opacity=".28" stroke="none"/><ellipse cx="498" cy="225" rx="9" ry="8" fill="#ed927d" opacity=".28" stroke="none"/><ellipse cx="450" cy="203" rx="9" ry="6" fill="#f7eed8" transform="rotate(-28 450 203)" stroke="none"/><ellipse cx="479" cy="200" rx="9" ry="6" fill="#f7eed8" transform="rotate(22 479 200)" stroke="none"/><path d="M440 211Q445 208 449 210M489 209Q494 207 498 210" fill="none" stroke="#343343" stroke-width="2.2"/><ellipse cx="470" cy="229" rx="20" ry="17" fill="#f7eed8"/><ellipse cx="471" cy="222" rx="2.5" ry="1.4" fill="#e2b66f"/><path d="M466 232Q470 236 475 232" fill="none"/><path d="M468 234Q471 241 475 234Z" fill="#d96f72"/><path d="M438 240Q445 252 455 253L460 243Q450 243 438 240Z" fill="#f7eed8"/><path d="M455 253L466 256L468 244L460 243Z" fill="#d96f72"/><path d="M481 244L484 256Q494 253 501 241Q491 244 481 244Z" fill="#d96f72"/><path d="M474 244L481 244L484 256L475 259Z" fill="#f7eed8"/><circle cx="470" cy="254" r="13" fill="#58c8c4"/><path d="M459 258Q470 269 481 258Q478 267 470 268Q462 267 459 258Z" fill="#f7eed8" stroke="none"/><circle cx="466" cy="249" r="3" fill="#f7eed8" stroke="none"/><polygon points="456 263 462 268 456 275 450 269" fill="#f7eed8"/><polygon points="453 275 460 281 453 288 447 282" fill="#f7eed8"/><polygon points="451 288 458 294 451 302 445 295" fill="#f7eed8"/><polygon points="479 263 486 268 481 275 475 269" fill="#f7eed8"/><polygon points="482 275 489 281 483 288 477 282" fill="#f7eed8"/><polygon points="484 288 491 294 486 302 480 295" fill="#f7eed8"/></g>`;
  const fushi = `<g transform="translate(225 -20)"><g>${animate('float')}<path d="M712 283Q713 259 737 251Q758 244 777 247Q796 240 811 250Q821 259 817 276Q812 294 790 301Q765 309 738 304Q715 301 712 283Z" fill="#58c8c4" stroke="none"/><path d="M714 278Q711 273 716 269Q713 263 719 261Q720 254 727 256Q731 249 738 251Q743 245 750 248Q757 242 764 246Q771 242 778 245Q786 239 792 244Q801 239 806 246Q814 245 815 252Q821 256 817 263Q822 269 817 274Q819 281 812 283Q810 290 802 290Q798 297 790 296Q784 303 775 299Q768 305 760 300Q752 305 745 300Q736 303 731 297Q722 299 721 292Q713 289 716 283Q711 283 714 278Z" fill="#fbf6e8"/><path d="M737 257Q731 249 735 244Q741 242 746 253M763 251Q758 242 763 236Q770 236 773 248L769 258Z" fill="#494653"/><path d="M738 253Q736 249 739 247M765 250Q763 244 766 241Q770 243 770 250" fill="none" stroke="#b49ab7"/><g>${animate('gills')}<polygon points="781 249 777 240 785 241 788 232 795 238 802 231 804 241 814 239 810 249 816 254 805 257 800 264 793 257 783 260" fill="#3d3b49"/><path d="M786 247L793 252L804 247M793 252L799 241" fill="none" stroke="#d5bcc4"/></g><g fill="#514c5d" stroke="none"><circle cx="726" cy="278" r="4"/><circle cx="745" cy="292" r="4"/><circle cx="738" cy="272" r="1.5"/><circle cx="761" cy="286" r="1.5"/><circle cx="785" cy="277" r="1.5"/><circle cx="805" cy="266" r="1.5"/></g></g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><title>InuDOGE, Iroha fox, FUSHI, and a pink companion</title><desc>Fan-drawn vector renditions of InuDOGE, an Iroha fox costume, FUSHI, and a pink companion.${animated ? ' They move gently.' : ''}</desc><g stroke="#343343" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${dog}${fox}${fushi}${mendako}</g></svg>`;
}

async function safeWrite(name, contents) {
  const assetsPath = fileURLToPath(assets).replace(/[\\/]$/, '');
  const directory = await lstat(assetsPath);
  if (directory.isSymbolicLink() || !directory.isDirectory()) throw new Error('Refusing unsafe assets directory.');
  const destination = new URL(name, assets);
  try {
    const output = await lstat(destination);
    if (output.isSymbolicLink() || !output.isFile()) throw new Error(`Refusing unsafe mascot output: ${name}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(destination, contents, 'utf8');
}

async function main() {
  const staticSvg = renderMascots();
  const livingSvg = renderMascots({ animated: true });
  if ([staticSvg, livingSvg].some((svg) => Buffer.byteLength(svg) >= 10 * 1024)) {
    throw new Error('A mascot artwork exceeds the 10 KiB asset budget.');
  }
  await safeWrite('tsukuyomi-mascots.svg', staticSvg);
  await safeWrite('tsukuyomi-mascots-living.svg', livingSvg);
  console.log(`Generated mascot SVGs (${Buffer.byteLength(staticSvg)} + ${Buffer.byteLength(livingSvg)} bytes).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
