import { Spacing } from "@/constants/theme";

export const GRID_COLUMNS = 2;
/** Padding around each tile; neighbouring tiles end up `2 * GRID_CELL_PADDING` apart. */
export const GRID_CELL_PADDING = Spacing.one;
/** Horizontal list padding that, plus the cell padding, lines the tiles up with the screen margin. */
export const GRID_INSET = Spacing.three - GRID_CELL_PADDING;
