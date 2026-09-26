import { Dimensions } from 'react-native';

/** Native logo and splash transitions. */
export const ANIMATION_DURATION = 600;
export const WEB_ANIMATION_DURATION = 300;
/** The glow behind the logo spins slowly for this long. */
export const GLOW_ROTATION_DURATION = 4 * 60 * 1000;
/** The logo background starts large enough to cover the screen, then shrinks into place. */
export const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
