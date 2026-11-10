// Navigation owns the clock; geometry keeps its normalized trajectories.
export const SELECTOR_TIMING=Object.freeze({entry:760,adjacent:560,jump:860,close:560,minimum:160});
export const selectorTravelMs=distance=>Math.min(SELECTOR_TIMING.jump,Math.max(SELECTOR_TIMING.minimum,Math.abs(distance)*SELECTOR_TIMING.adjacent));
