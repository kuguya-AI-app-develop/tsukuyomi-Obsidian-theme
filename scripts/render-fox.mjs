// Compact fox-costume head redrawn from the user's Iroha reference.
// Coordinates belong to the shared 1200 × 800 empty-page canvas.
export function renderFox({ animated = false } = {}) {
  const tilt = animated
    ? '<animateTransform attributeName="transform" type="rotate" values="-1.5 405 190;1.5 405 190;-1.5 405 190" keyTimes="0;.5;1" dur="7s" repeatCount="indefinite" calcMode="linear"/>'
    : '';
  return `<g stroke="#5c403e" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${tilt}<path d="M389 170L370 147Q367 144 368 151L372 181ZM420 168L436 147Q439 144 438 151L435 181Z" fill="#79534c"/><path d="M385 170L373 153L376 176ZM424 169L434 153L432 176Z" fill="#d994a2" stroke="#f2c3c0"/><path d="M374 181Q377 160 399 156Q422 152 433 170Q440 180 436 192L442 198L435 203L439 208L429 211Q422 221 408 226Q394 227 383 217L373 211L378 205L369 200L375 194Q371 188 374 181Z" fill="#f5e5c7"/><path d="M376 180Q382 160 397 159L405 153L414 159Q427 161 432 177Q425 175 420 182L412 179L405 185L397 180L390 183Q384 177 376 180Z" fill="#faefd8" stroke="none"/><path d="M374 185Q386 176 398 181Q405 186 413 180Q426 174 436 184L435 196Q426 190 417 195Q407 201 398 196Q388 190 376 197Z" fill="#d9a06f"/><path d="M382 188Q389 184 396 188M415 187Q422 183 429 187" fill="none" stroke="#5c403e" stroke-width="3"/><path d="M384 196Q390 200 396 196M415 196Q422 200 428 195" fill="none" stroke="#5c403e" stroke-width="2.4"/><ellipse cx="406" cy="205" rx="3.2" ry="2.1" fill="#5c403e"/><path d="M402 211Q406 214 410 211" fill="none"/></g>`;
}
