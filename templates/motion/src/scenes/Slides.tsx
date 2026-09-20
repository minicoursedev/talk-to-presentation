import {Img, makeScene2D} from '@motion-canvas/2d';
import {createRef} from '@motion-canvas/core';
import prepared from '../prepared.json';

// Baseline: exact illustrated-HTML composition, visible first frame and direct cuts.
// For object-level animation replace this case's scene with native Motion Canvas layers.
export default makeScene2D(function* (view) {
  const layers = prepared.pages.map(() => createRef<Img>());
  prepared.pages.forEach((page, index) => view.add(
    <Img ref={layers[index]} src={`/slides/page-${page.page}.png`}
      width={prepared.width} height={prepared.height} opacity={index === 0 ? 1 : 0} />
  ));
  for (let index = 0; index < prepared.pages.length; index++) {
    if (index > 0) { layers[index]().opacity(1); layers[index-1]().opacity(0); }
    // Yield exact frame counts; waitFor can advance a cut one frame early.
    for (let frame = 0; frame < prepared.pages[index].frames; frame++) yield;
  }
});
