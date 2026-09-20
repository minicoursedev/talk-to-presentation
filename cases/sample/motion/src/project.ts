import {makeProject} from '@canvas-commons/core';
import scene from './scenes/Slides?scene';
import prepared from './prepared.json';
export default makeProject({name: 'presentation', scenes: [scene], ...(prepared.audio ? {audio: '/timeline.wav'} : {})});
