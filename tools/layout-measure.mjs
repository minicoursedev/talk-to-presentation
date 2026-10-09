// Passed to page.evaluate: keep this function independent of Node and module state.
export function measureLayout({textInImage = false, tolerance = 2} = {}) {
  const slide = document.querySelector('.slide.active');
  if (!slide) throw Error('No active slide');
  const frame = slide.closest('.short-frame') || slide;
  const frameRect = frame.getBoundingClientRect();
  const issues = [], limitations = new Set(), groups = new Map();
  let hiddenTextNodes = 0;
  const round = n => Math.round(n * 10) / 10;
  const rect = r => ({left: r.left, top: r.top, right: r.right, bottom: r.bottom,
    width: r.width, height: r.height});
  const label = e => {
    if (e.id) return '#' + e.id;
    const parts = [];
    for (let p = e; p && p !== frame; p = p.parentElement) {
      const siblings = p.parentElement ? [...p.parentElement.children].filter(x => x.tagName === p.tagName) : [];
      parts.unshift(p.tagName.toLowerCase() + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(p) + 1})` : ''));
    }
    return parts.join(' > ') || frame.tagName.toLowerCase();
  };
  const excluded = e => !!e.closest('[data-layout-role="ignore"], [data-layout-role="background"], [data-layout-role="decoration"], .progress, script, style, noscript, template');
  const visible = e => {
    if (e.closest('.slide') && e.closest('.slide') !== slide) return false;
    if (e.closest('.text-in-image .content')) return false;
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse' || Number(s.opacity) === 0) return false;
      // Common accessible-only text: not visible content and not a layout failure.
      if (s.clipPath === 'inset(50%)') return false;
    }
    return true;
  };
  const outside = (r, b, x = true, y = true) => Object.fromEntries([
    ['left', x ? b.left - r.left : 0], ['right', x ? r.right - b.right : 0],
    ['top', y ? b.top - r.top : 0], ['bottom', y ? r.bottom - b.bottom : 0],
  ].filter(([, n]) => n > tolerance).map(([side, n]) => [side, round(n)]));
  const textBlock = e => {
    for (let p = e; p && p !== frame; p = p.parentElement) {
      if (p.matches('.main-text, .sub-text, .brand, .counter, [data-layout-role="content"], h1, h2, h3, h4, h5, h6, p, li, pre, figcaption, td, th')) return p;
      if (!['inline', 'contents'].includes(getComputedStyle(p).display)) return p;
    }
    return e;
  };
  const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, e = node.parentElement;
    if (!node.textContent.trim() || excluded(e) || (e.closest('.slide') && e.closest('.slide') !== slide)) continue;
    if (!visible(e)) {hiddenTextNodes++; continue;}
    const range = document.createRange(); range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(rect);
    if (!rects.length) continue;
    const block = textBlock(e);
    if (!groups.has(block)) groups.set(block, {element: block, kind: 'text', pieces: [], text: ''});
    const item = groups.get(block);
    item.pieces.push(...rects.map(r => ({rect: r, element: e})));
    item.text += node.textContent;
  }
  const images = [...frame.querySelectorAll('img')].filter(e => !excluded(e) && visible(e));
  for (const e of images) {
    const r = rect(e.getBoundingClientRect());
    if (!r.width || !r.height) continue;
    // A full-slide illustration is allowed behind text; its interior is unmeasured.
    const background = e.matches('.art') || (r.width >= frameRect.width * .95 && r.height >= frameRect.height * .95);
    groups.set(e, {element: e, kind: 'image', background, pieces: [{rect: r, element: e}], text: ''});
  }
  for (const e of frame.querySelectorAll('[data-layout-role="content"]')) {
    if (groups.has(e) || excluded(e) || !visible(e)) continue;
    const r = rect(e.getBoundingClientRect());
    if (r.width && r.height) groups.set(e, {element: e, kind: 'block', pieces: [{rect: r, element: e}], text: ''});
  }
  const candidates = [...groups.values()];
  for (const item of candidates) {
    const overflow = {}, clipped = new Map();
    for (const piece of item.pieces) {
      const r = piece.rect;
      for (const [side, amount] of Object.entries(outside(r, frameRect))) overflow[side] = Math.max(overflow[side] || 0, amount);
      for (let p = piece.element; p && p !== frame; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.clipPath !== 'none' || s.maskImage !== 'none') limitations.add('complex-clips-or-masks');
        if (s.transform !== 'none') {
          const matrix = new DOMMatrixReadOnly(s.transform);
          if (!matrix.is2D || Math.abs(matrix.b) > .001 || Math.abs(matrix.c) > .001) limitations.add('rotated-or-3d-bounds');
        }
        const clipX = /^(hidden|clip|scroll|auto)$/.test(s.overflowX);
        const clipY = /^(hidden|clip|scroll|auto)$/.test(s.overflowY);
        if ((!clipX && !clipY) || !p.offsetWidth || !p.offsetHeight) continue;
        const b = p.getBoundingClientRect(), sx = b.width / p.offsetWidth, sy = b.height / p.offsetHeight;
        const bounds = {left: b.left + p.clientLeft * sx, top: b.top + p.clientTop * sy};
        bounds.right = bounds.left + p.clientWidth * sx;
        bounds.bottom = bounds.top + p.clientHeight * sy;
        const excess = outside(r, bounds, clipX, clipY);
        if (Object.keys(excess).length) {
          const amounts = clipped.get(p) || {};
          for (const [side, n] of Object.entries(excess)) amounts[side] = Math.max(amounts[side] || 0, n);
          clipped.set(p, amounts);
        }
      }
    }
    const base = {element: label(item.element), ...(item.text ? {text: item.text.trim().replace(/\s+/g, ' ').slice(0, 60)} : {})};
    if (Object.keys(overflow).length) issues.push({code: 'outside-frame', severity: 'error', ...base, pixels: overflow});
    // Frame overflow already describes clipping by the full-slide boundary.
    for (const [container, pixels] of clipped) {
      if (container === slide && Object.keys(overflow).length) continue;
      issues.push({code: 'clipped-content', severity: 'error', ...base, container: label(container), pixels});
    }
  }
  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    if (a.background || a.element.closest('[data-layout-allow-overlap]')) continue;
    for (const b of candidates.slice(i + 1)) {
      if (b.background || b.element.closest('[data-layout-allow-overlap]') || a.element.contains(b.element) || b.element.contains(a.element)) continue;
      // Font selection rectangles can extend beyond line boxes without visible ink
      // collisions. Require block overlap too; this is not a pixel/ink detector.
      const ar = a.element.getBoundingClientRect(), br = b.element.getBoundingClientRect();
      if (Math.min(ar.right, br.right) - Math.max(ar.left, br.left) <= tolerance ||
          Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top) <= tolerance) continue;
      let intersection = null;
      for (const x of a.pieces) for (const y of b.pieces) {
        const w = Math.min(x.rect.right, y.rect.right) - Math.max(x.rect.left, y.rect.left);
        const h = Math.min(x.rect.bottom, y.rect.bottom) - Math.max(x.rect.top, y.rect.top);
        if (w > tolerance && h > tolerance && (!intersection || w * h > intersection.width * intersection.height)) intersection = {width: round(w), height: round(h)};
      }
      if (intersection) issues.push({code: 'possible-overlap', severity: 'warning', element: label(a.element), other: label(b.element), pixels: intersection});
    }
  }
  const slideText = candidates.filter(x => x.kind === 'text' && slide.contains(x.element)).length;
  if (textInImage || slide.classList.contains('text-in-image')) limitations.add('text-in-image');
  if (!slideText) limitations.add('no-visible-dom-text');
  if (images.length) limitations.add('image-interiors');
  if ([frame, ...frame.querySelectorAll('*')].some(e => {
    if (!visible(e) || excluded(e)) return false;
    if (getComputedStyle(e).backgroundImage !== 'none') return true;
    return ['::before', '::after'].some(p => !['none', 'normal', '""'].includes(getComputedStyle(e, p).content));
  })) limitations.add('css-backgrounds-or-pseudo-elements');
  if ([...frame.querySelectorAll('canvas, svg, iframe')].some(e => visible(e) && !excluded(e))) limitations.add('canvas-svg-or-iframe-interiors');
  if (frame.getAnimations({subtree: true}).some(a => a.playState === 'running' || a.playState === 'pending')) limitations.add('active-animation');
  return {frame: {width: round(frameRect.width), height: round(frameRect.height)},
    measured: {textBlocks: candidates.filter(x => x.kind === 'text').length, images: images.length,
      annotatedBlocks: candidates.filter(x => x.kind === 'block').length, hiddenTextNodes},
    limitations: [...limitations], issues};
}
