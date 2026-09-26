/** Keeps very tall images from pushing everything else off screen; the viewer shows them in full. */
export const MIN_IMAGE_ASPECT_RATIO = 9 / 16;
/** Used until the image loads and reports its real size; matches the grid tiles. */
export const DEFAULT_IMAGE_ASPECT_RATIO = 4 / 5;
export const PLACEHOLDER_ASPECT_RATIO = 16 / 9;

export const DESCRIPTION_PREVIEW_LINES = 4;
/** Descriptions longer than this (in characters) start collapsed with a "More" toggle. */
export const DESCRIPTION_COLLAPSE_THRESHOLD = 240;
